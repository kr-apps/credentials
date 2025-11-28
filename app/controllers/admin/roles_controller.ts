import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import Permission from '#models/permission'

export default class RolesController {
  /**
   * Display a list of roles
   */
  async index({ inertia }: HttpContext) {
    const roles = await Role.query()
      .preload('permissions')
      .preload('users', (query) => query.select('id'))

    return inertia.render('admin/roles/index', {
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        slug: role.slug,
        description: role.description,
        isDefault: role.isDefault,
        permissionCount: role.permissions.length,
        userCount: role.users.length,
      })),
    })
  }

  /**
   * Show the form for editing a role
   */
  async edit({ inertia, params }: HttpContext) {
    const role = await Role.query().where('id', params.id).preload('permissions').firstOrFail()

    const allPermissions = await Permission.query()
      .orderBy('resource', 'asc')
      .orderBy('action', 'asc')

    // Group permissions by resource
    const groupedPermissions = allPermissions.reduce(
      (acc, permission) => {
        if (!acc[permission.resource]) {
          acc[permission.resource] = []
        }
        acc[permission.resource].push({
          id: permission.id,
          name: permission.name,
          slug: permission.slug,
          description: permission.description,
          action: permission.action,
        })
        return acc
      },
      {} as Record<string, any[]>
    )

    return inertia.render('admin/roles/edit', {
      role: {
        id: role.id,
        name: role.name,
        slug: role.slug,
        description: role.description,
        isDefault: role.isDefault,
        permissions: role.permissions.map((p) => p.id),
      },
      groupedPermissions,
    })
  }

  /**
   * Update permissions for a role
   */
  async updatePermissions({ params, request, response, session }: HttpContext) {
    const { permissionIds } = request.only(['permissionIds'])

    const role = await Role.findOrFail(params.id)

    await role.related('permissions').sync(permissionIds)

    session.flash('success', 'Role permissions updated successfully')
    return response.redirect().back()
  }
}
