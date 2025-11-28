import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import { DateTime } from 'luxon'

export default class UsersController {
  /**
   * Display a list of users
   */
  async index({ inertia, request, bouncer }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')

    await bouncer.with('UserPolicy').authorize('viewList')

    const users = await User.query()
      .if(search, (query) => {
        query.where('email', 'ILIKE', `%${search}%`).orWhere('full_name', 'ILIKE', `%${search}%`)
      })
      .preload('roles')
      .orderBy('created_at', 'desc')
      .paginate(page, 25)

    return inertia.render('admin/users/index', {
      users: users.serialize(),
      filters: { search },
    })
  }

  /**
   * Show the form for editing a user
   */
  async edit({ inertia, params }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .preload('roles', (query) => {
        query.preload('permissions')
      })
      .firstOrFail()

    const allRoles = await Role.query().preload('permissions')
    const userPermissions = await user.getPermissions()

    return inertia.render('admin/users/edit', {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerifiedAt: user.emailVerifiedAt?.toISO(),
        createdAt: user.createdAt.toISO(),
        isLocked: user.isLocked,
        roles: user.roles.map((role) => role.id),
        roleDetails: user.roles.map((role) => ({
          id: role.id,
          name: role.name,
          slug: role.slug,
        })),
        permissions: userPermissions.map((p) => p.slug),
      },
      allRoles: allRoles.map((role) => ({
        id: role.id,
        name: role.name,
        slug: role.slug,
        description: role.description,
        permissionCount: role.permissions.length,
      })),
    })
  }

  /**
   * Assign roles to a user
   */
  async assignRoles({ params, request, response, auth, session }: HttpContext) {
    const { roleIds } = request.only(['roleIds'])
    const currentUser = auth.getUserOrFail()

    const user = await User.findOrFail(params.id)

    // Prevent self-modification
    if (user.id === currentUser.id) {
      session.flash('error', 'Cannot modify your own roles')
      return response.redirect().back()
    }

    // Sync roles with assigned_by and assigned_at audit trail
    const pivotData: Record<number, { assigned_by: number; assigned_at: string }> = {}
    for (const roleId of roleIds) {
      pivotData[roleId] = {
        assigned_by: currentUser.id,
        assigned_at: DateTime.now().toSQL() || '',
      }
    }

    await user.related('roles').sync(pivotData)

    session.flash('success', 'User roles updated successfully')
    return response.redirect().back()
  }
}
