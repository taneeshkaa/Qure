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

// ─── Get All Doctors (Patient-facing) ─────────────────────────
// GET /api/v1/doctors
// Optional query params: ?specialty=Neurologist (case-insensitive)
const getDoctors = catchAsync(async (req, res, next) => {
    const { specialty } = req.query;

    const where = {
        deletedAt: null, // Exclude soft-deleted doctors
    };
    if (specialty && specialty.trim()) {
        where.specialization = {
            contains: specialty.trim(),
            mode: 'insensitive',
        };
    }

    const doctors = await prisma.doctor.findMany({
        where,
        include: {
            hospital: {
                select: {
                    id: true,
                    hospital_name: true,
                    phone_1: true,
                    location: {
                        select: {
                            state_name: true,
                            city_name: true,
                        },
                    },
                },
            },
        },
        orderBy: { full_name: 'asc' },
    });

    console.log(`📋 Fetching doctors${specialty ? ` (specialty: ${specialty})` : ''} - Found ${doctors.length} results`);

    res.status(200).json({
        status: "success",
        results: doctors.length,
        data: doctors,
    });
});

// ─── Get Doctor by ID (Patient-facing) ────────────────────────
// GET /api/v1/doctors/:id
const getDoctorById = catchAsync(async (req, res, next) => {
    const doctorId = parseInt(req.params.id, 10);

    if (isNaN(doctorId)) {
        return next(new AppError("Invalid doctor ID", 400));
    }

    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: {
            hospital: {
                select: {
                    id: true,
                    hospital_name: true,
                    phone_1: true,
                    phone_2: true,
                    address: true,
                    location: {
                        select: {
                            state_name: true,
                            city_name: true,
                        },
                    },
                },
            },
            slots: {
                select: {
                    day_of_week: true,
                    start_time: true,
                    end_time: true,
                    slot_duration_minutes: true,
                },
            },
        },
    });

    if (!doctor) {
        return next(new AppError(`Doctor with ID ${doctorId} not found`, 404));
    }

    console.log(`✅ Fetched doctor: ${doctor.full_name} (ID: ${doctorId})`);

    res.status(200).json({
        status: "success",
        data: doctor,
    });
});

// ─── Get Doctor by Slug (Patient-facing) ─────────────────────
// GET /api/v1/doctors/slug/:slug
// Fetches doctor by URL-friendly slug (e.g., "dr-priya-mehta")
const getDoctorBySlug = catchAsync(async (req, res, next) => {
    const { slug } = req.params;

    if (!slug || typeof slug !== 'string') {
        return next(new AppError("Invalid slug parameter", 400));
    }

    const doctor = await prisma.doctor.findFirst({
        where: { 
            slug: slug.toLowerCase(),
            deletedAt: null, // Exclude soft-deleted doctors
        },
        include: {
            hospital: {
                select: {
                    id: true,
                    hospital_name: true,
                    phone_1: true,
                    phone_2: true,
                    address: true,
                    location: {
                        select: {
                            state_name: true,
                            city_name: true,
                        },
                    },
                },
            },
            slots: {
                select: {
                    day_of_week: true,
                    start_time: true,
                    end_time: true,
                    slot_duration_minutes: true,
                },
            },
        },
    });

    if (!doctor) {
        return next(new AppError(`Doctor with slug "${slug}" not found`, 404));
    }

    console.log(`✅ Fetched doctor by slug: ${doctor.full_name} (slug: ${slug})`);

    res.status(200).json({
        status: "success",
        data: doctor,
    });
});

// ─── Doctor Dashboard: Get Profile ────────────────────────────
// GET /api/v1/doctor/dashboard/me
const getProfile = catchAsync(async (req, res, next) => {
    const doctor = await prisma.doctor.findUnique({
        where: { id: req.user.id },
        include: {
            hospital: {
                select: {
                    id: true,
                    hospital_name: true,
                    address: true,
                },
            },
            slots: true,
        },
    });

    if (!doctor) {
        return next(new AppError("Doctor profile not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: doctor,
    });
});

// ─── Doctor Dashboard: Get Stats ──────────────────────────────
const getDashboardStats = catchAsync(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
        where: {
            doctor_id: req.user.id,
            date: { gte: today, lt: tomorrow },
        },
        select: { status: true },
    });

    const stats = {
        totalToday: appointments.length,
        completed: appointments.filter(a => a.status === "COMPLETED").length,
        pending: appointments.filter(a => a.status === "BOOKED" || a.status === "PENDING" || a.status === "IN_PROGRESS").length,
        upcoming: 0 // Will customize this based on 'upcoming' logic, for now simple split
    };

    stats.upcoming = stats.totalToday - stats.completed; // Simplistic approach: upcoming = total - completed

    res.status(200).json({
        status: "success",
        data: stats,
    });
});

// ─── Doctor Dashboard: Get Appointments ───────────────────────
const getFilteredAppointments = catchAsync(async (req, res, next) => {
    const { filter } = req.query; // 'today', 'upcoming', 'past', 'all'
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateFilter = {};
    if (filter === "today") {
        dateFilter = { gte: today, lt: tomorrow };
    } else if (filter === "upcoming") {
        // Technically upcoming is today and future that aren't completed, but let's say >= today
        dateFilter = { gte: today };
    } else if (filter === "past") {
        dateFilter = { lt: today };
    }

    const where = {
        doctor_id: req.user.id,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    };

    // For "upcoming" we might specifically only want incomplete ones
    if (filter === "upcoming") {
        where.status = { not: "COMPLETED" };
    }

    const appointments = await prisma.appointment.findMany({
        where,
        include: {
            patient: {
                select: {
                    id: true,
                    full_name: true,
                    phone: true,
                    age: true,
                    gender: true,
                    blood_group: true,
                    allergies: true,
                    chronic_conditions: true,
                    medicalProfile: {
                        select: { notes: true, allergies: true, medications: true, emergency_name: true, emergency_phone: true }
                    }
                },
            },
            prescription: true,
        },
        orderBy: [{ date: "asc" }, { token_number: "asc" }],
    });

    res.status(200).json({
        status: "success",
        results: appointments.length,
        data: appointments,
    });
});

