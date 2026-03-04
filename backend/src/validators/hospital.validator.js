// ─── Hospital Registration Validation Schema ─────────────────
// Enforces mandatory fields per the Phase 1 Extension doc:
// state, city, hospital_name, contact_person, phone_1,
// owner_name, license_number (required)
// phone_2, total_staff_count, doctors[] (optional)

const { z } = require("zod");

const phoneRegex = /^[6-9]\d{9}$/;

// Schema for each doctor in the roster array
const doctorSchema = z.object({
    full_name: z
        .string({ required_error: "Doctor name is required" })
        .trim()
        .min(2, "Doctor name must be at least 2 characters"),

    specialization: z
        .string({ required_error: "Specialization is required" })
        .trim()
        .min(2, "Specialization must be at least 2 characters"),

    experience: z
        .number({ invalid_type_error: "Experience must be a number" })
        .int("Experience must be a whole number")
        .min(0, "Experience cannot be negative")
        .max(70, "Experience must be realistic")
        .optional(),
});

const hospitalSchema = z.object({
    state: z
        .string({ required_error: "State is required" })
        .trim()
        .min(1, "State cannot be empty"),

    city: z
        .string({ required_error: "City is required" })
        .trim()
        .min(1, "City cannot be empty"),

    hospital_name: z
        .string({ required_error: "Hospital name is required" })
        .trim()
        .min(2, "Hospital name must be at least 2 characters"),

    contact_person: z
        .string({ required_error: "Contact person is required" })
        .trim()
        .min(2, "Contact person name must be at least 2 characters"),

    phone_1: z
        .string({ required_error: "Primary phone number is required" })
        .trim()
        .regex(phoneRegex, "Phone number must be a valid 10-digit Indian mobile number"),

    phone_2: z
        .string()
        .trim()
        .regex(phoneRegex, "Secondary phone must be a valid 10-digit Indian mobile number")
        .optional()
        .or(z.literal("")),

    // ─── Phase 1 Extension: Ownership Fields ─────────────────
    owner_name: z
        .string({ required_error: "Owner name is required" })
        .trim()
        .min(2, "Owner name must be at least 2 characters"),

    license_number: z
        .string({ required_error: "License number is required" })
        .trim()
        .min(3, "License number must be at least 3 characters"),

    total_staff_count: z
        .number({ invalid_type_error: "Total staff count must be a number" })
        .int("Staff count must be a whole number")
        .min(0, "Staff count cannot be negative")
        .optional(),

    // ─── Phase 1 Extension: Doctor Roster ────────────────────
    doctors: z.array(doctorSchema).optional(),

    // ─── Phase 3: Chemist Registry ───────────────────────────
    chemist_shop_name: z
        .string({ required_error: "Chemist shop name is required" })
        .trim()
        .min(2, "Chemist shop name must be at least 2 characters"),

    chemist_staff_password: z
        .string({ required_error: "Chemist staff password is required" })
        .trim()
        .min(6, "Chemist staff password must be at least 6 characters"),

    // ─── Hospital Owner Auth ──────────────────────────────────
    email: z
        .string({ required_error: "Email is required" })
        .email("Enter a valid email address"),

    password: z
        .string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters"),
});

module.exports = hospitalSchema;
