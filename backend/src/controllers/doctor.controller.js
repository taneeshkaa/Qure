// ─── Doctor Controller (Phase 3) ─────────────────────────────
// GET  /api/v1/doctor/patient-card/:token — Fetch patient + appointment data
// POST /api/v1/doctor/prescribe           — Send prescription to chemist

const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// ─── Get Patient Card ────────────────────────────────────────
// Retrieves the complete medical summary for a given token number.
// Requires ?doctor_id=X query param to scope to the correct doctor + today.
const getPatientCard = catchAsync(async (req, res, next) => {
    const tokenNumber = parseInt(req.params.token, 10);
    const doctorId = parseInt(req.query.doctor_id, 10);

    if (isNaN(tokenNumber)) {
        return next(new AppError("Invalid token number", 400));
    }
    if (isNaN(doctorId)) {
        return next(new AppError("doctor_id query parameter is required and must be a number", 400));
    }

    // Build today's date range (start of day → end of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // JOIN query: Appointment → Patient → MedicalProfile
    const appointment = await prisma.appointment.findFirst({
        where: {
            token_number: tokenNumber,
            doctor_id: doctorId,
            date: {
                gte: today,
                lt: tomorrow,
            },
        },
        include: {
            patient: {
                select: {
                    full_name: true,
                    phone: true,
                    age: true,
                    gender: true,
                    blood_group: true,
                    medicalProfile: {
                        select: {
                            allergies: true,
                            medications: true,
                            notes: true,
                        },
                    },
                },
            },
        },
    });

    if (!appointment) {
        return next(
            new AppError(
                `No appointment found for Token #${tokenNumber} with this doctor today`,
                404
            )
        );
    }

    // Build the patient card response
    const patientCard = {
        token_number: appointment.token_number,
        appointment_id: appointment.id,
        status: appointment.status,
        problem_description: appointment.problem_description,
        patient: {
            full_name: appointment.patient.full_name,
            phone: appointment.patient.phone,
            age: appointment.patient.age,
            gender: appointment.patient.gender,
            blood_group: appointment.patient.blood_group,
            allergies: appointment.patient.medicalProfile?.allergies || "None",
            chronic_diseases: appointment.patient.medicalProfile?.notes || "None",
        },
    };

    res.status(200).json({
        status: "success",
        data: patientCard,
    });
});

// ─── Prescribe ───────────────────────────────────────────────
// Creates a digital prescription record and routes it to the chemist.
// Marks the appointment as COMPLETED.
const prescribe = catchAsync(async (req, res, next) => {
    const { appointment_id, doctor_id, content } = req.body;

    // Step 1: Verify the appointment exists and belongs to this doctor
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointment_id },
        include: {
            doctor: {
                select: {
                    id: true,
                    hospital_id: true,
                },
            },
            prescription: true, // Check if already prescribed
        },
    });

    if (!appointment) {
        return next(new AppError("Appointment not found", 404));
    }

    if (appointment.doctor_id !== doctor_id) {
        return next(
            new AppError("This appointment does not belong to the specified doctor", 403)
        );
    }

    if (appointment.status !== "BOOKED") {
        return next(
            new AppError(
                `Cannot prescribe for an appointment with status "${appointment.status}"`,
                400
            )
        );
    }

    if (appointment.prescription) {
        return next(
            new AppError("A prescription has already been created for this appointment", 409)
        );
    }

    // Step 2: Find the chemist for this doctor's hospital
    const chemist = await prisma.chemist.findUnique({
        where: { hospital_id: appointment.doctor.hospital_id },
    });

    if (!chemist) {
        return next(
            new AppError("No chemist/pharmacy is registered for this hospital", 404)
        );
    }

    // Step 3: Create prescription + mark appointment as COMPLETED (atomic)
    const result = await prisma.$transaction(async (tx) => {
        const prescription = await tx.prescription.create({
            data: {
                appointment_id,
                doctor_id,
                chemist_id: chemist.id,
                content: content.trim(),
                status: "PENDING",
            },
        });

        await tx.appointment.update({
            where: { id: appointment_id },
            data: { status: "COMPLETED" },
        });

        return prescription;
    });

    res.status(201).json({
        status: "success",
        message: "Prescription sent to chemist",
        data: {
            prescription_id: result.id,
            appointment_id: result.appointment_id,
            chemist_shop: chemist.shop_name,
            content: result.content,
            status: result.status,
        },
    });
});

// ─── Attachments (Phase 4) ───────────────────────────────────
// GET /api/v1/doctor/attachments/:apptId
// Fetches all medical attachments for a given appointment.
const getPatientAttachments = catchAsync(async (req, res, next) => {
    const apptId = parseInt(req.params.apptId, 10);

    if (isNaN(apptId)) {
        return next(new AppError("Invalid appointment ID format", 400));
    }

    // Ensure the appointment exists
    const appointment = await prisma.appointment.findUnique({
        where: { id: apptId },
    });

    if (!appointment) {
        return next(new AppError("Appointment not found", 404));
    }

    // Fetch the attachments
    const attachments = await prisma.medicalAttachment.findMany({
        where: { appointment_id: apptId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            file_url: true,
            file_type: true,
            category: true,
            createdAt: true,
        }
    });

    res.status(200).json({
        status: "success",
        results: attachments.length,
        data: { attachments },
    });
});

module.exports = { getPatientCard, prescribe, getPatientAttachments };
