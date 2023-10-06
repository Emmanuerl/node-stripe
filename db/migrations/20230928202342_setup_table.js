/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const customers = knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.string("other_key").nullable().unique();
    table.string("email").notNullable();
    table.string("other_email_column").notNullable();
    table.string("stripe_id").nullable().unique();
    table.string("other_column").nullable().unique();
  });

  const otherTable = knex.schema.createTable("others", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.string("other_key").nullable().unique();
    table.string("email").notNullable();
    table.string("other_email_column").notNullable();
    table.string("stripe_id").nullable().unique();
    table.string("other_column").nullable().unique();
  });

  return Promise.all([customers, otherTable]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists("customers"),
    knex.schema.dropTableIfExists("others"),
  ]);
};
