const express = require("express");
const raw = ["/webhooks/stripe"];

/**
 * Parses the incoming json request
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
function parseBody(req, res, next) {
  const isRaw = raw.some((r) => req.originalUrl.endsWith(r));
  if (isRaw) {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
}

module.exports = { parseBody };
