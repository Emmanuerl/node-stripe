const { ApplicationError } = require("../../internals/http");
const express = require("express");
const env = require("../../config/env");

/**
 * Middleware for verifying if incoming webhooks are from a verified source (stripe)
 * throws `401` if verification fails
 * @param {import ("stripe").Stripe} stripe - Stripe SDK
 * @returns {express.RequestHandler} an express middleware function
 */
function verifyStripePayload(stripe) {
  return (req, res, next) => {
    try {
      const sig = req.headers["stripe-signature"];
      if (!sig) throw new Error("Stripe signature not sent");
      req.body = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.stripe_signing_secret
      );
      return next();
    } catch (error) {
      return next(
        new ApplicationError(
          401,
          "We could not verify the source of this request."
        )
      );
    }
  };
}

module.exports = {
  verifyStripePayload,
};
