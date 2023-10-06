const express = require("express");
const env = require("../src/config/env");

const { getDbConnection } = require("../src/config/mysql");
const { stripeHooks } = require("ss-component-payments");
const stripeMock = require("./helpers/stripe");
const dbUtils = require("./helpers/db");
const { errorHandler } = require("../src/middlewares/defaults");
const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { expect } = require("chai");

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

describe("Initiate Payment", () => {
  it("should initiate a one time payment", async () => {
    const config = getConfig();
    const app = configure(config);

    const customer = dbUtils.newRow();
    await dbUtils.save(db, "users", customer);
    const payload = {
      customer_id: customer.id,
      amount: faker.finance.amount(),
    };

    stripeMock.mockCreateInvoice(stripe, {
      amount: payload.amount,
      customer: customer.stripe_id,
    });

    const res = await request(app).post("/api/v1/checkouts").send(payload);

    expect(res.statusCode).eq(200);
    expect(res.body).property("client_secret");
  });

  it("should initiate a recurring payment", async () => {
    const config = getConfig();
    const app = configure(config);

    const customer = dbUtils.newRow();
    await dbUtils.save(db, "users", customer);

    const payload = {
      customer_id: customer.id,
      price_id: faker.string.alpha(10),
    };

    stripeMock.mockCreateSubscription(stripe, {
      customer: customer.stripe_id,
      price: payload.price_id,
    });

    const res = await request(app).post("/api/v1/checkouts").send(payload);
    expect(res.statusCode).eq(200);
    expect(res.body).property("client_secret");
  });

  it("throws error if `customer_id` is not specified", async () => {
    const config = getConfig();
    const app = configure(config);

    const payload = { stripe_id: faker.string.alphanumeric(12) };
    const res = await request(app).post("/api/v1/checkouts").send(payload);

    expect(res.statusCode).eq(422);
    expect(res.body.message).eq("your request body is invalid");
    expect(res.body.data.customer_id).eq('"customer_id" is required');
  });

  it("throws error if neither `price_id` not `amount` is specified", async () => {
    const config = getConfig();
    const app = configure(config);

    const payload = { customer_id: faker.string.alphanumeric(12) };
    const res = await request(app).post("/api/v1/checkouts").send(payload);

    expect(res.statusCode).eq(422);
    expect(res.body.message).eq("your request body is invalid");
    expect(res.body.data.value).eq(
      "req.body must have a `price_id` or `amount`"
    );
  });

  it("throws 404 if customer doesn't exist in db", async () => {
    const config = getConfig();
    const app = configure(config);

    const customer = dbUtils.newRow();

    const payload = {
      customer_id: customer.id,
      amount: faker.finance.amount(),
    };
    const res = await request(app).post("/api/v1/checkouts").send(payload);

    expect(res.statusCode).eq(404);
    expect(res.body.message).eq("customer not found");
  });

  it("creates a stripe customer user if stripe id column is empty", async () => {
    const config = getConfig();
    const app = configure(config);

    const customer = dbUtils.newRow();
    delete customer.stripe_id;
    await dbUtils.save(db, "users", customer);

    const stripeId = faker.string.alphanumeric(16);
    stripeMock.mockCreateCustomer(
      stripe,
      { email: customer.email },
      { id: stripeId }
    );

    const payload = {
      customer_id: customer.id,
      price_id: faker.string.alpha(10),
    };

    stripeMock.mockCreateSubscription(stripe, {
      customer: stripeId,
      price: payload.price_id,
    });

    const res = await request(app).post("/api/v1/checkouts").send(payload);

    expect(res.statusCode).eq(200);

    const updatedCustomer = await db("users")
      .where("id", customer.id)
      .first("*");

    expect(updatedCustomer.stripe_id).eq(stripeId);
  });

  it("uses the specified `tableColumn` if provided", async () => {
    const config = getConfig();
    config.db.tableColumn = "other_column";
    const app = configure(config);

    const customer = dbUtils.newRow();
    await dbUtils.save(db, "users", customer);

    const payload = {
      customer_id: customer.id,
      price_id: faker.string.alpha(10),
    };

    stripeMock.mockCreateSubscription(stripe, {
      customer: customer["other_column"],
      price: payload.price_id,
    });

    const res = await request(app).post("/api/v1/checkouts").send(payload);
    expect(res.statusCode).eq(200);
  });

  it("uses the specified tableName if provided", async () => {
    const config = getConfig();
    config.db.tableName = "others";
    const app = configure(config);

    const customer = dbUtils.newRow();
    await dbUtils.save(db, "others", customer);

    const payload = {
      customer_id: customer.id,
      price_id: faker.string.alpha(10),
    };

    stripeMock.mockCreateSubscription(stripe, {
      customer: customer.stripe_id,
      price: payload.price_id,
    });

    const res = await request(app).post("/api/v1/checkouts").send(payload);
    expect(res.statusCode).eq(200);
  });

  it("uses the specified `tableKey` if provided", async () => {
    const config = getConfig();
    config.db.tableKey = "other_key";
    const app = configure(config);

    const customer = dbUtils.newRow();
    await dbUtils.save(db, "users", customer);

    const payload = {
      customer_id: customer.other_key,
      price_id: faker.string.alpha(10),
    };

    stripeMock.mockCreateSubscription(stripe, {
      customer: customer.stripe_id,
      price: payload.price_id,
    });

    const res = await request(app).post("/api/v1/checkouts").send(payload);
    expect(res.statusCode).eq(200);
  });

  it("uses the specified route if provided", async () => {
    const config = getConfig();
    config.routes.initiate = "/payments/initiate";
    const app = configure(config);

    const customer = dbUtils.newRow();
    await dbUtils.save(db, "users", customer);

    const payload = {
      customer_id: customer.id,
      price_id: faker.string.alpha(10),
    };

    stripeMock.mockCreateSubscription(stripe, {
      customer: customer.stripe_id,
      price: payload.price_id,
    });

    const res = await request(app).post("/payments/initiate").send(payload);
    expect(res.statusCode).eq(200);
  });
});
