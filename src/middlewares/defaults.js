const express = require("express");
const ss = require("ss-component-payments");

/**
 * Middleware for automatically interpreting `ApplicationError` and. It responsds
 * with `INTERNAL_SERVER_ERROR` if the error is not recognized.
 * @param {Error} err
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns
 */
exports.errorHandler = function (err, req, res, next) {
  if (err instanceof ss.ApplicationError) {
    res.status(err.code).json({ message: err.message, data: err.data });
  } else {
    console.log(err);
    res.status(500).json({
      message: "We are having system level issues. Please bear with us",
    });
  }
};
