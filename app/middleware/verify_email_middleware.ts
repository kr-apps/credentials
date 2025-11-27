import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

export default class VerifyEmailMiddleware {
  /**
   * Handle incoming request by checking if user's email is verified
   * OAuth users (logto guard) are automatically considered verified
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

    // OAuth users (logto guard) have email verified by provider - skip verification
    if (auth.authenticatedViaGuard === 'logto') {
      return next()
    }

    // For local auth (web guard), check if email is verified
    if (auth.authenticatedViaGuard === 'web' && user instanceof User) {
      if (!user.isEmailVerified()) {
        // Redirect to email verification prompt
        session.flash('warning', 'Please verify your email address to continue')
        return response.redirect('/email/verify')
      }
    }

    // Email is verified, continue
    return next()
  }
}
