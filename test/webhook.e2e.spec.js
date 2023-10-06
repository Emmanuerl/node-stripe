const env = require("../src/config/env");
const request = require("supertest");
const express = require("express");
const stripeUtils = require("./helpers/stripe");
const { expect } = require("chai");
const stripeMock = require("./helpers/stripe");
const { errorHandler } = require("../src/middlewares/defaults");
const { getDbConnection } = require("../src/config/mysql");
const { stripeHooks } = require("ss-component-payments");

let getConfig;
let db;
let stripe;
/**
 *
 * @param {import("express").Application} app
 * @param {import("../lib").Config} config
 */
function configure(config) {
  const app = express();
  app.use(stripeHooks(config));
  app.use(errorHandler);
  return app;
}

before(async () => {
  db = await getDbConnection();
});

beforeEach(() => {
  stripe = stripeMock.getInstance();
  getConfig = (overwrites) => ({
    db: { connection: db },
    stripe: {
      secretKey: env.stripe_secret_key,
      signingSecret: env.stripe_signing_secret,
    },
    stripeClient: stripe,
    routes: {},
    ...overwrites,
  });
});
describe("Webhook", () => {
  it("receives a stripe webhook event", async () => {
    const config = getConfig();
    const app = configure(config);

    const webhook = stripeUtils.newWebhook({
      type: "customer.subscription.created",
    });
    const body = JSON.stringify(webhook);
    const signature = stripeUtils.signRequest(config.stripeClient, body);

    const res = await request(app)
      .post("/api/v1/webhooks/stripe")
      .send(body)
      .set({
        "stripe-signature": signature,
        "Content-Type": "application/json",
        "Content-Length": body.length,
      });

    expect(res.statusCode).eq(200);
    expect(res.body.handled).eq(true);
    expect(res.body.message).eq("Hello World!");
  });

  it("uses the provided webhook route", async () => {
    const config = getConfig();
    config.routes.webhook = "/random/webhook/name";
    const app = configure(config);

    const webhook = stripeUtils.newWebhook({
      type: "customer.subscription.created",
    });
    const body = JSON.stringify(webhook);
    const signature = stripeUtils.signRequest(config.stripeClient, body);

    const res = await request(app).post("/random/webhook/name").send(body).set({
      "stripe-signature": signature,
      "Content-Type": "application/json",
      "Content-Length": body.length,
    });

    expect(res.statusCode).eq(200);
    expect(res.body.handled).eq(true);
    expect(res.body.message).eq("Hello World!");
  });
});
