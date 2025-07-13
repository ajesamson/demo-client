import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.uuid('uid').defaultTo(knex.fn.uuid());
    table.string('email', 45).notNullable().unique();
    table.string('password_hash').notNullable();
    table.string('fullname', 45).notNullable();
    table.string('mobile', 14).notNullable().unique();
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_onboarded').defaultTo(false); // karma blacklist
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
