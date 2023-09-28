require("../src/config/env");

const { getDbConnection } = require("../src/config/mysql");
const request = require("supertest");
const express = require("express");
const stripeMock = require("./helpers/stripe");
const customers = require("./helpers/customers");
const { setup } = require("../src/http/controllers/checkout.controller");
const { faker } = require("@faker-js/faker");
const { expect } = require("chai");

/** @type {request.SuperTest<request.Test>}  */
let agent;
/** @type {import ("knex").Knex}  */
let db;
let stripe;
let app;

before(async () => {
  db = await getDbConnection();
});

beforeEach(async () => {
  app = express();
  app.use(express.json());
  agent = request(app);
  stripe = stripeMock.getInstance();
  setup({ app, db, stripe });
});

describe("Checkouts # Initiate", () => {
  it("initiates a one-time payment checkout", async () => {
    const customer = customers.newCustomer();
    await customers.save(db, customer);

    const payload = {
      customer_id: customer.id,
      amount: faker.finance.amount(),
    };

    const mocks = stripeMock.mockCreateInvoice(stripe, {
      amount: payload.amount,
      customer: customer.stripe_id,
    });

    const res = await agent.post("/api/v1/checkouts").send(payload);
    expect(mocks.create.calledOnce).eq(true);
    expect(mocks.appendItems.calledOnce).eq(true);
    expect(mocks.finalise.calledOnce).eq(true);

    expect(res.statusCode).eq(200);
  });

  it("initiate a recurring payment checkout", async () => {
    const customer = customers.newCustomer();
    await customers.save(db, customer);

    const payload = {
      customer_id: customer.id,
      price_id: faker.string.alpha(10),
    };

    const mock = stripeMock.mockCreateSubscription(stripe, {
      customer: customer.stripe_id,
      price: payload.price_id,
    });

    const res = await agent.post("/api/v1/checkouts").send(payload);
    expect(mock.calledOnce).eq(true);
    expect(res.statusCode).eq(200);
  });
});
