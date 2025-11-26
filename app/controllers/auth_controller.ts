import type { HttpContext } from '@adonisjs/core/http'
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
   * Show the login page
   */
  async showLogin({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  /**
   * Handle user login
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

    // Log the user in
    await auth.use('web').login(user, remember)

    // Redirect to the intended page or dashboard
    session.flash('success', 'Welcome back!')
    return response.redirect().toPath(session.get('redirect_to') || '/dashboard')
  }

  /**
   * Handle user logout
   */
  async logout({ response, session, auth }: HttpContext) {
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
