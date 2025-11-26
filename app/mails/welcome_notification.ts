import User from '#models/user'
import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

export default class WelcomeNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS')
  subject = 'Welcome to the app!'

  constructor(private user: User) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    const dashboardUrl = `${env.get('APP_URL')}/dashboard`

    this.message.to(this.user.email)
    this.message.htmlView('emails/welcome', {
      user: this.user,
      dashboardUrl,
    })
  }
}
