import type { HttpContext } from '@adonisjs/core/http'
import EmailVerificationToken from '#models/email_verification_token'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_email_notification'
import WelcomeNotification from '#mails/welcome_notification'
import authSecurityConfig from '#config/auth_security'

export default class EmailVerificationController {
  /**
   * Show email verification prompt (local auth only)
   */
  async showVerificationPrompt({ inertia, auth }: HttpContext) {
    const user = auth.user!

    // OAuth users don't need email verification - redirect to dashboard
    if (auth.authenticatedViaGuard === 'logto' || user.isEmailVerified() || !user) {
      return inertia.location('/dashboard')
    }

    return inertia.render('auth/verify-email')
  }

  /**
   * Handle email verification
   */
  async verify({ params, response, session, auth }: HttpContext) {
    const { token } = params

    if (!token) {
      session.flash('error', 'Invalid verification link')
      return response.redirect('/email/verify')
    }

    // Verify token
    const verificationToken = await EmailVerificationToken.verifyToken(token)

    if (!verificationToken) {
      session.flash('error', 'This verification link is invalid or has expired')
      return response.redirect('/email/verify')
    }

    // Load user
    await verificationToken.load('user')
    const user = verificationToken.user

    // Check if already verified
    if (user.isEmailVerified()) {
      session.flash('info', 'Your email is already verified')
      return response.redirect('/dashboard')
    }

    // Mark email as verified
    user.emailVerifiedAt = DateTime.now()
    await user.save()

    // Delete verification token
    await EmailVerificationToken.query().where('user_id', user.id).delete()

    // Send the welcome email
    await mail.send(new WelcomeNotification(user))

    // If the user is not logged in, log them in
    if (!auth.user) {
      await auth.use('web').login(user)
    }

    // Success
    session.flash('success', 'Your email has been verified successfully! Welcome!')
    return response.redirect('/dashboard')
  }

  /**
   * Resend verification email (local auth only)
   */
  async resend({ response, session, auth }: HttpContext) {
    const user = auth.user!

    // OAuth users don't need email verification
    if (auth.authenticatedViaGuard === 'logto' || !user) {
      session.flash('info', 'Email verification not required')
      return response.redirect('/dashboard')
    }

    // Check if already verified
    if (user.isEmailVerified()) {
      session.flash('info', 'Your email is already verified')
      return response.redirect('/dashboard')
    }

    // Generate the new verification token
    const { token } = await EmailVerificationToken.generateFor(
      user,
      authSecurityConfig.emailVerificationExpiry
    )

    // Send verification email
    await mail.send(new VerifyEmailNotification(user, token))

    // Success
    session.flash('success', 'Verification email sent! Please check your inbox.')
    return response.redirect().back()
  }
}
