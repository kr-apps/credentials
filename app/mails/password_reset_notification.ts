import User from '#models/user'
import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

export default class PasswordResetNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS')
  subject = 'Reset your password'

  constructor(
    private user: User,
    private token: string
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    const resetUrl = `${env.get('APP_URL')}/reset-password/${this.token}`

    this.message.to(this.user.email)
    this.message.htmlView('emails/password_reset', {
      user: this.user,
      resetUrl,
      expiryMinutes: 60,
    })
  }
}
