import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.uuid('uid').defaultTo(knex.fn.uuid());
    table
      .integer('wallet_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');
    table
      .integer('transfer_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('transfers')
      .onDelete('SET NULL');
    table
      .integer('initiated_by')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.enum('type', ['credit', 'debit']).notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('description').nullable();
    table.string('reference').nullable();
    table.boolean('is_system_initiated').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transactions');
}
