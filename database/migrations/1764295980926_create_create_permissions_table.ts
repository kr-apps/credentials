import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'permissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 100).notNullable()
      table.string('slug', 100).notNullable().unique()
      table.text('description').nullable()
      table.string('resource', 50).notNullable()
      table.string('action', 50).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['resource', 'action'], 'idx_permissions_resource_action')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
