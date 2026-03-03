// ─── Patient Registration Validation Schema ──────────────────
// Validates both identity fields (Patients table) and medical
// profile fields (Medical_Profiles table) in a single schema.

const { z } = require("zod");

const phoneRegex = /^[6-9]\d{9}$/;

const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const validGenders = ["Male", "Female", "Other"];

const patientSchema = z.object({
    // ── Core Identity (Patients table) ──────────────────────────
    full_name: z
        .string({ required_error: "Full name is required" })
        .trim()
        .min(2, "Full name must be at least 2 characters"),

    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email("Please provide a valid email address")
        .toLowerCase(),

    phone: z
        .string({ required_error: "Phone number is required" })
        .trim()
        .regex(phoneRegex, "Phone must be a valid 10-digit Indian mobile number"),

    age: z
        .number({ required_error: "Age is required", invalid_type_error: "Age must be a number" })
        .int("Age must be a whole number")
        .min(0, "Age cannot be negative")
        .max(150, "Age must be realistic"),

    gender: z
        .string({ required_error: "Gender is required" })
        .trim()
        .refine((val) => validGenders.includes(val), {
            message: `Gender must be one of: ${validGenders.join(", ")}`,
        }),

    address: z
        .string({ required_error: "Address is required" })
        .trim()
        .min(5, "Address must be at least 5 characters"),

    blood_group: z
        .string({ required_error: "Blood group is required" })
        .trim()
        .refine((val) => validBloodGroups.includes(val), {
            message: `Blood group must be one of: ${validBloodGroups.join(", ")}`,
        }),

    // ── Medical Profile (Medical_Profiles table) ────────────────
    emergency_contact_name: z
        .string({ required_error: "Emergency contact name is required" })
        .trim()
        .min(2, "Emergency contact name must be at least 2 characters"),

    emergency_contact_phone: z
        .string({ required_error: "Emergency contact phone is required" })
        .trim()
        .regex(phoneRegex, "Emergency phone must be a valid 10-digit Indian mobile number"),

    allergies: z.string().trim().optional().or(z.literal("")),

    current_medications: z.string().trim().optional().or(z.literal("")),

    condition_notes: z.string().trim().optional().or(z.literal("")),
});

module.exports = patientSchema;
