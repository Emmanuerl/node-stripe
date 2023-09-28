const joi = require("joi");
const { validate, DataValidationError } = require("../internals/joi");

require("dotenv").config();

const schema = {
  port: joi.number().required(),
  stripe_secret_key: joi.string().required(),
  database_url: joi.string().uri(),
};

/**
 * Loads the required environment variables into a map for easy access across the app.
 * @returns {Record<keyof schema, string | number>} the map of env values wtth key converted to it's lower case form
 */
function loadEnv() {
  const lowerisedEnv = Object.keys(process.env).reduce((obj, key) => {
    obj[key.toLowerCase()] = process.env[key];
    return obj;
  }, {});

  try {
    return validate(lowerisedEnv, schema);
  } catch (err) {
    if (err instanceof DataValidationError) {
      throw new Error(JSON.stringify(err.messages, null, 2));
    }
    throw err;
  }
}

module.exports = loadEnv();
