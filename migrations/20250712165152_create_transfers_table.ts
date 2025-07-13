import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transfers', (table) => {
    table.increments('id').primary();
    table.uuid('uid').defaultTo(knex.fn.uuid());
    table
      .integer('sender_wallet_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');
    table
      .integer('receiver_wallet_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).notNullable().defaultTo('NGN');
    table.string('description').nullable();
    table
      .enum('status', ['pending', 'processing', 'completed', 'failed'])
      .notNullable()
      .defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transfers');
}
