import type { HttpContext } from '@adonisjs/core/http'
import LogtoClient, { type Storage, type PersistKey } from '@logto/node'

import { logtoConfig } from '#config/logto'

/**
 * SessionStorage implements Logto's Storage interface using AdonisJS sessions
 * instead of encrypted cookies.
 *
 * This allows Logto OAuth state to be stored in the same session system used
 * by the rest of the application, eliminating the need for custom cookie encryption.
 */
class LogtoSessionStorage implements Storage<PersistKey> {
  constructor(private readonly ctx: HttpContext) {}

  async getItem(key: PersistKey): Promise<string | null> {
    const value = this.ctx.session.get(`logto.${key}`)
    return value !== undefined ? String(value) : null
  }

  async setItem(key: PersistKey, value: string): Promise<void> {
    this.ctx.session.put(`logto.${key}`, value)
  }

  async removeItem(key: PersistKey): Promise<void> {
    this.ctx.session.forget(`logto.${key}`)
  }
}

export function buildLogtoClient(ctx: HttpContext) {
  const storage = new LogtoSessionStorage(ctx)

  return new LogtoClient(logtoConfig, {
    storage,
    navigate: (url) => {
      ctx.response.redirect(url)
    },
  })
}
