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
    return hash.use('scrypt').make(token)
  }

  /**
   * Verify a plain token against a hashed token
   */
  static async verifyToken(plainToken: string, hashedToken: string): Promise<boolean> {
    return hash.use('scrypt').verify(hashedToken, plainToken)
  }
}
