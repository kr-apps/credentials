import User from '#models/user'
import { DateTime } from 'luxon'

export default class AuthService {
  /**
   * Check if the user account is locked and handle auto-unlock
   */
  static async checkAccountStatus(
    user: User,
    lockoutDurationMinutes: number = 30
  ): Promise<{ isLocked: boolean; reason?: string }> {
    if (!user.isLocked) {
      return { isLocked: false }
    }

    // Check if the lockout duration has passed
    if (user.canUnlockAfterDuration(lockoutDurationMinutes)) {
      await user.unlockAccount()
      return { isLocked: false }
    }

    // Account is still locked
    const lockoutEnd = user.lockedAt!.plus({ minutes: lockoutDurationMinutes })
    const minutesRemaining = Math.ceil(lockoutEnd.diff(DateTime.now(), 'minutes').minutes)

    return {
      isLocked: true,
      reason: `Account is locked. Try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`,
    }
  }

  /**
   * Handle a failed login attempt
   */
  static async handleFailedLogin(user: User, maxAttempts: number = 5): Promise<void> {
    await user.incrementFailedAttempts()

    // Lock the account if max attempts reached
    if (user.shouldBeLocked(maxAttempts)) {
      await user.lockAccount()
    }
  }

  /**
   * Handle a successful login
   */
  static async handleSuccessfulLogin(user: User): Promise<void> {
    await user.resetFailedAttempts()
  }

  /**
   * Attempt to authenticate a user
   */
  static async attemptLogin(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const user = await User.verifyCredentials(email, password)

    if (!user) {
      return { success: false, error: 'Invalid credentials' }
    }

    return { success: true, user }
  }
}
