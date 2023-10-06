const { ApplicationError } = require("../../internals/http");
const { validate, DataValidationError } = require("../../internals/joi");
const joi = require("joi");

/**
 * Creates a middleware that validate the given request body
 * respond with status code `422`(with appropriate metadata) when
 * schema validation fails.
 * @param {joi.SchemaLike} schema schema to use for validation
 * @returns a middleware
 */
function autoValidate(schema) {
  return (req, _res, next) => {
    try {
      req.body = validate(req.body, schema);
      next();
    } catch (err) {
      if (err instanceof DataValidationError) {
        throw new ApplicationError(
          422,
          "Your request body is invalid",
          err.messages
        );
      }

      throw err;
    }
  };
}

exports.autoValidate = autoValidate;
