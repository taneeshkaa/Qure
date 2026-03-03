// ─── Appointment Booking Validation Schema ───────────────────
// Validates the request body for POST /api/v1/appointments/book.

const { z } = require("zod");

const timeSlotRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM (24-hour)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

const appointmentSchema = z.object({
    doctor_id: z
        .number({
            required_error: "Doctor ID is required",
            invalid_type_error: "Doctor ID must be a number",
        })
        .int("Doctor ID must be a whole number")
        .positive("Doctor ID must be positive"),

    patient_id: z
        .number({
            required_error: "Patient ID is required",
            invalid_type_error: "Patient ID must be a number",
        })
        .int("Patient ID must be a whole number")
        .positive("Patient ID must be positive"),

    date: z
        .string({ required_error: "Date is required" })
        .trim()
        .regex(dateRegex, "Date must be in YYYY-MM-DD format"),

    slot: z
        .string({ required_error: "Time slot is required" })
        .trim()
        .regex(timeSlotRegex, "Slot must be in HH:MM format (24-hour)"),

    problem_description: z
        .string({ required_error: "Problem description is required" })
        .trim()
        .min(5, "Problem description must be at least 5 characters"),
});

module.exports = appointmentSchema;
