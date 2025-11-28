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
const AdminUsersController = () => import('#controllers/admin/users_controller')
const AdminRolesController = () => import('#controllers/admin/roles_controller')

// Home page (public)
router.on('/').renderInertia('home').middleware([middleware.auth()])

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
    router.get('/email/verify/:token', [EmailVerificationController, 'verify'])
    router.get('/email/verify', [EmailVerificationController, 'showVerificationPrompt'])
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

// OAuth callback route (used when AUTH_STRATEGY=logto)
router.get('/auth/callback', [AuthController, 'handleOAuthCallback'])

// Admin routes (only for users with the admin role)
router
  .group(() => {
    // Dashboard
    router.get('/dashboard', ({ inertia }) => {
      return inertia.render('admin/dashboard')
    })

    // User management
    router.get('/users', [AdminUsersController, 'index'])
    router.get('/users/:id/edit', [AdminUsersController, 'edit'])
    router.post('/users/:id/roles', [AdminUsersController, 'assignRoles'])

    // Role management
    router.get('/roles', [AdminRolesController, 'index'])
    router.get('/roles/:id/edit', [AdminRolesController, 'edit'])
    router.put('/roles/:id/permissions', [AdminRolesController, 'updatePermissions'])
  })
  .prefix('/admin')
  .middleware([middleware.auth(), middleware.verifyEmail(), middleware.role({ roles: ['admin'] })])
