const authSecurityConfig = {
  /**
   * Maximum number of failed login attempts before account lockout
   */
  maxLoginAttempts: 5,

  /**
   * Account lockout duration in minutes
   */
  lockoutDuration: 30,

  /**
   * Password reset token expiry in minutes
   */
  passwordResetExpiry: 60,

  /**
   * Email verification token expiry in hours
   */
  emailVerificationExpiry: 24,

  /**
   * Password strength requirements
   */
  passwordRequirements: {
    minLength: 8,
    maxLength: 64,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
} as const

export default authSecurityConfig
