// ─── Patient Registration Controller ─────────────────────────
// POST /api/v1/register/patient
// Logic: Validates email/phone uniqueness. Creates Patient record
// and linked Medical_Profile in a single transaction.

const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { recordLastAction } = require("../services/patientDashboard.service");

const getFirstName = (fullName) => {
    if (!fullName || typeof fullName !== "string") return "";
    return fullName.trim().split(/\s+/)[0] || "";
};

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

    await recordLastAction(parseInt(req.user?.id || "0", 10), "Uploaded a medical record");
});

// ─── Get Logged-in Patient Profile ───────────────────────────
// GET /api/v1/patient/profile
// Requires patient JWT via protect middleware
const getPatientProfile = catchAsync(async (req, res, next) => {
    const patientId = req.user?.id;

    if (!patientId) {
        return next(new AppError("Unauthorized: Patient ID not found in token", 401));
    }

    const patient = await prisma.patient.findUnique({
        where: { id: parseInt(patientId, 10) },
        include: {
            medicalProfile: {
                select: {
                    emergency_name: true,
                    emergency_phone: true,
                    allergies: true,
                    medications: true,
                    notes: true,
                },
            },
        },
    });

    if (!patient) {
        return next(new AppError("Patient not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            patient_id: patient.id,
            full_name: patient.full_name,
            first_name: getFirstName(patient.full_name),
            email: patient.email,
            phone: patient.phone,
            age: patient.age,
            gender: patient.gender,
            address: patient.address,
            blood_group: patient.blood_group,
            medical_profile: {
                emergency_contact: patient.medicalProfile?.emergency_name || null,
                emergency_phone: patient.medicalProfile?.emergency_phone || null,
                allergies: patient.medicalProfile?.allergies || null,
                medications: patient.medicalProfile?.medications || null,
                notes: patient.medicalProfile?.notes || null,
            },
        },
    });
});

// ─── Live Queue Tracker Upgrade ───────────────────────────────
// GET /api/v1/patient/queue/active
// Returns active token with queue position, estimated wait, and delay flags.
const getActiveQueueToken = catchAsync(async (req, res, next) => {
    const patientId = req.user?.id;

    if (!patientId) {
        return next(new AppError("Unauthorized: Patient ID not found in token", 401));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointment = await prisma.appointment.findFirst({
        where: {
            patient_id: parseInt(patientId, 10),
            date: { gte: today, lt: tomorrow },
            status: { in: ["BOOKED", "CONFIRMED"] },
        },
        include: {
            doctor: {
                select: {
                    id: true,
                    full_name: true,
                    specialization: true,
                    hospital: {
                        select: { id: true, hospital_name: true },
                    },
                },
            },
        },
        orderBy: [{ date: "asc" }, { token_number: "asc" }],
    });

    if (!appointment) {
        return res.status(200).json({
            status: "success",
            has_active_token: false,
            data: null,
        });
    }

    const patientsAhead = await prisma.appointment.count({
        where: {
            doctor_id: appointment.doctor_id,
            date: appointment.date,
            status: { in: ["BOOKED", "CONFIRMED"] },
            token_number: { lt: appointment.token_number },
        },
    });

    const dayOfWeek = new Date(appointment.date).getDay();
    const doctorSchedule = await prisma.doctorSlot.findUnique({
        where: {
            unique_doctor_day: {
                doctor_id: appointment.doctor_id,
                day_of_week: dayOfWeek,
            },
        },
        select: { slot_duration_minutes: true },
    });

    const avgConsultMinutes = doctorSchedule?.slot_duration_minutes || 15;
    const queueEstimateMinutes = patientsAhead * avgConsultMinutes;

    // Combine scheduled slot time to produce a clock-based lower bound (same as /active-token)
    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = String(appointment.slot || "").split(":").map(Number);
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        appointmentDateTime.setHours(hours, minutes, 0, 0);
    }
    const clockEstimateMinutes = Math.max(
        0,
        Math.ceil((appointmentDateTime.getTime() - Date.now()) / 60000)
    );

    const delayMinutes = appointment.delayMinutes || 0;
    const estimatedWaitMinutes = Math.max(queueEstimateMinutes, clockEstimateMinutes) + delayMinutes;

    // Optional persist (best-effort) so dashboards can show last computed estimate.
    if (appointment.estimatedWaitMinutes !== estimatedWaitMinutes) {
        await prisma.appointment.update({
            where: { id: appointment.id },
            data: { estimatedWaitMinutes },
        });
    }

    res.status(200).json({
        status: "success",
        has_active_token: true,
        data: {
            appointment_id: appointment.id,
            token_number: appointment.token_number,
            doctor: {
                id: appointment.doctor.id,
                name: appointment.doctor.full_name,
                specialty: appointment.doctor.specialization,
            },
            hospital: {
                id: appointment.doctor.hospital.id,
                name: appointment.doctor.hospital.hospital_name,
            },
            date: appointment.date,
            slot: appointment.slot,
            status: appointment.status,
            position_in_queue: patientsAhead + 1,
            patients_ahead: patientsAhead,
            avg_consult_minutes: avgConsultMinutes,
            estimated_wait_minutes: estimatedWaitMinutes,
            delay_minutes: delayMinutes,
            doctor_delay_reason: appointment.doctorDelayReason || null,
        },
    });
});

