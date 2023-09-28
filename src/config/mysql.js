const knex = require("knex");
const env = require("./env");

let db;

async function connectMysql() {
  if (db) return db;

  db = knex({
    client: "mysql2",
    connection: env.database_url,
  });
  db.on("error", (err) => console.error(err));

  await db.raw("select now();");

  return db;
}

exports.connectMysql = connectMysql;
