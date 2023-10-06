const { faker } = require("@faker-js/faker");

function newRow() {
  return {
    id: faker.string.uuid(),
    other_key: faker.string.uuid(),
    email: faker.internet.email(),
    other_email_column: faker.internet.email(),
    stripe_id: faker.string.alphanumeric(10),
    other_column: faker.string.alphanumeric(10),
  };
}

async function save(db, table, row) {
  const [entry] = await db(table).insert(row);
  return entry;
}

module.exports = { newRow, save };
