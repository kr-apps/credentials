/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'

/**
 * Register endpoint - 3 requests per hour
 */
export const registerThrottle = limiter.define('register', () => {
  return limiter.allowRequests(3).every('1 hour')
})

/**
 * Login endpoint - 10 requests per 15 minutes
 * Must be higher than maxLoginAttempts (5) to allow the account locked email to be sent
 */
export const loginThrottle = limiter.define('login', () => {
  return limiter.allowRequests(10).every('15 minutes')
})

/**
 * Forgot password endpoint - 3 requests per hour
 */
export const forgotPasswordThrottle = limiter.define('forgot-password', () => {
  return limiter.allowRequests(3).every('1 hour')
})

/**
 * Reset password endpoint - 5 requests per 15 minutes
 */
export const resetPasswordThrottle = limiter.define('reset-password', () => {
  return limiter.allowRequests(5).every('15 minutes')
})

/**
 * Resend verification email - 3 requests per 15 minutes
 */
export const resendVerificationThrottle = limiter.define('resend-verification', () => {
  return limiter.allowRequests(3).every('15 minutes')
})
