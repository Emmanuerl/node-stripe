require("../src/config/env");

const request = require("supertest");
const express = require("express");
const stripeUtils = require("./helpers/stripe");
const { setup } = require("../src/http/controllers/stripe-webhook.controller");
const { parseBody } = require("../src/http/middlewares/http");
const { expect } = require("chai");
const env = require("../src/config/env");

let app;
const stripe = require("stripe")(env.stripe_secret_key);
const path = "/api/v1/webhooks/stripe";

before(() => {
  app = express();

  app.use(parseBody);
  app.use(express.urlencoded({ extended: true }));

  setup({ app, stripe });
});

describe("Webhooks#reveive", () => {
  it("receives a customer.subscription.created event", async () => {
    const webhook = stripeUtils.newWebhook({
      type: "customer.subscription.created",
    });
    const body = JSON.stringify(webhook);
    const signature = stripeUtils.signRequest(stripe, body);

    const res = await request(app).post(path).send(body).set({
      "stripe-signature": signature,
      "Content-Type": "application/json",
      "Content-Length": body.length,
    });

    expect(res.statusCode).eq(200);
    expect(res.body.message).eq("Hello World!");
    expect(res.body.handled).eq(true);
  });

  it("receives a customer.subscription.updated event", async () => {
    const webhook = stripeUtils.newWebhook({
      type: "customer.subscription.updated",
    });
    const body = JSON.stringify(webhook);
    const signature = stripeUtils.signRequest(stripe, body);

    const res = await request(app).post(path).send(body).set({
      "stripe-signature": signature,
      "Content-Type": "application/json",
      "Content-Length": body.length,
    });

    expect(res.statusCode).eq(200);
    expect(res.body.message).eq("Hello World!");
    expect(res.body.handled).eq(true);
  });

  it("receives a  customer.subscription.deleted event", async () => {
    const webhook = stripeUtils.newWebhook({
      type: "customer.subscription.deleted",
    });
    const body = JSON.stringify(webhook);
    const signature = stripeUtils.signRequest(stripe, body);

    const res = await request(app).post(path).send(body).set({
      "stripe-signature": signature,
      "Content-Type": "application/json",
      "Content-Length": body.length,
    });

    expect(res.statusCode).eq(200);
    expect(res.body.message).eq("Hello World!");
    expect(res.body.handled).eq(true);
  });

  it("receives a invoice.paid event", async () => {
    const webhook = stripeUtils.newWebhook({
      type: "invoice.paid",
    });
    const body = JSON.stringify(webhook);
    const signature = stripeUtils.signRequest(stripe, body);

    const res = await request(app).post(path).send(body).set({
      "stripe-signature": signature,
      "Content-Type": "application/json",
      "Content-Length": body.length,
    });

    expect(res.statusCode).eq(200);
    expect(res.body.message).eq("Hello World!");
    expect(res.body.handled).eq(true);
  });

  it("receives a invoice.payment_failed event", async () => {
    const webhook = stripeUtils.newWebhook({
      type: "invoice.payment_failed",
    });
    const body = JSON.stringify(webhook);
    const signature = stripeUtils.signRequest(stripe, body);

    const res = await request(app).post(path).send(body).set({
      "stripe-signature": signature,
      "Content-Type": "application/json",
      "Content-Length": body.length,
    });

    expect(res.statusCode).eq(200);
    expect(res.body.message).eq("Hello World!");
    expect(res.body.handled).eq(true);
  });

  it("receives a invoice.finalization_failed event", async () => {
    const webhook = stripeUtils.newWebhook({
      type: "invoice.finalization_failed",
    });
    const body = JSON.stringify(webhook);
    const signature = stripeUtils.signRequest(stripe, body);

    const res = await request(app).post(path).send(body).set({
      "stripe-signature": signature,
      "Content-Type": "application/json",
      "Content-Length": body.length,
    });

    expect(res.statusCode).eq(200);
    expect(res.body.message).eq("Hello World!");
    expect(res.body.handled).eq(true);
  });

  it("ignores any unrecognized event", async () => {
    const webhook = stripeUtils.newWebhook({
      type: "payment_intent.succeeded",
    });
    const body = JSON.stringify(webhook);
    const signature = stripeUtils.signRequest(stripe, body);

    const res = await request(app).post(path).send(body).set({
      "stripe-signature": signature,
      "Content-Type": "application/json",
      "Content-Length": body.length,
    });

    expect(res.statusCode).eq(200);
    expect(res.body.message).eq("Hello World!");
    expect(res.body.handled).eq(false);
  });
});
