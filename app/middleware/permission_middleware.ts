import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Permission middleware protects routes based on user permissions
 *
 * Usage:
 * router.get('/analytics', ...).middleware([middleware.permission({ permissions: ['view:analytics'] })])
 */
export default class PermissionMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn, options: { permissions: string[] }) {
    const user = auth.getUserOrFail()

    // Check if the user has at least one of the required permissions
    const hasPermission = await Promise.any(
      options.permissions.map((permission) => user.hasPermission(permission))
    ).catch(() => false)

    if (!hasPermission) {
      return response.forbidden({
        message: 'Insufficient permissions',
        required: options.permissions,
      })
    }

    return next()
  }
}
