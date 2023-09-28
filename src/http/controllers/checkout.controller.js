const express = require("express");
const joi = require("joi");
const { autoValidate } = require("../middlewares/joi");
const { hello } = require("../middlewares/defaults");

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
 * payment can be recurring or one-time, depending on the incoming payload
 * @param {import("knex").Knex} db db connection
 * @param {import("stripe").Stripe} stripe instance of stripe SDK
 * @returns an express middleware
 */
function initiate(db, stripe) {
  const customers = db("customers");

  return async (req, res, next) => {};
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
    initiate(initiate(db, stripe)),
    hello
  );

  app.use("/api/v1", router);
};
