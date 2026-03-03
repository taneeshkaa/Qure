// ─── Custom Application Error ────────────────────────────────
// Used for throwing known, operational errors with proper status codes.
// The global error handler distinguishes these from unexpected errors.

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        // Captures a clean stack trace, excluding the constructor call
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
