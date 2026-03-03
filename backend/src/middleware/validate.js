// ─── Zod Validation Middleware Factory ────────────────────────
// Takes a Zod schema and returns Express middleware that validates
// req.body against it. On failure, the ZodError is forwarded to
// the global error handler, which formats field-level messages.

const validate = (schema) => {
    return (req, res, next) => {
        try {
            // parse() throws ZodError on validation failure
            schema.parse(req.body);
            next();
        } catch (error) {
            next(error); // Forward to global error handler
        }
    };
};

module.exports = validate;
