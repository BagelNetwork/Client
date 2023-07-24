// error class for bagel
class BagelError extends Error {
    constructor(...args) {
      super();
      Error.captureStackTrace(this, BagelError);
    }
  
    code() {
        // Return an appropriate HTTP response code for this error
        return 400; // Bad Request
    }
  
    message() {
        // Return a human-readable message for this error
        return this.args.join(", ");
    }
  
    static name() {
        // Return the name of this error type
        throw new Error("The name() method must be implemented by the subclass.");
        
    }
  }

// error class for duplicate id
class DuplicateIDError extends BagelError {
    static name() {
        // Return the name of this error type
        return "DuplicateID";
    }
}

// error types
const error_types = {
    "DuplicateID": DuplicateIDError,
};

module.exports = { BagelError, DuplicateIDError, error_types };
  