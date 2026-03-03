// ─── Chemist Controller (Phase 3) ────────────────────────────
// GET   /api/v1/chemist/queue       — Live "To-Pack" list
// PATCH /api/v1/chemist/verify/:id  — Reveal patient info / mark Delivered

const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// ─── Get Queue (To-Pack List) ────────────────────────────────
// Shows all Pending and Ready prescriptions for the chemist's hospital.
// Anti-scam: Only shows Token Number and Status — no patient details.
const getQueue = catchAsync(async (req, res, next) => {
    const chemistId = parseInt(req.query.chemist_id, 10);

    if (isNaN(chemistId)) {
        return next(
            new AppError("chemist_id query parameter is required and must be a number", 400)
        );
    }

    // Verify chemist exists
    const chemist = await prisma.chemist.findUnique({
        where: { id: chemistId },
    });

    if (!chemist) {
        return next(new AppError("Chemist not found", 404));
    }

    // Fetch prescriptions with status PENDING or READY
    const prescriptions = await prisma.prescription.findMany({
        where: {
            chemist_id: chemistId,
            status: { in: ["PENDING", "READY"] },
        },
        include: {
            appointment: {
                select: {
                    token_number: true,
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    // Return only token + status (anti-scam: no patient name/phone)
    const queue = prescriptions.map((p) => ({
        prescription_id: p.id,
        token_number: p.appointment.token_number,
        status: p.status,
        content: p.content,
        created_at: p.createdAt,
    }));

    res.status(200).json({
        status: "success",
        results: queue.length,
        data: queue,
    });
});

// ─── Verify & Deliver ────────────────────────────────────────
// Two-step process:
// 1. Without confirm=true → Reveals patient Full Name & Phone for verification
// 2. With confirm=true   → Marks prescription as DELIVERED
const verifyAndDeliver = catchAsync(async (req, res, next) => {
    const prescriptionId = parseInt(req.params.id, 10);

    if (isNaN(prescriptionId)) {
        return next(new AppError("Invalid prescription ID", 400));
    }

    const { chemist_id, confirm } = req.body;

    // Fetch prescription with patient details
    const prescription = await prisma.prescription.findUnique({
        where: { id: prescriptionId },
        include: {
            appointment: {
                select: {
                    token_number: true,
                    patient: {
                        select: {
                            full_name: true,
                            phone: true,
                        },
                    },
                },
            },
        },
    });

    if (!prescription) {
        return next(new AppError("Prescription not found", 404));
    }

    if (prescription.chemist_id !== chemist_id) {
        return next(
            new AppError("This prescription does not belong to the specified chemist", 403)
        );
    }

    if (prescription.status === "DELIVERED") {
        return next(new AppError("This prescription has already been delivered", 400));
    }

    // ─── Step 1: Reveal patient info for safety check ────────
    if (!confirm) {
        // Mark as READY (staff is preparing / verifying)
        if (prescription.status === "PENDING") {
            await prisma.prescription.update({
                where: { id: prescriptionId },
                data: { status: "READY" },
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Patient details revealed for verification. Ask patient to confirm their name.",
            data: {
                prescription_id: prescription.id,
                token_number: prescription.appointment.token_number,
                patient_name: prescription.appointment.patient.full_name,
                patient_phone: prescription.appointment.patient.phone,
                status: "READY",
            },
        });
    }

    // ─── Step 2: Confirm delivery ────────────────────────────
    const updated = await prisma.prescription.update({
        where: { id: prescriptionId },
        data: { status: "DELIVERED" },
    });

    res.status(200).json({
        status: "success",
        message: "Medicine delivered and verified successfully",
        data: {
            prescription_id: updated.id,
            token_number: prescription.appointment.token_number,
            status: updated.status,
        },
    });
});

module.exports = { getQueue, verifyAndDeliver };
