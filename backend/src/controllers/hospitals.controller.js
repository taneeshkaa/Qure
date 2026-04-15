const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");

function getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
}

// GET /api/v1/hospitals/nearby
// Note: "nearby" is best-effort until we store patient geo/city explicitly.
const getNearbyHospitals = catchAsync(async (req, res) => {
    const { start, end } = getTodayRange();

    const hospitals = await prisma.hospital.findMany({
        where: { deletedAt: null, is_approved: true },
        select: {
            id: true,
            hospital_name: true,
            location: { select: { city_name: true, state_name: true } },
            doctors: {
                where: { deletedAt: null },
                select: { specialization: true, id: true },
                take: 3,
            },
        },
        orderBy: [{ hospital_name: "asc" }],
        take: 12,
    });

    // Compute a simple wait time signal: appointments booked today across hospital doctors.
    const doctorIds = hospitals.flatMap((h) => h.doctors.map((d) => d.id));
    const countsByDoctor = new Map();
    if (doctorIds.length > 0) {
        const apptCounts = await prisma.appointment.groupBy({
            by: ["doctor_id"],
            where: {
                doctor_id: { in: doctorIds },
                date: { gte: start, lt: end },
                status: { in: ["BOOKED", "CONFIRMED"] },
            },
            _count: { _all: true },
        });
        apptCounts.forEach((row) => countsByDoctor.set(row.doctor_id, row._count._all));
    }

    const data = hospitals.map((h) => {
        const totalBooked = h.doctors.reduce((sum, d) => sum + (countsByDoctor.get(d.id) || 0), 0);
        const waitTime = Math.min(90, 5 + totalBooked * 3); // heuristic minutes
        const speciality = h.doctors?.[0]?.specialization || "General";
        return {
            id: h.id,
            name: h.hospital_name,
            city: h.location?.city_name || null,
            state: h.location?.state_name || null,
            waitTime,
            speciality,
        };
    });

    res.status(200).json({ status: "success", data });
});

module.exports = { getNearbyHospitals };

