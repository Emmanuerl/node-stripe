const joi = require("joi");


/**
 * Validate the data using the given schema and extract a message map if it fails
 * @param {any} data object to validate
 * @param {joi.SchemaLike} schema joi schema to use for validation
 * @returns the parsed value by joi or throws `DataValidationError` if validation fails
 */
function validate(data, schema) {
  const realSchema = joi.compile(schema);
  const { error, value } = realSchema.validate(data, { abortEarly: false, stripUnknown: true });

  if (error) {
    throw new DataValidationError(error);
  }

  return value;
}

/**
 * Contains a field to error message map extracted from the ValidationError
 */
class DataValidationError extends Error {
  messages = {};

  constructor(baseErr) {
    super("Could not validate the given that");
    baseErr.details.forEach(detail => {
      this.messages[detail.context.label] = detail.message;
    });
  }
}

exports.validate = validate;
exports.DataValidationError = DataValidationError;