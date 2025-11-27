import type { AuthClientResponse, GuardContract } from '@adonisjs/auth/types'
import { symbols, errors } from '@adonisjs/auth'
import type { HttpContext } from '@adonisjs/core/http'
import LogtoClient from '@logto/node'
import { buildLogtoClient } from '#services/logto_service'
import User from '#models/user'

// Define the guard implementation
export class LogtoGuard implements GuardContract<User> {
  /**
   * Events emitted by the guard
   */
  [symbols.GUARD_KNOWN_EVENTS]: {} = {}

  #logtoClient: LogtoClient

  user?: User

  readonly driverName: string = 'logto'

  isAuthenticated: boolean = false

  authenticationAttempted: boolean = false

  constructor(ctx: HttpContext) {
    this.#logtoClient = buildLogtoClient(ctx)
  }

  /**
   * The method to authenticate the current HTTP request
   */
  async authenticate(): Promise<User> {
    this.authenticationAttempted = true

    // 1. Verificar OAuth state
    const isAuthenticated = await this.#logtoClient.isAuthenticated()
    if (!isAuthenticated) {
      this.isAuthenticated = false
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: 'logto',
      })
    }

    // 2. Obtener claims del JWT
    const claims = await this.#logtoClient.getIdTokenClaims()
    if (!claims) {
      this.isAuthenticated = false
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: 'logto',
      })
    }

    // 3. Cargar User completo de BD usando el email
    const email = claims.email ?? claims.username
    if (!email) {
      this.isAuthenticated = false
      throw new errors.E_UNAUTHORIZED_ACCESS('Email not found in OAuth claims', {
        guardDriverName: 'logto',
      })
    }

    const user = await User.findBy('email', email)
    if (!user) {
      // Usuario no sincronizado - no debería pasar si callback funciona
      this.isAuthenticated = false
      throw new errors.E_UNAUTHORIZED_ACCESS(
        'User not found in database. Please contact support.',
        { guardDriverName: 'logto' }
      )
    }

    // 4. Retornar User model completo
    this.user = user
    this.isAuthenticated = true
    return this.user
  }

  /**
   * Check if the user is authenticated
   */
  async check(): Promise<boolean> {
    try {
      await this.authenticate()
      return true
    } catch {
      return false
    }
  }

  /**
   * Authenticate the user for testing purposes
   */
  async authenticateAsClient(user: User): Promise<AuthClientResponse> {
    this.user = user
    this.isAuthenticated = true
    this.authenticationAttempted = true
    return { headers: {} }
  }

  /**
   * Get the authenticated user or fail
   */
  getUserOrFail(): User {
    if (!this.user) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: 'logto',
      })
    }
    return this.user
  }
}

// 3. Define the guard factory
export function logtoGuard(ctx: HttpContext): LogtoGuard {
  return new LogtoGuard(ctx)
}
