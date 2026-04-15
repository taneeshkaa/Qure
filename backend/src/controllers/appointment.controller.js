// ─── Appointment Controller ──────────────────────────────────
// POST /api/v1/appointments/book  — Atomic booking with token generation
// GET  /api/v1/appointments/:id/card — Token card with joined data

const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { recordLastAction } = require("../services/patientDashboard.service");

// ─── Book Appointment ────────────────────────────────────────
const bookAppointment = catchAsync(async (req, res, next) => {
    const { doctor_id, patient_id, date, slot, problem_description, paymentMethod, paymentStatus } = req.body;

    // Parse the date (YYYY-MM-DD)
    const appointmentDate = new Date(date + "T00:00:00");

    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctor_id },
    });
    if (!doctor) {
        return next(new AppError("Doctor not found", 404));
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
        where: { id: patient_id },
    });
    if (!patient) {
        return next(new AppError("Patient not found", 404));
    }

    // Atomic transaction: token generation + booking + reminders
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Step 1: Get the highest token number for this doctor on this date
            const maxTokenResult = await tx.appointment.aggregate({
                where: {
                    doctor_id: doctor_id,
                    date: appointmentDate,
                },
                _max: {
                    token_number: true,
                },
            });

            const newToken = (maxTokenResult._max.token_number || 0) + 1;

            // Step 2: Create the appointment
            const appointment = await tx.appointment.create({
                data: {
                    patient_id,
                    doctor_id,
                    date: appointmentDate,
                    slot,
                    token_number: newToken,
                    problem_description,
                    status: "BOOKED",
                    paymentMethod: paymentMethod || "CASH", // Default to CASH if not provided
                    paymentStatus: paymentMethod === "CASH" ? "PENDING" : (paymentStatus || "PENDING"), // CASH always PENDING
                },
            });

            // Step 3: Calculate reminder times
            // Combine date + slot to get appointment datetime
            const [hours, minutes] = slot.split(":").map(Number);
            const appointmentDateTime = new Date(appointmentDate);
            appointmentDateTime.setHours(hours, minutes, 0, 0);

            // 1-day before reminder
            const oneDayBefore = new Date(appointmentDateTime);
            oneDayBefore.setDate(oneDayBefore.getDate() - 1);

            // 1-hour before reminder
            const oneHourBefore = new Date(appointmentDateTime);
            oneHourBefore.setHours(oneHourBefore.getHours() - 1);

            // Step 4: Create reminder records
            await tx.reminder.createMany({
                data: [
                    {
                        appointment_id: appointment.id,
                        type: "1_DAY",
                        scheduled_at: oneDayBefore,
                        sent: false,
                    },
                    {
                        appointment_id: appointment.id,
                        type: "1_HOUR",
                        scheduled_at: oneHourBefore,
                        sent: false,
                    },
                ],
            });

            return { appointment, newToken };
        });

        res.status(201).json({
            status: "success",
            message: "Appointment booked successfully",
            data: {
                appointment_id: result.appointment.id,
                token_number: result.newToken,
                doctor: doctor.full_name,
                specialization: doctor.specialization,
                date,
                slot,
                problem_description,
                status: "BOOKED",
                paymentMethod: result.appointment.paymentMethod,
                paymentStatus: result.appointment.paymentStatus,
                reminders: {
                    one_day_before: "Scheduled",
                    one_hour_before: "Scheduled",
                },
            },
        });

        // Best-effort "Continue where you left" signal
        await recordLastAction(parseInt(patient_id, 10), "Booked an appointment");
    } catch (err) {
        // Handle double-booking: unique constraint on (doctor_id, date, slot)
        if (err.code === "P2002") {
            return next(
                new AppError(
                    "This slot was just taken. Please pick another.",
                    409
                )
            );
        }
        throw err; // Re-throw unexpected errors
    }
});

