import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Role middleware protects routes based on user roles
 *
 * Usage:
 * router.get('/admin', ...).middleware([middleware.role({ roles: ['admin'] })])
 */
export default class RoleMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn, options: { roles: string[] }) {
    const user = auth.getUserOrFail()

    if (!(await user.hasAnyRole(options.roles))) {
      return response.forbidden({
        message: 'Insufficient role',
        required: options.roles,
      })
    }

    return next()
  }
}
