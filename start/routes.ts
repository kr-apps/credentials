/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import {
  registerThrottle,
  loginThrottle,
  forgotPasswordThrottle,
  resetPasswordThrottle,
  resendVerificationThrottle,
} from '#start/limiter'

const AuthController = () => import('#controllers/auth_controller')
const EmailVerificationController = () => import('#controllers/email_verification_controller')

// Home page (public)
router.on('/').renderInertia('home')

// Guest routes (unauthenticated users only)
router
  .group(() => {
    // Registration
    router.get('/register', [AuthController, 'showRegister'])
    router.post('/register', [AuthController, 'register']).use(registerThrottle)

    // Login
    router.get('/login', [AuthController, 'showLogin'])
    router.post('/login', [AuthController, 'login']).use(loginThrottle)

    // Password reset
    router.get('/forgot-password', [AuthController, 'showForgotPassword'])
    router.post('/forgot-password', [AuthController, 'forgotPassword']).use(forgotPasswordThrottle)
    router.get('/reset-password/:token', [AuthController, 'showResetPassword'])
    router.post('/reset-password', [AuthController, 'resetPassword']).use(resetPasswordThrottle)
  })
  .middleware([middleware.guest()])

// Email verification routes (authenticated users)
router
  .group(() => {
    router.get('/email/verify', [EmailVerificationController, 'showVerificationPrompt'])
    router.get('/email/verify/:token', [EmailVerificationController, 'verify'])
    router
      .post('/email/resend', [EmailVerificationController, 'resend'])
      .use(resendVerificationThrottle)
  })
  .middleware([middleware.auth()])

// Logout (authenticated users)
router.post('/logout', [AuthController, 'logout']).middleware([middleware.auth()])

// Protected routes (authenticated and verified email)
router
  .group(() => {
    router.get('/dashboard', ({ inertia }) => {
      return inertia.render('dashboard')
    })
  })
  .middleware([middleware.auth(), middleware.verifyEmail()])
