import { defineConfig } from '@adonisjs/auth'
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session'
import type { InferAuthenticators, InferAuthEvents, Authenticators } from '@adonisjs/auth/types'
import { logtoGuard } from '../app/auth/guards/logto.js'
import env from '#start/env'

/**
 * Determine the default guard based on AUTH_STRATEGY environment variable
 */
const authStrategy = env.get('AUTH_STRATEGY')
const defaultGuard = authStrategy === 'logto' ? 'logto' : 'web'

const authConfig = defineConfig({
  default: defaultGuard,
  guards: {
    web: sessionGuard({
      useRememberMeTokens: true,
      provider: sessionUserProvider({
        model: () => import('#models/user'),
      }),
    }),
    logto: logtoGuard,
  },
})

export default authConfig

/**
 * Inferring types from the configured auth
 * guards.
 */
declare module '@adonisjs/auth/types' {
  export interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
