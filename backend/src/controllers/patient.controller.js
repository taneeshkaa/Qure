// ─── Patient Registration Controller ─────────────────────────
// POST /api/v1/register/patient
// Logic: Validates email/phone uniqueness. Creates Patient record
// and linked Medical_Profile in a single transaction.

const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const registerPatient = catchAsync(async (req, res, next) => {
    const {
        full_name,
        email,
        phone,
        age,
        gender,
        address,
        blood_group,
        emergency_contact_name,
        emergency_contact_phone,
        allergies,
        current_medications,
        condition_notes,
    } = req.body;

    // Step 1: Check for existing email
    const existingEmail = await prisma.patient.findUnique({
        where: { email: email.toLowerCase().trim() },
    });

    if (existingEmail) {
        return next(
            new AppError(
                `A patient with email "${email}" is already registered`,
                409
            )
        );
    }

    // Step 2: Check for existing phone
    const existingPhone = await prisma.patient.findUnique({
        where: { phone: phone.trim() },
    });

    if (existingPhone) {
        return next(
            new AppError(
                `A patient with phone number "${phone}" is already registered`,
                409
            )
        );
    }

    // Step 3: Create Patient + MedicalProfile in a transaction
    // This ensures both records are created atomically —
    // if one fails, both are rolled back.
    const result = await prisma.$transaction(async (tx) => {
        // Create the patient record
        const patient = await tx.patient.create({
            data: {
                full_name: full_name.trim(),
                email: email.toLowerCase().trim(),
                phone: phone.trim(),
                age,
                gender: gender.trim(),
                address: address.trim(),
                blood_group: blood_group.trim(),
            },
        });

        // Create the linked medical profile
        const medicalProfile = await tx.medicalProfile.create({
            data: {
                patient_id: patient.id,
                emergency_name: emergency_contact_name.trim(),
                emergency_phone: emergency_contact_phone.trim(),
                allergies: allergies ? allergies.trim() : null,
                medications: current_medications ? current_medications.trim() : null,
                notes: condition_notes ? condition_notes.trim() : null,
            },
        });

        return { patient, medicalProfile };
    });

    res.status(201).json({
        status: "success",
        message: "Patient registered successfully",
        data: {
            patient_id: result.patient.id,
            full_name: result.patient.full_name,
            email: result.patient.email,
            phone: result.patient.phone,
            age: result.patient.age,
            gender: result.patient.gender,
            blood_group: result.patient.blood_group,
            medical_profile: {
                emergency_contact: result.medicalProfile.emergency_name,
                emergency_phone: result.medicalProfile.emergency_phone,
                allergies: result.medicalProfile.allergies,
                medications: result.medicalProfile.medications,
                notes: result.medicalProfile.notes,
            },
        },
    });
});

// ─── Patient Login ──────────────────────────────────────────────
// POST /api/v1/patient/login
// Accepts email (for dev/demo, password is optional)
// Returns JWT token and patient info
const loginPatient = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError("Email is required", 400));
    }

    // Search for patient by email
    const patient = await prisma.patient.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: {
            medicalProfile: {
                select: {
                    allergies: true,
                    medications: true,
                    notes: true,
                },
            },
        },
    });

    if (!patient) {
        return next(new AppError("Patient not found. Please register first.", 404));
    }

    // Generate JWT token
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
        {
            id: patient.id,
            email: patient.email,
            role: "PATIENT",
        },
        process.env.JWT_SECRET || "fallback_secret_for_dev_only",
        { expiresIn: "7d" }
    );

    console.log(`✅ Patient login successful - Patient ID: ${patient.id}, Email: ${patient.email}`);

    res.status(200).json({
        status: "success",
        message: "Login successful",
        token,
        data: {
            patient_id: patient.id,
            full_name: patient.full_name,
            email: patient.email,
            phone: patient.phone,
            role: "PATIENT",
        },
    });
});

// POST /api/v1/patient/upload
// Expects: multipart/form-data with a file, `appointment_id`, and `category`
const uploadAttachment = catchAsync(async (req, res, next) => {
    const { appointment_id, category } = req.body;

    if (!req.file) {
        return next(new AppError("Please provide a file to upload", 400));
    }

    if (!appointment_id || !category) {
        return next(new AppError("appointment_id and category are required", 400));
    }

    // Validate Category ENUM ('Test', 'Prescription', 'Medicine')
    const validCategories = ["Test", "Prescription", "Medicine"];
    if (!validCategories.includes(category)) {
        return next(new AppError(`Invalid category. Must be one of: ${validCategories.join(", ")}`, 400));
    }

    const apptId = parseInt(appointment_id, 10);
    if (isNaN(apptId)) {
        return next(new AppError("Invalid appointment_id format", 400));
    }

    // 1. Check if appointment exists
    const appointment = await prisma.appointment.findUnique({
        where: { id: apptId },
    });

    if (!appointment) {
        return next(new AppError("Appointment not found", 404));
    }

    // 2. Upload to Cloudinary using a stream (since file is in memory)
    const cloudinary = require("../config/cloudinary");

    // Wrap the stream process in a Promise
    const uploadToCloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "queueease_medical_attachments" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            // Pipe the buffer to the stream
            const stream = require("stream");
            const bufferStream = new stream.PassThrough();
            bufferStream.end(fileBuffer);
            bufferStream.pipe(uploadStream);
        });
    };

    let cloudResult;
    try {
        cloudResult = await uploadToCloudinary(req.file.buffer);
    } catch (error) {
        return next(new AppError("Error uploading file to cloud storage", 500));
    }

    // 3. Save reference in Database
    const attachment = await prisma.medicalAttachment.create({
        data: {
            appointment_id: apptId,
            file_url: cloudResult.secure_url,
            file_type: req.file.mimetype,
            category: category,
        },
    });

    res.status(201).json({
        status: "success",
        message: "File uploaded successfully",
        data: { attachment },
    });
});

module.exports = { registerPatient, loginPatient, uploadAttachment };
