// ─── Prescription Validation Schema (Phase 3) ────────────────
// Validates the request body for POST /api/v1/doctor/prescribe.

const { z } = require("zod");

const prescriptionSchema = z.object({
    appointment_id: z
        .number({
            required_error: "Appointment ID is required",
            invalid_type_error: "Appointment ID must be a number",
        })
        .int("Appointment ID must be a whole number")
        .positive("Appointment ID must be positive"),

    doctor_id: z
        .number({
            required_error: "Doctor ID is required",
            invalid_type_error: "Doctor ID must be a number",
        })
        .int("Doctor ID must be a whole number")
        .positive("Doctor ID must be positive"),

    content: z
        .string({ required_error: "Prescription content is required" })
        .trim()
        .min(3, "Prescription content must be at least 3 characters"),
});

module.exports = prescriptionSchema;
