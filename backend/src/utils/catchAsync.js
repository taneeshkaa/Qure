// ─── Async Error Catcher ─────────────────────────────────────
// Wraps async route handlers so that any rejected promise is
// automatically forwarded to Express's global error handler.
// Without this, unhandled async errors would crash the server.

const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = catchAsync;
