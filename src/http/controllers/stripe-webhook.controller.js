const express = require("express");
const joi = require("joi");
const { autoValidate } = require("../middlewares/joi");
const { verifyStripePayload } = require("../middlewares/auth");

/**
 * Receives a Stripe webhook event and processes it based on the `type`
 * @param {import("knex").Knex} db db connection
 * @returns {express.RequestHandler} an express middleware
 */
function initiate(db) {
  return async (req, res, next) => {
    /** @type {import ("./dto").StripeWebhook}  */
    const body = req.body;
    let handled = false;
    switch (body.type) {
      case "customer.subscription.created":
        handled = true;
        // handle customer subscription logic
        break;
      case "customer.subscription.deleted":
        handled = true;
        // delete customer subscription
        break;
      case "customer.subscription.updated":
        handled = true;
        // update customer subscription
        break;
      case "invoice.finalization_failed":
        // reattempt or resend invoice to customer email so they can pay manually
        handled = true;
        break;
      case "invoice.paid":
        // record payment
        handled = true;
        break;
      case "invoice.payment_failed":
        // handle logic for this use case
        handled = true;
        break;
      default:
        // default case should not be used, we only care about events we're expecting
        break;
    }
    return res.json({ message: "Hello World!", handled });
  };
}

/**
 * Bootstrap function for setting up stripe webhook handlers.
 * it ensures every dependency is properly passed into where they are needed
 * @param {import("../../index").Container} container
 */
exports.setup = function (container) {
  const { app, stripe } = container;

  const router = express.Router();

  router.post("/webhooks/stripe", verifyStripePayload(stripe), initiate());

  app.use("/api/v1", router);
};
