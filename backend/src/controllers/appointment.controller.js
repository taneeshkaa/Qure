// ─── Appointment Controller ──────────────────────────────────
// POST /api/v1/appointments/book  — Atomic booking with token generation
// GET  /api/v1/appointments/:id/card — Token card with joined data

const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// ─── Book Appointment ────────────────────────────────────────
const bookAppointment = catchAsync(async (req, res, next) => {
    const { doctor_id, patient_id, date, slot, problem_description } = req.body;

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
                reminders: {
                    one_day_before: "Scheduled",
                    one_hour_before: "Scheduled",
                },
            },
        });
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

module.exports = { bookAppointment, getTokenCard };
