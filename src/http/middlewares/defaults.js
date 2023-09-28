const express = require("express");
const { ApplicationError } = require("../../internals/http");

/**
 * Middleware for automatically interpreting `ApplicationError` and. It responsds
 * with `INTERNAL_SERVER_ERROR` if the error is not recognized.
 * @param {Error} err
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns
 */
function error(err, req, res, next) {
  if (err instanceof ApplicationError) {
    res.status(err.code).json({ message: err.message, data: err.data });
  } else {
    console.log(err);
    res.status(500).json({
      message: "We are having system level issues. Please bear with us",
    });
  }
}

/**
 * Error handler for unknown routes
 * @param {Error} err
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns
 */
function notFound(req, res, next) {
  return next(new ApplicationError(404, "Resource not found"));
}

/**
 * Bind default handlers to http requests
 * @param {import("../../index").Container} container
 */
exports.setup = function ({ app }) {
  app.use(notFound);
  app.use(error);
};
