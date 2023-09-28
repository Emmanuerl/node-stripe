const { faker } = require("@faker-js/faker");

/**
 * @typedef {import("../../src/index").Customer} Customer
 */

/**
 *
 * @param {Partial<Customer>} extra details to be ovewritten
 * @returns {Customer} a customer object
 */
function newCustomer(extra) {
  return {
    created_at: faker.date.past(),
    id: faker.string.uuid(),
    stripe_id: faker.string.alpha(16),
    ...extra,
  };
}

/**
 * persists a customer's details to the db
 * @param {import("knex").Knex} db db connection instance
 * @param {Customer} details customer details
 * @returns {Promise<Customer>}
 */
async function save(db, details) {
  await db("customers").insert(details);
}

module.exports = { newCustomer, save };
