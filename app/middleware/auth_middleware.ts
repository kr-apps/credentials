import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
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
    const { session } = ctx

    // Authenticate the user
    await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })

    // Check if the user's account is locked
    const user = ctx.auth.user
    if (user) {
      const { isLocked, reason } = await AuthService.checkAccountStatus(
        user,
        authSecurityConfig.lockoutDuration
      )

      if (isLocked) {
        // Account is locked, log out and redirect
        await ctx.auth.use('web').logout()
        session.flash('error', reason || 'Account is locked')
        return ctx.response.redirect(this.redirectTo)
      }
    }

    return next()
  }
}
