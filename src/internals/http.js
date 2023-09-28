/**
 * Application Error Wrapper
 */
class ApplicationError extends Error {
  /**
   * Creates a new instance of the Application Error
   * @param {number} code
   * @param {string} message
   * @param {any} data
   */
  constructor(code, message, data) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

exports.ApplicationError = ApplicationError;
