const env = require("./config/env");

const express = require("express");
const http = require("node:http");
const stripe = require("stripe").default(env.stripe_secret_key);
const checkoutsController = require("./http/controllers/checkout.controller");
const defaultHanders = require("./http/middlewares/defaults");
const { getDbConnection } = require("./config/mysql");

async function start() {
  /** @type { import("./index").Container }  */
  const container = {};
  const app = express();
  container.db = await getDbConnection();
  container.stripe = stripe;
  container.app = app;
  console.log("dependency container has been successfully setup");

  // load routes
  app.use(express.json());
  checkoutsController.setup(container);
  defaultHanders.setup(container);

  const server = http.createServer(container.app);
  server.listen(env.port, () =>
    console.log(`server listening on port ${env.port}`)
  );
}

function loadRoutes(container) {}

start();
