const env = require("./config/env");

const express = require("express");
const http = require("node:http");
const { getDbConnection } = require("./config/mysql");
const { stripeHooks } = require("ss-component-payments");
const { errorHandler } = require("./middlewares/defaults");

async function start() {
  const app = express();
  const db = await getDbConnection();

  // commented key:values pairs indicate the available options and their defailt values

  const middleware = stripeHooks({
    db: {
      connection: db,
      // tableName: "users",
      // tableColumn: "stripe_id",
      // tableKey: "id",
      emailColumn: "email_address",
    },
    stripe: {
      signingSecret: env.stripe_signing_secret,
      secretKey: env.stripe_secret_key,
    },
    routes: {
      initiate: "/api/payments",
      webhook: "/api/hooks/stripe",
    },
  });

  app.use(middleware);

  app.use(errorHandler);

  const server = http.createServer(app);
  server.listen(env.port, () =>
    console.log(`server listening on port ${env.port}`)
  );
}

start();