// ─── Medical Timeline ─────────────────────────────────────────
// GET /api/v1/patient/timeline
const getPatientTimeline = catchAsync(async (req, res, next) => {
    const patientId = req.user?.id;
    if (!patientId) {
        return next(new AppError("Unauthorized: Patient ID not found in token", 401));
    }

    const visits = await prisma.appointment.findMany({
        where: {
            patient_id: parseInt(patientId, 10),
            status: "COMPLETED",
        },
        include: {
            doctor: {
                select: {
                    id: true,
                    full_name: true,
                    specialization: true,
                    hospital: { select: { id: true, hospital_name: true } },
                },
            },
            prescription: {
                select: {
                    id: true,
                    content: true,
                    status: true,
                    createdAt: true,
                },
            },
        },
        orderBy: [{ date: "desc" }, { token_number: "desc" }],
    });

    const data = visits.map((v) => ({
        id: v.id,
        date: v.date,
        slot: v.slot,
        token_number: v.token_number,
        doctor: {
            id: v.doctor.id,
            name: v.doctor.full_name,
            specialty: v.doctor.specialization,
        },
        hospital: {
            id: v.doctor.hospital.id,
            name: v.doctor.hospital.hospital_name,
        },
        diagnosis: v.diagnosis || null,
        notes: v.notes || null,
        prescription: v.prescription
            ? {
                id: v.prescription.id,
                content: v.prescription.content,
                status: v.prescription.status,
                createdAt: v.prescription.createdAt,
            }
            : null,
    }));

    res.status(200).json({
        status: "success",
        results: data.length,
        data,
    });
});

// ─── Health Profile Summary ───────────────────────────────────
// GET /api/v1/patient/health-profile
const getHealthProfile = catchAsync(async (req, res, next) => {
    const patientId = req.user?.id;
    if (!patientId) {
        return next(new AppError("Unauthorized: Patient ID not found in token", 401));
    }

    const patient = await prisma.patient.findUnique({
        where: { id: parseInt(patientId, 10) },
        select: {
            id: true,
            blood_group: true,
            allergies: true,
            chronic_conditions: true,
        },
    });

    if (!patient) return next(new AppError("Patient not found", 404));

    res.status(200).json({
        status: "success",
        data: {
            bloodGroup: patient.blood_group || null,
            allergies: patient.allergies || [],
            chronicConditions: patient.chronic_conditions || [],
        },
    });
});

// PUT /api/v1/patient/health-profile
const updateHealthProfile = catchAsync(async (req, res, next) => {
    const patientId = req.user?.id;
    if (!patientId) {
        return next(new AppError("Unauthorized: Patient ID not found in token", 401));
    }

    const { bloodGroup, allergies, chronicConditions } = req.body || {};

    const updated = await prisma.patient.update({
        where: { id: parseInt(patientId, 10) },
        data: {
            blood_group: typeof bloodGroup === "string" ? bloodGroup.trim() : undefined,
            allergies: Array.isArray(allergies)
                ? allergies.map((s) => String(s).trim()).filter(Boolean)
                : undefined,
            chronic_conditions: Array.isArray(chronicConditions)
                ? chronicConditions.map((s) => String(s).trim()).filter(Boolean)
                : undefined,
        },
        select: {
            blood_group: true,
            allergies: true,
            chronic_conditions: true,
        },
    });

    res.status(200).json({
        status: "success",
        message: "Health profile updated successfully",
        data: {
            bloodGroup: updated.blood_group || null,
            allergies: updated.allergies || [],
            chronicConditions: updated.chronic_conditions || [],
        },
    });

    await recordLastAction(parseInt(patientId, 10), "Updated health profile");
});

// ─── Medication Reminders ─────────────────────────────────────
// GET /api/v1/patient/reminders
const getMedicationReminders = catchAsync(async (req, res, next) => {
    const patientId = req.user?.id;
    if (!patientId) {
        return next(new AppError("Unauthorized: Patient ID not found in token", 401));
    }

    const reminders = await prisma.medicationReminder.findMany({
        where: { patientId: parseInt(patientId, 10) },
        orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
        status: "success",
        results: reminders.length,
        data: reminders,
    });
});

