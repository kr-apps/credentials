import User from '#models/user'
import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

export default class VerifyEmailNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS')
  subject = 'Verify your email address'

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
    const verificationUrl = `${env.get('APP_URL')}/email/verify/${this.token}`

    this.message.to(this.user.email)
    this.message.htmlView('emails/verify_email', {
      user: this.user,
      verificationUrl,
    })
  }
}
