import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('email_verified_at').nullable()
      table.boolean('is_locked').defaultTo(false).notNullable()
      table.integer('failed_login_attempts').defaultTo(0).notNullable()
      table.timestamp('locked_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email_verified_at')
      table.dropColumn('is_locked')
      table.dropColumn('failed_login_attempts')
      table.dropColumn('locked_at')
    })
  }
}
