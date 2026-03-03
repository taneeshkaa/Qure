// ─── Availability Controller ─────────────────────────────────
// GET /api/v1/availability/:doctorId?date=2026-03-02
// Logic: Generates all possible time slots from the doctor's
// weekly schedule, then marks booked ones.

const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * Generates time slot strings between start and end times.
 * e.g. generateSlots("09:00", "12:00", 30) → ["09:00","09:30","10:00","10:30","11:00","11:30"]
 */
function generateSlots(startTime, endTime, durationMinutes) {
    const slots = [];
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + durationMinutes <= endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        slots.push(
            `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
        );
        currentMinutes += durationMinutes;
    }

    return slots;
}

const getAvailability = catchAsync(async (req, res, next) => {
    const doctorId = parseInt(req.params.doctorId, 10);
    const { date } = req.query;

    if (isNaN(doctorId)) {
        return next(new AppError("Invalid doctor ID", 400));
    }

    if (!date || date.trim() === "") {
        return next(new AppError("Query parameter 'date' is required (YYYY-MM-DD)", 400));
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return next(new AppError("Date must be in YYYY-MM-DD format", 400));
    }

    // Check doctor exists
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: {
            id: true,
            full_name: true,
            specialization: true,
        },
    });

    if (!doctor) {
        return next(new AppError("Doctor not found", 404));
    }

    // Get the day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const requestedDate = new Date(date + "T00:00:00");
    const dayOfWeek = requestedDate.getDay();

    // Fetch the doctor's schedule for this day
    const schedule = await prisma.doctorSlot.findUnique({
        where: {
            unique_doctor_day: {
                doctor_id: doctorId,
                day_of_week: dayOfWeek,
            },
        },
    });

    if (!schedule) {
        return res.status(200).json({
            status: "success",
            message: `Dr. ${doctor.full_name} is not available on this day`,
            doctor,
            date,
            day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek],
            slots: [],
        });
    }

    // Generate all possible slots
    const allSlots = generateSlots(
        schedule.start_time,
        schedule.end_time,
        schedule.slot_duration_minutes
    );

    // Fetch existing appointments for this doctor on this date
    const bookedAppointments = await prisma.appointment.findMany({
        where: {
            doctor_id: doctorId,
            date: requestedDate,
            status: "BOOKED",
        },
        select: { slot: true },
    });

    const bookedSlots = new Set(bookedAppointments.map((a) => a.slot));

    // Build the slot list with availability status
    const slotsWithStatus = allSlots.map((slot) => ({
        time: slot,
        status: bookedSlots.has(slot) ? "BOOKED" : "AVAILABLE",
    }));

    res.status(200).json({
        status: "success",
        doctor,
        date,
        day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek],
        total_slots: allSlots.length,
        available: slotsWithStatus.filter((s) => s.status === "AVAILABLE").length,
        booked: slotsWithStatus.filter((s) => s.status === "BOOKED").length,
        slots: slotsWithStatus,
    });
});

module.exports = { getAvailability };
