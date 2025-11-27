import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import User from '#models/user'
import AuthService from '#services/auth_service'
import authSecurityConfig from '#config/auth_security'

/**
 * Auth middleware is used to authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    const { session, auth } = ctx

    // Authenticate the user
    await auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })

    // Check if the user's account is locked (only for 'web' guard with User model)
    // OAuth users (logto guard) don't have account lockout, they're authenticated by provider
    if (auth.authenticatedViaGuard === 'web' && auth.user instanceof User) {
      const { isLocked, reason } = await AuthService.checkAccountStatus(
        auth.user,
        authSecurityConfig.lockoutDuration
      )

      if (isLocked) {
        // Account is locked, log out and redirect
        await auth.use('web').logout()
        session.flash('error', reason || 'Account is locked')
        return ctx.response.redirect(this.redirectTo)
      }
    }

    return next()
  }
}
