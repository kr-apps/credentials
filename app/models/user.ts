import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'

const AuthFinder = withAuthFinder(() => hash.use('argon'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  @column()
  declare isLocked: boolean

  @column()
  declare failedLoginAttempts: number

  @column.dateTime()
  declare lockedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

  /**
   * Check if the user's email is verified
   */
  isEmailVerified(): boolean {
    return this.emailVerifiedAt !== null
  }

  /**
   * Increment failed login attempts
   */
  async incrementFailedAttempts(): Promise<void> {
    this.failedLoginAttempts += 1
    await this.save()
  }

  /**
   * Reset failed login attempts
   */
  async resetFailedAttempts(): Promise<void> {
    this.failedLoginAttempts = 0
    this.isLocked = false
    this.lockedAt = null
    await this.save()
  }

  /**
   * Lock the user account
   */
  async lockAccount(): Promise<void> {
    this.isLocked = true
    this.lockedAt = DateTime.now()
    await this.save()
  }

  /**
   * Unlock the user account
   */
  async unlockAccount(): Promise<void> {
    this.isLocked = false
    this.lockedAt = null
    this.failedLoginAttempts = 0
    await this.save()
  }

  /**
   * Check if the account should be locked based on failed attempts
   */
  shouldBeLocked(maxAttempts: number = 5): boolean {
    return this.failedLoginAttempts >= maxAttempts
  }

  /**
   * Check if the account lockout duration has passed
   */
  canUnlockAfterDuration(durationMinutes: number = 30): boolean {
    if (!this.isLocked || !this.lockedAt) {
      return false
    }

    const lockoutEnd = this.lockedAt.plus({ minutes: durationMinutes })
    return DateTime.now() >= lockoutEnd
  }
}
