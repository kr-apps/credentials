import User from '#models/user'
import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

export default class AccountLockedNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS')
  subject = 'Your account has been locked'

  constructor(
    private user: User,
    private lockoutDurationMinutes: number = 30
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    const supportUrl = `${env.get('APP_URL')}/contact`

    this.message.to(this.user.email)
    this.message.htmlView('emails/account_locked', {
      user: this.user,
      lockoutDurationMinutes: this.lockoutDurationMinutes,
      supportUrl,
    })
  }
}
