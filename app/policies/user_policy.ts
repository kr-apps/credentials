import User from '#models/user'
import BasePolicy from '#policies/base_policy'

export default class UserPolicy extends BasePolicy {
  /**
   * Check if the user can view the user's list
   */
  async viewList(user: User) {
    return user.hasPermission('users:view')
  }

  /**
   * Check if the user can view a specific user
   */
  async view(user: User, targetUser: User) {
    // User can view their own profile or has permission
    return user.id === targetUser.id || (await user.hasPermission('users:view'))
  }

  /**
   * Check if the user can create new users
   */
  async create(user: User) {
    return user.hasPermission('users:create')
  }

  /**
   * Check if the user can update a specific user
   */
  async update(user: User, targetUser: User) {
    // User can update their own profile or has permission
    return user.id === targetUser.id || (await user.hasPermission('users:update'))
  }

  /**
   * Check if the user can delete a specific user
   */
  async delete(user: User, targetUser: User) {
    // User cannot delete themselves, must have permission
    return user.id !== targetUser.id && (await user.hasPermission('users:delete'))
  }

  /**
   * Check if the user can assign roles to other users
   */
  async assignRoles(user: User, targetUser: User) {
    // Cannot assign roles to themselves, must have permission
    return user.id !== targetUser.id && (await user.hasPermission('roles:assign'))
  }
}
