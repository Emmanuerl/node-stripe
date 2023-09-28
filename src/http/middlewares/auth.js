const { ApplicationError } = require("../../internals/http");
const express = require("express");

/**
 * Middleware for verifying if incoming webhooks are from a verified source (stripe)
 * throws `401` if verification fails
 * @param {express.Request} req - incoming request
 * @param {express.Response } res - response handler
 * @param {express.NextFunction} next - function for passing context to next handler
 * @returns
 */
async function isStripeWebhook(req, res, next) {
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
}

module.exports = {
  isStripeWebhook,
};
