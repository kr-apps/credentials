import env from '#start/env'
import type { LogtoConfig } from '@logto/node'

export const logtoConfig: LogtoConfig = {
  endpoint: env.get('LOGTO_ENDPOINT') as string,
  appId: env.get('LOGTO_APP_ID') as string,
  appSecret: env.get('LOGTO_APP_SECRET') as string,
  scopes: ['openid', 'offline_access', 'profile', 'email'],
}

export const logtoRuntimeConfig = {
  /**
   * Redirect URI configured in Logto. Must match APP_URL + route.
   */
  redirectUri: `${env.get('APP_URL') as string}/auth/callback`,
  /**
   * Where to send the user after sign-out completes.
   */
  postLogoutRedirectUri: env.get('APP_URL') as string,
}