// ─── Doctor Dashboard: Get Appointment Details ────────────────
const getAppointmentDetails = catchAsync(async (req, res, next) => {
    const appointmentId = parseInt(req.params.id, 10);
    if (isNaN(appointmentId)) return next(new AppError("Invalid ID", 400));

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            patient: {
                select: {
                    id: true,
                    full_name: true,
                    phone: true,
                    age: true,
                    gender: true,
                    blood_group: true,
                    allergies: true,
                    chronic_conditions: true,
                    medicalProfile: true
                }
            },
            prescription: true
        }
    });

    if (!appointment || appointment.doctor_id !== req.user.id) {
        return next(new AppError("Appointment not found", 404));
    }

    // Also get past visits with this doctor
    const pastVisits = await prisma.appointment.findMany({
        where: {
            patient_id: appointment.patient_id,
            doctor_id: req.user.id,
            id: { not: appointmentId },
            status: "COMPLETED"
        },
        include: { prescription: true },
        orderBy: { date: "desc" },
        take: 5
    });

    res.status(200).json({
        status: "success",
        data: {
            ...appointment,
            pastVisits
        }
    });
});

// ─── Doctor Dashboard: Upsert Prescription ────────────────────
const upsertPrescription = catchAsync(async (req, res, next) => {
    const { appointmentId, medicines = [], tests = [], diagnosis, doctorNotes } = req.body;

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { doctor: { select: { hospital_id: true } } },
    });

    if (!appointment || appointment.doctor_id !== req.user.id) {
        return next(new AppError("Appointment not found or unauthorized", 404));
    }

    const prescriptionData = {
        doctorId: req.user.id,
        patientId: appointment.patient_id,
        medicines,
        tests,
        diagnosis,
        doctorNotes
    };

    const prescription = await prisma.prescription.upsert({
        where: { appointmentId: appointmentId },
        update: prescriptionData,
        create: {
            appointmentId: appointmentId,
            ...prescriptionData
        }
    });

    res.status(200).json({
        status: "success",
        data: prescription,
    });
});

// ─── Doctor Dashboard: Send to Pharmacy ──────────────────────
const sendToPharmacy = catchAsync(async (req, res, next) => {
    const prescriptionId = parseInt(req.params.id, 10);
    if (isNaN(prescriptionId)) return next(new AppError("Invalid ID", 400));

    const prescription = await prisma.prescription.findUnique({
        where: { id: prescriptionId },
        include: { doctor: { select: { hospital_id: true } }, patient: true, appointment: true }
    });

    if (!prescription || prescription.doctorId !== req.user.id) {
        return next(new AppError("Prescription not found", 404));
    }

    const updated = await prisma.prescription.update({
        where: { id: prescriptionId },
        data: {
            sentToPharmacy: true,
            pharmacyReceivedAt: new Date()
        }
    });

    // Socket.io emit
    const io = req.app.get("io");
    if (io) {
        const hospitalRoom = `hospital:${prescription.doctor.hospital_id}`;
        io.to(hospitalRoom).emit("prescription:new", {
            prescriptionId: updated.id,
            appointmentId: updated.appointmentId,
            patientName: prescription.patient.full_name,
            tokenNumber: prescription.appointment.token_number,
            medicines: updated.medicines
        });
    }

    res.status(200).json({
        status: "success",
        data: updated,
    });
});

// ─── Doctor Dashboard: Complete Appointment ──────────────────
const completeAppointment = catchAsync(async (req, res, next) => {
    const appointmentId = parseInt(req.params.id, 10);
    if (isNaN(appointmentId)) return next(new AppError("Invalid ID", 400));

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
    });

    if (!appointment || appointment.doctor_id !== req.user.id) {
        return next(new AppError("Appointment not found", 404));
    }

    const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "COMPLETED" }
    });

    // Socket emit to inform patient waiting queue (if configured)
    const io = req.app.get("io");
    if (io) {
        // Emit to doctor's queue channel
        io.to(`doctor_queue_${req.user.id}`).emit("queue:updated", {
            appointmentId: updated.id,
            status: updated.status,
            tokenNumber: updated.token_number
        });
    }

    res.status(200).json({
        status: "success",
        data: updated,
    });
});

// ─── Doctor Dashboard: Toggle Availability ────────────────────
// PATCH /api/v1/doctor/dashboard/availability
const toggleAvailability = catchAsync(async (req, res, next) => {
    const doctor = await prisma.doctor.findUnique({
        where: { id: req.user.id },
    });

    if (!doctor) {
        return next(new AppError("Doctor not found", 404));
    }

    const updated = await prisma.doctor.update({
        where: { id: req.user.id },
        data: { is_available: !doctor.is_available },
    });

    res.status(200).json({
        status: "success",
        data: { is_available: updated.is_available },
    });
});

module.exports = { 
    getPatientCard, prescribe, getPatientAttachments, getDoctors, getDoctorById, getDoctorBySlug, 
    getProfile, toggleAvailability,
    getDashboardStats, getFilteredAppointments, getAppointmentDetails, upsertPrescription, sendToPharmacy, completeAppointment 
};
