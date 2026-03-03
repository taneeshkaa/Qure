// ─── Admin Route Validator ─────────────────────────────────────

const { z } = require("zod");

// Reused schema bits
const emailSchema = z.string({ required_error: "Email is required" })
    .trim()
    .email("Valid email required")
    .toLowerCase();

const passwordSchema = z.string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters");

const adminAuthSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

module.exports = {
    adminAuthSchema,
};
