require("dotenv").config();

const base = {
  client: "mysql",
  connection: process.env.DATABASE_URL,
  migrations: {
    tableName: "knex_migrations",
  },
};

module.exports = {
  development: base,
  staging: base,
  production: base,
};
