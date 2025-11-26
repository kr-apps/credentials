import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class VerifyEmailMiddleware {
  /**
   * Handle incoming request by checking if user's email is verified
   */
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, response, session } = ctx

    // Get the authenticated user
    const user = auth.user

    if (!user) {
      // If no user is authenticated, redirect to the login page
      session.flash('error', 'Please log in to continue')
      return response.redirect('/login')
    }

    // Check if the email is verified
    if (!user.isEmailVerified()) {
      // Redirect to email verification prompt
      session.flash('warning', 'Please verify your email address to continue')
      return response.redirect('/email/verify')
    }

    // Email is verified, continue
    return next()
  }
}
