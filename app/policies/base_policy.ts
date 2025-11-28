import User from '#models/user'
import { BasePolicy as BouncerBasePolicy } from '@adonisjs/bouncer'

export default class BasePolicy extends BouncerBasePolicy {
  /**
   * Admin override: Admins bypass all policy checks
   */
  async before(user: User | null) {
    if (user && (await user.isAdmin())) {
      return true
    }
  }
}
