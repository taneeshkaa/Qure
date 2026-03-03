// ─── Global Error Handler ────────────────────────────────────
// Catches ALL errors thrown/forwarded in the Express pipeline.
// Maps Prisma-specific, Zod validation, and custom errors to
// clean JSON responses. This is critical for the Neon DB integration
// where connection timeouts and unique constraint violations are expected.

const { Prisma } = require("@prisma/client");
const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let status = err.status || "error";
    let message = err.message || "Something went wrong";
    let errors = null;

    // ─── Zod Validation Errors (400) ────────────────────────────
    // Triggered when req.body fails schema validation
    // Zod v4 uses `.issues` instead of `.errors`
    if (err instanceof ZodError) {
        statusCode = 400;
        status = "fail";
        message = "Validation failed";
        const zodIssues = err.issues || err.errors || [];
        errors = zodIssues.map((e) => ({
            field: (e.path || []).join("."),
            message: e.message,
        }));
    }

    // ─── Prisma: Unique Constraint Violation (409) ──────────────
    // Error code P2002 — e.g. duplicate email, phone, or hospital name
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            statusCode = 409;
            status = "fail";
            const target = err.meta?.target;
            if (Array.isArray(target)) {
                message = `A record with this ${target.join(", ")} already exists`;
            } else {
                message = `A record with this value already exists (duplicate constraint: ${target})`;
            }
        }

        // ─── Prisma: Record Not Found (404) ─────────────────────────
        // Error code P2025 — e.g. referencing a non-existent location_id
        else if (err.code === "P2025") {
            statusCode = 404;
            status = "fail";
            message = err.meta?.cause || "The requested record was not found";
        }

        // ─── Prisma: Foreign Key Violation (400) ────────────────────
        else if (err.code === "P2003") {
            statusCode = 400;
            status = "fail";
            message = `Invalid reference: the related ${err.meta?.field_name || "record"} does not exist`;
        }

        // ─── Other Known Prisma Errors ──────────────────────────────
        else {
            statusCode = 400;
            status = "fail";
            message = `Database error: ${err.message}`;
        }
    }

    // ─── Prisma: Validation Error (400) ───────────────────────────
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        status = "fail";
        message = "Invalid data sent to the database. Please check your input.";
    }

    // ─── Prisma: Connection / Timeout Errors (503) ────────────────
    // This handles Neon serverless cold-start timeouts and connection pool exhaustion
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        statusCode = 503;
        status = "error";
        message = "Database service is temporarily unavailable. Please try again shortly.";
        console.error("[DB CONNECTION ERROR]", err.message);
    }

    // ─── Prisma: Rust Engine Panic (500) ──────────────────────────
    else if (err instanceof Prisma.PrismaClientRustPanicError) {
        statusCode = 500;
        status = "error";
        message = "A critical database error occurred. Please contact support.";
        console.error("[DB CRITICAL ERROR]", err.message);
    }

    // ─── Custom AppError (operational) ────────────────────────────
    else if (err.isOperational) {
        // Already has statusCode and message set
        statusCode = err.statusCode;
        status = err.status;
        message = err.message;
    }

    // ─── Unknown / Unhandled Errors (500) ─────────────────────────
    else {
        console.error("[UNHANDLED ERROR]", err);
        statusCode = 500;
        status = "error";
        message =
            process.env.NODE_ENV === "production"
                ? "An unexpected error occurred"
                : err.message;
    }

    // ─── Send Response ────────────────────────────────────────────
    const response = {
        status,
        message,
    };

    if (errors) {
        response.errors = errors;
    }

    // Include stack trace in development only
    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