// ─── Get Token Card ──────────────────────────────────────────
const getTokenCard = catchAsync(async (req, res, next) => {
    const appointmentId = parseInt(req.params.id, 10);

    if (isNaN(appointmentId)) {
        return next(new AppError("Invalid appointment ID", 400));
    }

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            patient: {
                select: {
                    full_name: true,
                    email: true,
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
            doctor: {
                select: {
                    full_name: true,
                    specialization: true,
                    hospital: {
                        select: {
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
            },
        },
    });

    if (!appointment) {
        return next(new AppError("Appointment not found", 404));
    }

    // Build the "Token Card" response
    const card = {
        // ── Booking Info ──
        token_number: appointment.token_number,
        date: appointment.date,
        slot: appointment.slot,
        problem_description: appointment.problem_description,
        status: appointment.status,

        // ── Patient Info ──
        patient: {
            name: appointment.patient.full_name,
            email: appointment.patient.email,
            phone: appointment.patient.phone,
            age: appointment.patient.age,
            gender: appointment.patient.gender,
            blood_group: appointment.patient.blood_group,
            allergies: appointment.patient.medicalProfile?.allergies || "None",
            medications: appointment.patient.medicalProfile?.medications || "None",
            conditions: appointment.patient.medicalProfile?.notes || "None",
        },

        // ── Doctor Info ──
        doctor: {
            name: appointment.doctor.full_name,
            specialization: appointment.doctor.specialization,
        },

        // ── Hospital Info ──
        hospital: {
            name: appointment.doctor.hospital.hospital_name,
            phone: appointment.doctor.hospital.phone_1,
            city: appointment.doctor.hospital.location.city_name,
            state: appointment.doctor.hospital.location.state_name,
        },
    };

    res.status(200).json({
        status: "success",
        data: card,
    });
});

// ─── Get Patient's Appointments ──────────────────────────────
// Fetches all appointments for the logged-in patient
// Requires JWT authentication to extract patient_id
const getMyAppointments = catchAsync(async (req, res, next) => {
    // Get patient_id from JWT (set by auth middleware)
    const patientId = req.user?.id;

    if (!patientId) {
        return next(new AppError("Unauthorized: Patient ID not found in token", 401));
    }

    console.log(`📋 Fetching appointments for patient_id: ${patientId}`);

    // Fetch all appointments for this patient with doctor details
    const appointments = await prisma.appointment.findMany({
        where: {
            patient_id: parseInt(patientId, 10),
        },
        include: {
            doctor: {
                select: {
                    id: true,
                    full_name: true,
                    specialization: true,
                    hospital: {
                        select: {
                            hospital_name: true,
                            id: true,
                        },
                    },
                },
            },
        },
        orderBy: [
            { status: 'asc' }, // BOOKED/CONFIRMED first, then CANCELLED, COMPLETED
            { date: 'asc' }, // Within each status group, sort by date ascending
        ],
    });

    console.log(`✅ Found ${appointments.length} appointments for patient ${patientId}:`, appointments);

    // Post-process to ensure correct ordering:
    // Status order: BOOKED → CONFIRMED → COMPLETED → CANCELLED
    const statusOrder = { 'BOOKED': 0, 'CONFIRMED': 1, 'COMPLETED': 2, 'CANCELLED': 3 };
    const sortedAppointments = appointments.sort((a, b) => {
        const statusDiff = (statusOrder[a.status] ?? 999) - (statusOrder[b.status] ?? 999);
        if (statusDiff !== 0) return statusDiff;
        // Within same status, sort by date ascending
        return new Date(a.date) - new Date(b.date);
    });

    // Map appointments to frontend-friendly format
    const formattedAppointments = sortedAppointments.map(apt => ({
        id: apt.id,
        token: apt.token_number,
        doctor: apt.doctor.full_name,
        specialty: apt.doctor.specialization,
        hospital: apt.doctor.hospital.hospital_name,
        date: apt.date,
        slot: apt.slot,
        condition: apt.problem_description,
        fee: 1200, // TODO: Add fee to schema if needed
        status: apt.status.toLowerCase(), // Convert to lowercase: 'booked' → 'upcoming', 'completed', 'cancelled'
        paymentMethod: apt.paymentMethod,
        paymentStatus: apt.paymentStatus,
    }));

    res.status(200).json({
        status: "success",
        results: formattedAppointments.length,
        data: formattedAppointments,
    });
});

// ─── Cancel Appointment ──────────────────────────────────────────
// CANCEL /api/v1/appointments/:id/cancel
const cancelAppointment = catchAsync(async (req, res, next) => {
    const appointmentId = parseInt(req.params.id, 10);
    const patientId = req.user?.id;

    if (isNaN(appointmentId)) {
        return next(new AppError("Invalid appointment ID", 400));
    }

    if (!patientId) {
        return next(new AppError("Unauthorized: Patient ID not found in token", 401));
    }

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
    });

    if (!appointment) {
        return next(new AppError("Appointment not found", 404));
    }

    if (appointment.patient_id !== parseInt(patientId, 10)) {
        return next(new AppError("You do not have permission to cancel this appointment", 403));
    }

    if (appointment.status !== 'BOOKED' && appointment.status !== 'CONFIRMED') {
        return next(new AppError("Only upcoming appointments can be cancelled.", 400));
    }

    await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'CANCELLED' },
    });

    await prisma.reminder.deleteMany({
        where: { appointment_id: appointmentId, sent: false }
    });

    res.status(200).json({
        status: "success",
        message: "Appointment cancelled successfully"
    });
});

module.exports = { bookAppointment, getTokenCard, getMyAppointments, cancelAppointment };
