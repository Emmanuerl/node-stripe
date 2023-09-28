const express = require("express");
const joi = require("joi");
const { autoValidate } = require("../middlewares/joi");

// validation schema for initiating checkouts
const initiateCheckoutSchema = joi
  .object({
    price_id: joi.string(),
    amount: joi.number().positive(),
    customer_id: joi.string().required(),
  })
  .xor("price_id", "amount");

/**
 * Initiates a stripe checkout session.
 * payment can be recurring or one-time, depending on the incoming payload:
 * a price_id indicates a recurring checkout, while an amount indicates a one-off payment
 * @param {import("knex").Knex} db db connection
 * @param {import("stripe").Stripe} stripe instance of stripe SDK
 * @returns an express middleware
 */
function initiate(db, stripe) {
  const customers = db("customers");

  return async (req, res, next) => {
    /** @type {import("./dto").InitiateCheckoutDTO}  */
    const body = req.body;
    /** @type {import("../../index").Customer}  */

    const customer = await customers.where("id", body.customer_id).first("*");
    if (body.amount) {
      let invoice = await stripe.invoices.create({
        customer: customer.stripe_id,
        collection_method: "charge_automatically",
        days_until_due: 1,
      });

      await stripe.invoiceItems.create({
        customer: customer.stripe_id,
        amount: body.amount * 100, // convert to cents
        invoice: invoice.id,
      });

      invoice = await stripe.invoices.finalizeInvoice(invoice.id, {
        expand: ["payment_intent"],
      });

      return res.json({ client_secret: invoice.payment_intent.client_secret });
    }

    // handle recurring subscriptions
    const subscription = await stripe.subscriptions.create({
      customer: customer.stripe_id,
      items: [
        {
          price: body.price_id,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    return res.json({
      client_secret: "subscription.latest_invoice.payment_intent.client_secret",
    });
  };
}

/**
 * Bootstrap function for setting up checkout controllers.
 * it ensures every dependency is properly passed into where they are needed
 * @param {import("../../index").Container} container
 */
exports.setup = function (container) {
  const { app, db, stripe } = container;

  const router = express.Router();

  router.post(
    "/checkouts",
    autoValidate(initiateCheckoutSchema),
    initiate(db, stripe)
  );

  app.use("/api/v1", router);
};
