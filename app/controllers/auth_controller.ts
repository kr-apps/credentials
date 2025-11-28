import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'
import EmailVerificationToken from '#models/email_verification_token'
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '#validators/auth_validator'
import AuthService from '#services/auth_service'
import authSecurityConfig from '#config/auth_security'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_email_notification'
import PasswordResetNotification from '#mails/password_reset_notification'
import AccountLockedNotification from '#mails/account_locked_notification'
import env from '#start/env'
import { buildLogtoClient } from '#services/logto_service'
import { logtoRuntimeConfig } from '#config/logto'

export default class AuthController {
  /**
   * Show registration page
   */
  async showRegister({ inertia }: HttpContext) {
    return inertia.render('auth/register')
  }

  /**
   * Handle user registration
   */
  async register({ request, response, session, auth }: HttpContext) {
    // Validate input
    const data = await request.validateUsing(registerValidator)

    // Create user
    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    })

    // Generate email verification token
    const { token } = await EmailVerificationToken.generateFor(
      user,
      authSecurityConfig.emailVerificationExpiry
    )

    // Send verification email
    await mail.send(new VerifyEmailNotification(user, token))

    // Log the user in
    await auth.use('web').login(user)

    // Redirect to verification prompt
    session.flash('success', 'Account created! Please check your email to verify your account.')
    return response.redirect('/email/verify')
  }

  /**
   * Show the login page or redirect to OAuth provider based on strategy
   */
  async showLogin(ctx: HttpContext) {
    const authStrategy = env.get('AUTH_STRATEGY')

    if (authStrategy === 'logto') {
      // Redirect to Logto OAuth
      const client = buildLogtoClient(ctx)
      await client.signIn({
        redirectUri: logtoRuntimeConfig.redirectUri,
      })
      return
    }

    return ctx.inertia.render('auth/login')
  }

  /**
   * Handle user login (local auth strategy only)
   */
  async login({ request, response, session, auth }: HttpContext) {
    // Validate input
    const { email, password, remember } = await request.validateUsing(loginValidator)

    // Find the user by email
    const user = await User.findBy('email', email)

    if (!user) {
      session.flash('errors', { email: 'Invalid credentials' })
      return response.redirect().back()
    }

    // Check if the account is locked
    const { isLocked, reason } = await AuthService.checkAccountStatus(
      user,
      authSecurityConfig.lockoutDuration
    )

    if (isLocked) {
      session.flash('error', reason || 'Account is locked')
      return response.redirect().back()
    }

    // Verify password
    try {
      await User.verifyCredentials(email, password)
    } catch (error) {
      // Failed login attempt
      await AuthService.handleFailedLogin(user, authSecurityConfig.maxLoginAttempts)

      // Check if the account should be locked now
      if (user.shouldBeLocked(authSecurityConfig.maxLoginAttempts)) {
        // Send account locked email
        await mail.send(new AccountLockedNotification(user, authSecurityConfig.lockoutDuration))

        session.flash(
          'error',
          `Account locked due to multiple failed login attempts. Try again in ${authSecurityConfig.lockoutDuration} minutes.`
        )
      } else {
        const attemptsLeft = authSecurityConfig.maxLoginAttempts - user.failedLoginAttempts
        session.flash('errors', {
          email: `Invalid credentials. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`,
        })
      }

      return response.redirect().back()
    }

    // Successful login
    await AuthService.handleSuccessfulLogin(user)

    // Log the user in with web guard
    await auth.use('web').login(user, remember)

    // Redirect to the intended page or dashboard
    session.flash('success', 'Welcome back!')
    return response.redirect().toPath(session.get('redirect_to') || '/dashboard')
  }

  /**
   * Handle OAuth callback (Logto strategy only)
   */
  async handleOAuthCallback(ctx: HttpContext) {
    const { request, response, session } = ctx
    const client = buildLogtoClient(ctx)

    try {
      const callbackUrl = request.completeUrl(true)

      // TEMPORAL: Logging para debugging
      console.log('=== LOGTO CALLBACK DEBUG ===')
      console.log('Callback URL received:', callbackUrl)
      console.log('Expected redirect URI:', logtoRuntimeConfig.redirectUri)
      console.log('APP_URL env var:', env.get('APP_URL'))
      console.log('============================')

      await client.handleSignInCallback(callbackUrl)

      // Verificar autenticación
      const isAuthenticated = await client.isAuthenticated()
      if (!isAuthenticated) {
        throw new Error('Not authenticated after callback')
      }

      const claims = await client.getIdTokenClaims()
      const email = claims.email ?? claims.username ?? claims.sub
      const randomPasswordHash = await hash.make(crypto.randomBytes(32).toString('hex'))

      const user = await User.firstOrCreate(
        { email },
        {
          fullName: claims.name ?? null,
          password: randomPasswordHash,
          emailVerifiedAt: DateTime.now(),
        }
      )

      // Update user info if needed
      if (!user.fullName && claims.name) {
        user.fullName = claims.name
      }
      if (!user.emailVerifiedAt) {
        user.emailVerifiedAt = DateTime.now()
      }
      if (user.isDirty()) {
        await user.save()
      }

      // CRÍTICO: Guardar sesión explícitamente
      await session.commit()

      return response.redirect('/dashboard')
    } catch (error) {
      session.clear()

      console.error('OAuth callback failed:', error)

      // Mensaje claro para el usuario
      session.flash('error', 'Failed to create your account. Please try again or contact support.')
      return response.redirect('/')
    }
  }

  /**
   * Handle user logout (adaptive based on strategy)
   */
  async logout(ctx: HttpContext) {
    const { response, session, auth, inertia } = ctx
    const authStrategy = env.get('AUTH_STRATEGY')

    if (authStrategy === 'logto') {
      const sessionKeys = [
        'logto.idToken',
        'logto.accessToken',
        'logto.refreshToken',
        'logto.signInSession',
      ]
      sessionKeys.forEach((key) => session.forget(key))

      session.clear()

      const logtoConfig = await import('#config/logto')
      const logoutUrl = new URL('/oidc/session/end', logtoConfig.logtoConfig.endpoint)
      logoutUrl.searchParams.set('client_id', logtoConfig.logtoConfig.appId)
      logoutUrl.searchParams.set(
        'post_logout_redirect_uri',
        logtoRuntimeConfig.postLogoutRedirectUri
      )

      // Force a full browser redirect (not AJAX) via Inertia location
      // This is necessary because Logto's logout endpoint requires a direct browser navigation
      return inertia.location(logoutUrl.toString())
    }

    // Local auth logout
    await auth.use('web').logout()
    session.flash('success', 'You have been logged out successfully')
    return response.redirect('/login')
  }

  /**
   * Show the forgot password page
   */
  async showForgotPassword({ inertia }: HttpContext) {
    return inertia.render('auth/forgot-password')
  }

  /**
   * Handle forgot password request
   */
  async forgotPassword({ request, response, session }: HttpContext) {
    // Validate input
    const { email } = await request.validateUsing(forgotPasswordValidator)

    // Find user (silent fail for security)
    const user = await User.findBy('email', email)

    // Always show the success message (prevent email enumeration)
    session.flash(
      'success',
      'If an account exists with that email, you will receive password reset instructions.'
    )

    if (user) {
      // Generate password reset token
      const { token } = await PasswordResetToken.generateFor(
        user,
        authSecurityConfig.passwordResetExpiry
      )

      // Send password reset email
      await mail.send(new PasswordResetNotification(user, token))
    }

    return response.redirect().back()
  }

  /**
   * Show the reset password page
   */
  async showResetPassword({ params, inertia, response, session }: HttpContext) {
    const { token } = params

    if (!token) {
      session.flash('error', 'Invalid password reset link')
      return response.redirect('/forgot-password')
    }

    // Verify token exists and is not expired
    const resetToken = await PasswordResetToken.verifyToken(token)

    if (!resetToken) {
      session.flash('error', 'This password reset link is invalid or has expired')
      return response.redirect('/forgot-password')
    }

    return inertia.render('auth/reset-password', { token })
  }

  /**
   * Handle password reset
   */
  async resetPassword({ request, response, session }: HttpContext) {
    // Validate input
    const { token, password } = await request.validateUsing(resetPasswordValidator)

    // Verify token
    const resetToken = await PasswordResetToken.verifyToken(token)

    if (!resetToken) {
      session.flash('error', 'This password reset link is invalid or has expired')
      return response.redirect('/forgot-password')
    }

    // Load user
    await resetToken.load('user')
    const user = resetToken.user

    // Update password
    user.password = password
    await user.save()

    // Reset failed login attempts if the account was locked
    if (user.isLocked) {
      await user.unlockAccount()
    }

    // Delete all password reset tokens for this user
    await PasswordResetToken.query().where('user_id', user.id).delete()

    // Success
    session.flash(
      'success',
      'Your password has been reset successfully. Please log in with your new password.'
    )
    return response.redirect('/login')
  }
}
