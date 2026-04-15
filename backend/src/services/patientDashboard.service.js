const prisma = require("../config/db");

function getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
}

function formatTimeAgo(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return "just now";
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin} mins ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hours ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} days ago`;
}

async function getUpcomingAppointmentWithQueue(patientId) {
    const { start, end } = getTodayRange();

    const appointment = await prisma.appointment.findFirst({
        where: {
            patient_id: patientId,
            date: { gte: start, lt: end },
            status: { in: ["BOOKED", "CONFIRMED"] },
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
                            location: { select: { city_name: true, state_name: true } },
                        },
                    },
                },
            },
        },
        orderBy: [{ date: "asc" }, { token_number: "asc" }],
    });

    if (!appointment) return null;

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
            unique_doctor_day: { doctor_id: appointment.doctor_id, day_of_week: dayOfWeek },
        },
        select: { slot_duration_minutes: true },
    });

    const avgConsultMinutes = doctorSchedule?.slot_duration_minutes || 15;
    const queueEstimateMinutes = patientsAhead * avgConsultMinutes;

    // Clock-based lower bound (until the appointment slot time)
    const slotDt = new Date(appointment.date);
    const [hours, minutes] = String(appointment.slot || "").split(":").map(Number);
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        slotDt.setHours(hours, minutes, 0, 0);
    }
    const clockEstimateMinutes = Math.max(0, Math.ceil((slotDt.getTime() - Date.now()) / 60000));

    const delayMinutes = appointment.delayMinutes || 0;
    const estimatedWaitMinutes = Math.max(queueEstimateMinutes, clockEstimateMinutes) + delayMinutes;

    // Lightweight status derivation
    let status = "waiting";
    if (patientsAhead === 0) status = "next";
    if (estimatedWaitMinutes <= 1) status = "now";

    return {
        appointmentId: appointment.id,
        doctorId: appointment.doctor.id,
        doctorName: appointment.doctor.full_name,
        hospitalName: appointment.doctor.hospital?.hospital_name || null,
        queuePosition: patientsAhead + 1,
        patientsAhead,
        estimatedWaitTime: estimatedWaitMinutes,
        status,
        doctorDelayMinutes: delayMinutes,
        doctorDelayReason: appointment.doctorDelayReason || null,
        city: appointment.doctor.hospital?.location?.city_name || null,
        state: appointment.doctor.hospital?.location?.state_name || null,
    };
}

async function suggestNextAvailableDoctors({ limit = 3 } = {}) {
    const doctors = await prisma.doctor.findMany({
        where: { deletedAt: null },
        select: {
            id: true,
            full_name: true,
            specialization: true,
            hospital: {
                select: {
                    hospital_name: true,
                    location: { select: { city_name: true } },
                },
            },
        },
        orderBy: [{ experience: "desc" }, { id: "asc" }],
        take: limit,
    });

    // We don't have patient geo coordinates yet; keep it deterministic and lightweight.
    return doctors.map((d) => ({
        doctorId: d.id,
        doctorName: d.full_name,
        speciality: d.specialization,
        hospitalName: d.hospital?.hospital_name || null,
        city: d.hospital?.location?.city_name || null,
        nextSlotSuggestion: "Today 4:00 PM",
    }));
}

async function getDashboardStatus(patientId) {
    const appt = await getUpcomingAppointmentWithQueue(patientId);
    if (appt) {
        // Optional “doctorDelay” boolean per spec (mockable)
        const doctorDelay = Number(appt.doctorDelayMinutes || 0) > 0;
        return {
            hasAppointment: true,
            queuePosition: appt.queuePosition,
            estimatedWaitTime: appt.estimatedWaitTime,
            doctorName: appt.doctorName,
            status: appt.status,
            doctorDelay,
            doctorDelayMinutes: appt.doctorDelayMinutes,
            doctorDelayReason: appt.doctorDelayReason,
        };
    }

    const suggestions = await suggestNextAvailableDoctors({ limit: 3 });
    return {
        hasAppointment: false,
        suggestions,
        status: "no_appointment",
    };
}

async function getDashboardStats(patientId) {
    const totalVisits = await prisma.appointment.count({
        where: { patient_id: patientId, status: "COMPLETED" },
    });

    const prescriptions = await prisma.prescription.count({
        where: {
            appointment: {
                patient_id: patientId,
            },
        },
    });

    // Until we track actual “time saved”, return a stable heuristic.
    const avgWaitTimeSaved = totalVisits === 0 ? 0 : Math.min(180, totalVisits * 5);

    return { totalVisits, prescriptions, avgWaitTimeSaved };
}

async function getDashboardRecommendations(patientId) {
    const completed = await prisma.appointment.findFirst({
        where: { patient_id: patientId, status: "COMPLETED" },
        select: { date: true, doctor: { select: { full_name: true } } },
        orderBy: { date: "desc" },
    });

    const recommendations = [];

    if (!completed) {
        recommendations.push("Book a general checkup");
        recommendations.push("Consult a general physician nearby");
    } else {
        const lastVisit = new Date(completed.date);
        const months = (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (months > 6) recommendations.push("It's been a while — schedule a routine checkup");
        if (completed.doctor?.full_name) recommendations.push(`Follow up with ${completed.doctor.full_name}`);
    }

    const nearby = await prisma.doctor.findMany({
        where: { deletedAt: null },
        select: { specialization: true },
        orderBy: [{ experience: "desc" }],
        take: 2,
    });
    nearby.forEach((d) => {
        if (d?.specialization) recommendations.push(`Consult a ${d.specialization.toLowerCase()} nearby`);
    });

    return { recommendations: Array.from(new Set(recommendations)).slice(0, 6) };
}

async function getDashboardActivity(patientId) {
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { createdAt: true, updatedAt: true },
    });

    const { start } = getTodayRange();
    const recentAppointments = await prisma.appointment.findMany({
        where: { patient_id: patientId },
        select: { id: true, status: true, createdAt: true, date: true, doctor: { select: { full_name: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
    });

    const recentPrescriptions = await prisma.prescription.findMany({
        where: { appointment: { patient_id: patientId } },
        select: { id: true, status: true, createdAt: true, doctor: { select: { full_name: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
    });

    const activity = [];

    if (patient?.createdAt) {
        activity.push({
            type: "REGISTERED",
            message: "You joined QueueEase",
            time: formatTimeAgo(patient.createdAt),
        });
    }

    if (patient?.updatedAt && patient?.createdAt && patient.updatedAt.getTime() - patient.createdAt.getTime() > 60_000) {
        activity.push({
            type: "PROFILE_UPDATE",
            message: "Profile updated",
            time: formatTimeAgo(patient.updatedAt),
        });
    }

    recentAppointments.forEach((a) => {
        activity.push({
            type: "APPOINTMENT",
            message: `Appointment ${String(a.status || "").toLowerCase()} with ${a.doctor?.full_name || "a doctor"}`,
            time: formatTimeAgo(a.createdAt),
        });
    });

    recentPrescriptions.forEach((p) => {
        activity.push({
            type: "PRESCRIPTION",
            message: `Prescription ${String(p.status || "").toLowerCase()} by ${p.doctor?.full_name || "doctor"}`,
            time: formatTimeAgo(p.createdAt),
        });
    });

    // Deduplicate + sort by recency (approx by parsing “time ago” isn't reliable; use createdAt sources order).
    return activity.slice(0, 12);
}

async function getDashboardAnalytics(patientId) {
    const now = new Date();
    const start = new Date(now);
    start.setMonth(start.getMonth() - 5);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const rows = await prisma.appointment.findMany({
        where: { patient_id: patientId, date: { gte: start }, status: { in: ["COMPLETED", "BOOKED", "CONFIRMED"] } },
        select: { date: true },
    });

    const counts = new Map(); // yyyy-mm -> count
    rows.forEach((r) => {
        const d = new Date(r.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        counts.set(key, (counts.get(key) || 0) + 1);
    });

    const series = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        series.push({ month: key, visits: counts.get(key) || 0 });
    }

    return { monthlyVisits: series };
}

async function getLastAction(patientId) {
    const p = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { last_action: true, last_action_at: true },
    });
    return {
        lastAction: p?.last_action || null,
        lastActionAt: p?.last_action_at || null,
    };
}

async function recordLastAction(patientId, action) {
    if (!action) return;
    try {
        await prisma.patient.update({
            where: { id: patientId },
            data: { last_action: String(action).slice(0, 120), last_action_at: new Date() },
        });
    } catch (_) {
        // best-effort; never fail main request
    }
}

module.exports = {
    getDashboardStatus,
    getDashboardStats,
    getDashboardRecommendations,
    getDashboardActivity,
    getDashboardAnalytics,
    getLastAction,
    recordLastAction,
};

