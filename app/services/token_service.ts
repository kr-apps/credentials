import { randomBytes } from 'node:crypto'
import hash from '@adonisjs/core/services/hash'

export default class TokenService {
  /**
   * Generate a cryptographically secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex')
  }

  /**
   * Hash a token for secure storage
   */
  static async hashToken(token: string): Promise<string> {
    return hash.make(token)
  }

  /**
   * Verify a plain token against a hashed token
   */
  static async verifyToken(hashedToken: string, plainToken: string): Promise<boolean> {
    return hash.verify(hashedToken, plainToken)
  }
}
