// ─── Chemist Verify Validation Schema (Phase 3) ──────────────
// Validates the request body for PATCH /api/v1/chemist/verify/:id.

const { z } = require("zod");

const chemistVerifySchema = z.object({
    chemist_id: z
        .number({
            required_error: "Chemist ID is required",
            invalid_type_error: "Chemist ID must be a number",
        })
        .int("Chemist ID must be a whole number")
        .positive("Chemist ID must be positive"),

    confirm: z
        .boolean({ invalid_type_error: "Confirm must be a boolean" })
        .optional(),
});

module.exports = chemistVerifySchema;
