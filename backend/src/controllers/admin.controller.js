// ─── Admin Controller ──────────────────────────────────────────
// Handles Admin registration, login, soft deletes, and statistics.

const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// POST /api/v1/admin/register
const registerAdmin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
        where: { email: email.toLowerCase().trim() },
    });

    if (existingAdmin) {
        return next(new AppError("Admin with this email already exists", 409));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create admin
    const admin = await prisma.admin.create({
        data: {
            email: email.toLowerCase().trim(),
            password_hash,
            role: "SUPER_ADMIN",
        },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    res.status(201).json({
        status: "success",
        message: "Admin registered successfully",
        data: { admin },
    });
});

// POST /api/v1/admin/login
const loginAdmin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
        where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
        return next(new AppError("Invalid email or password", 401));
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
        return next(new AppError("Invalid email or password", 401));
    }

    // Generate JWT
    const token = jwt.sign(
        { id: admin.id, role: admin.role },
        process.env.JWT_SECRET || "fallback_secret_for_dev_only",
        { expiresIn: "1d" }
    );

    res.status(200).json({
        status: "success",
        message: "Admin logged in successfully",
        token,
        data: {
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
            },
        },
    });
});

// DELETE /api/v1/admin/entity/:type/:id
// Soft deletes an entity (Hospital, Doctor, Patient, Pharmacy)
const softDeleteEntity = catchAsync(async (req, res, next) => {
    const { type, id } = req.params;
    const entityId = parseInt(id, 10);
    const validTypes = ["hospital", "doctor", "patient", "chemist"];

    if (!validTypes.includes(type.toLowerCase())) {
        return next(new AppError(`Invalid entity type. Must be one of: ${validTypes.join(", ")}`, 400));
    }

    if (isNaN(entityId)) {
        return next(new AppError("Invalid entity ID", 400));
    }

    let entity;

    // We use a transaction to ensure soft-delete and audit log are created together
    await prisma.$transaction(async (tx) => {
        const deletedAt = new Date();

        // 1. Soft Delete the Entity
        if (type.toLowerCase() === "hospital") {
            entity = await tx.hospital.update({
                where: { id: entityId },
                data: { deletedAt },
            });
            // Cascade soft delete to connected doctors and chemist (pharmacy)
            await tx.doctor.updateMany({
                where: { hospital_id: entityId, deletedAt: null },
                data: { deletedAt },
            });
            await tx.chemist.updateMany({
                where: { hospital_id: entityId, deletedAt: null },
                data: { deletedAt },
            });
        } else if (type.toLowerCase() === "doctor") {
            entity = await tx.doctor.update({
                where: { id: entityId },
                data: { deletedAt },
            });
        } else if (type.toLowerCase() === "patient") {
            entity = await tx.patient.update({
                where: { id: entityId },
                data: { deletedAt },
            });
        } else if (type.toLowerCase() === "chemist") {
            entity = await tx.chemist.update({
                where: { id: entityId },
                data: { deletedAt },
            });
        }

        // 2. Create Audit Log
        await tx.adminAction.create({
            data: {
                admin_id: req.admin.id,
                target_type: type.toUpperCase(),
                target_id: entityId,
                action: "DELETE",
            },
        });
    });

    res.status(200).json({
        status: "success",
        message: `${type} soft-deleted successfully`,
        data: null,
    });
});

// GET /api/v1/admin/stats
// Returns aggregated analytics for the Master Dashboard
const getAdminStats = catchAsync(async (req, res, next) => {
    // Aggregate non-deleted entities
    const [hospitals, doctors, patients, appointments] = await Promise.all([
        prisma.hospital.count({ where: { deletedAt: null } }),
        prisma.doctor.count({ where: { deletedAt: null } }),
        prisma.patient.count({ where: { deletedAt: null } }),
        prisma.appointment.count(),
    ]);

    // Aggregate appointments for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointmentsToday = await prisma.appointment.count({
        where: {
            createdAt: {
                gte: todayStart,
                lte: todayEnd,
            },
        },
    });

    res.status(200).json({
        status: "success",
        data: {
            totals: {
                hospitals,
                doctors,
                patients,
                appointments,
            },
            today: {
                appointments: appointmentsToday,
            },
        },
    });
});

module.exports = {
    registerAdmin,
    loginAdmin,
    softDeleteEntity,
    getAdminStats,
};