// POST /api/v1/patient/reminders
const createMedicationReminder = catchAsync(async (req, res, next) => {
    const patientId = req.user?.id;
    if (!patientId) {
        return next(new AppError("Unauthorized: Patient ID not found in token", 401));
    }

    const { medicineName, dosage, frequency, startDate, endDate } = req.body || {};

    if (!medicineName || !dosage || !frequency || !startDate) {
        return next(new AppError("medicineName, dosage, frequency, and startDate are required", 400));
    }

    const created = await prisma.medicationReminder.create({
        data: {
            patientId: parseInt(patientId, 10),
            medicineName: String(medicineName).trim(),
            dosage: String(dosage).trim(),
            frequency: String(frequency).trim(),
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            active: true,
        },
    });

    res.status(201).json({
        status: "success",
        message: "Medication reminder created",
        data: created,
    });

    await recordLastAction(parseInt(patientId, 10), "Added a medication reminder");
});

// PATCH /api/v1/patient/reminders/:id
// Toggles active status (or sets explicitly if provided)
const toggleMedicationReminder = catchAsync(async (req, res, next) => {
    const patientId = req.user?.id;
    if (!patientId) {
        return next(new AppError("Unauthorized: Patient ID not found in token", 401));
    }

    const { id } = req.params;
    const { active } = req.body || {};

    const reminder = await prisma.medicationReminder.findUnique({
        where: { id },
    });

    if (!reminder) return next(new AppError("Reminder not found", 404));
    if (reminder.patientId !== parseInt(patientId, 10)) {
        return next(new AppError("You do not have permission to update this reminder", 403));
    }

    const nextActive = typeof active === "boolean" ? active : !reminder.active;
    const updated = await prisma.medicationReminder.update({
        where: { id },
        data: { active: nextActive },
    });

    res.status(200).json({
        status: "success",
        message: "Medication reminder updated",
        data: updated,
    });

    await recordLastAction(parseInt(patientId, 10), nextActive ? "Activated a medication reminder" : "Marked a medication reminder inactive");
});

// ─── Get Current Active Token For Patient ────────────────────
// GET /api/v1/patient/active-token
// Returns the patient's current-day active appointment token if present.
const getActiveToken = catchAsync(async (req, res, next) => {
    const patientId = req.user?.id;

    if (!patientId) {
        return next(new AppError("Unauthorized: Patient ID not found in token", 401));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointment = await prisma.appointment.findFirst({
        where: {
            patient_id: parseInt(patientId, 10),
            date: {
                gte: today,
                lt: tomorrow,
            },
            status: {
                in: ["BOOKED", "CONFIRMED"],
            },
        },
        include: {
            doctor: {
                select: {
                    id: true,
                    full_name: true,
                    specialization: true,
                    hospital: {
                        select: {
                            id: true,
                            hospital_name: true,
                        },
                    },
                },
            },
        },
        orderBy: [{ date: "asc" }, { token_number: "asc" }],
    });

    if (!appointment) {
        return res.status(200).json({
            status: "success",
            has_active_token: false,
            data: null,
        });
    }

    const patientsAhead = await prisma.appointment.count({
        where: {
            doctor_id: appointment.doctor_id,
            date: appointment.date,
            status: {
                in: ["BOOKED", "CONFIRMED"],
            },
            token_number: {
                lt: appointment.token_number,
            },
        },
    });

    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = String(appointment.slot || "").split(":").map(Number);
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        appointmentDateTime.setHours(hours, minutes, 0, 0);
    }

    const dayOfWeek = new Date(appointment.date).getDay();
    const doctorSchedule = await prisma.doctorSlot.findUnique({
        where: {
            unique_doctor_day: {
                doctor_id: appointment.doctor_id,
                day_of_week: dayOfWeek,
            },
        },
        select: {
            slot_duration_minutes: true,
        },
    });

    const slotDuration = doctorSchedule?.slot_duration_minutes || 15;
    const queueEstimateMinutes = patientsAhead * slotDuration;
    const clockEstimateMinutes = Math.max(
        0,
        Math.ceil((appointmentDateTime.getTime() - Date.now()) / 60000)
    );
    const waitTimeMinutes = Math.max(queueEstimateMinutes, clockEstimateMinutes);

    res.status(200).json({
        status: "success",
        has_active_token: true,
        data: {
            appointment_id: appointment.id,
            token_number: appointment.token_number,
            doctor_name: appointment.doctor.full_name,
            specialty: appointment.doctor.specialization,
            hospital_name: appointment.doctor.hospital.hospital_name,
            date: appointment.date,
            slot: appointment.slot,
            status: appointment.status,
            patients_ahead: patientsAhead,
            wait_time_minutes: waitTimeMinutes,
        },
    });
});

module.exports = {
    registerPatient,
    loginPatient,
    uploadAttachment,
    getPatientProfile,
    getActiveQueueToken,
    getPatientTimeline,
    getHealthProfile,
    updateHealthProfile,
    getMedicationReminders,
    createMedicationReminder,
    toggleMedicationReminder,
    getActiveToken,
};
