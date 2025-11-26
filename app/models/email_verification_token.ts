import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import TokenService from '#services/token_service'

export default class EmailVerificationToken extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare token: string

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /**
   * Generate an email verification token for a user
   */
  static async generateFor(
    user: User,
    expiryHours: number = 24
  ): Promise<{ token: string; record: EmailVerificationToken }> {
    // Generate a secure random token
    const plainToken = TokenService.generateSecureToken()

    // Hash the token before storing
    const hashedToken = await TokenService.hashToken(plainToken)

    // Delete any existing tokens for this user
    await EmailVerificationToken.query().where('user_id', user.id).delete()

    // Create the new token
    const record = await EmailVerificationToken.create({
      userId: user.id,
      token: hashedToken,
      expiresAt: DateTime.now().plus({ hours: expiryHours }),
    })

    // Return both the plain token (to send to the user) and the record
    return { token: plainToken, record }
  }

  /**
   * Verify an email verification token
   */
  static async verifyToken(plainToken: string): Promise<EmailVerificationToken | null> {
    // Find all non-expired tokens
    const tokens = await EmailVerificationToken.query()
      .where('expires_at', '>', DateTime.now().toSQL()!)
      .preload('user')

    // Check each token's hash
    for (const tokenRecord of tokens) {
      const isValid = await TokenService.verifyToken(tokenRecord.token, plainToken)
      if (isValid) {
        return tokenRecord
      }
    }

    return null
  }

  /**
   * Delete expired tokens (cleanup job)
   */
  static async deleteExpired(): Promise<number> {
    const result = await EmailVerificationToken.query()
      .where('expires_at', '<', DateTime.now().toSQL()!)
      .delete()

    return result[0] || 0
  }
}
