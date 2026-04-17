// ─── Doctor Auth Controller ───────────────────────────────────
// Handles doctor self-registration and login.
// Doctors are pre-created by hospital admins during hospital registration.
// Self-registration "claims" the existing Doctor record by writing
// email, password, phone into it (isRegistered → true).
//
// GET  /api/v1/doctor/hospitals/:hospitalId/unregistered-doctors
// POST /api/v1/doctor/register
// POST /api/v1/doctor/login

const prisma = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ─── Helper ───────────────────────────────────────────────────
const signToken = (id, hospital_id) =>
    jwt.sign(
        { id, role: 'DOCTOR', hospital_id },
        process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
        { expiresIn: '7d' }
    );

// ─── GET /api/v1/doctor/hospitals/:hospitalId/unregistered-doctors
// Returns all doctor records for a hospital that haven't been claimed yet.
// Used in step 3 of the doctor self-registration flow.
const getUnregisteredDoctors = catchAsync(async (req, res, next) => {
    const hospitalId = parseInt(req.params.hospitalId, 10);

    if (isNaN(hospitalId)) {
        return next(new AppError('Invalid hospital ID', 400));
    }

    // Verify hospital exists
    const hospital = await prisma.hospital.findUnique({
        where: { id: hospitalId },
        select: { id: true, hospital_name: true },
    });

    if (!hospital) {
        return next(new AppError('Hospital not found', 404));
    }

    const doctors = await prisma.doctor.findMany({
        where: {
            hospital_id: hospitalId,
            isRegistered: false,
            deletedAt: null,
        },
        select: {
            id: true,
            full_name: true,
            specialization: true,
            consultation_fee: true,
        },
        orderBy: { full_name: 'asc' },
    });

    res.status(200).json({
        status: 'success',
        results: doctors.length,
        data: {
            hospital_name: hospital.hospital_name,
            doctors,
        },
    });
});

// ─── POST /api/v1/doctor/register ────────────────────────────
// Claims an existing Doctor record by adding credentials.
// Body: { doctorId, phone, email, password }
const registerDoctor = catchAsync(async (req, res, next) => {
    const { doctorId, phone, email, password } = req.body;

    // --- Validate required fields ---
    if (!doctorId || !phone || !email || !password) {
        return next(new AppError('doctorId, phone, email, and password are required', 400));
    }

    const id = parseInt(doctorId, 10);
    if (isNaN(id)) {
        return next(new AppError('Invalid doctor ID', 400));
    }

    // --- Phone validation: 10 digits ---
    const cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
        return next(new AppError('Phone must be exactly 10 digits', 400));
    }

    // --- Password validation: min 8 chars, at least one number ---
    if (password.length < 8) {
        return next(new AppError('Password must be at least 8 characters', 400));
    }
    if (!/\d/.test(password)) {
        return next(new AppError('Password must contain at least one number', 400));
    }

    // --- Fetch the doctor record ---
    const doctor = await prisma.doctor.findUnique({
        where: { id },
        include: {
            hospital: { select: { id: true, hospital_name: true } },
        },
    });

    if (!doctor) {
        return next(new AppError('Doctor record not found. Please contact your hospital admin.', 404));
    }

    if (doctor.isRegistered) {
        return next(new AppError('This doctor account has already been registered. Please log in instead.', 409));
    }

    // --- Check email uniqueness across the doctors table ---
    const emailTaken = await prisma.doctor.findUnique({
        where: { email: email.toLowerCase().trim() },
    });

    if (emailTaken) {
        return next(new AppError('An account with this email already exists', 409));
    }

    // --- Hash password and update doctor record ---
    const password_hash = await bcrypt.hash(password, 10);

    const updated = await prisma.doctor.update({
        where: { id },
        data: {
            email: email.toLowerCase().trim(),
            password: password_hash,
            phone: cleanPhone,
            isRegistered: true,
            registeredAt: new Date(),
        },
    });

    console.log(`✅ Doctor self-registered: ${updated.full_name} (ID: ${updated.id})`);

    const token = signToken(updated.id, updated.hospital_id);

    res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        token,
        data: {
            doctor_id: updated.id,
            full_name: updated.full_name,
            specialization: updated.specialization,
            hospital_id: updated.hospital_id,
            hospital_name: doctor.hospital.hospital_name,
            email: updated.email,
            role: 'DOCTOR',
        },
    });
});

// ─── POST /api/v1/doctor/login ────────────────────────────────
// Body: { email, password }
const loginDoctor = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const doctor = await prisma.doctor.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: {
            hospital: { select: { id: true, hospital_name: true } },
        },
    });

    if (!doctor || !doctor.password) {
        return next(new AppError('Invalid email or password', 401));
    }

    if (!doctor.isRegistered) {
        return next(new AppError('Account not yet activated. Please complete registration first.', 401));
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
        return next(new AppError('Invalid email or password', 401));
    }

    console.log(`✅ Doctor login: ${doctor.full_name} (ID: ${doctor.id})`);

    const token = signToken(doctor.id, doctor.hospital_id);

    res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        token,
        data: {
            doctor_id: doctor.id,
            full_name: doctor.full_name,
            specialization: doctor.specialization,
            hospital_id: doctor.hospital_id,
            hospital_name: doctor.hospital.hospital_name,
            email: doctor.email,
            role: 'DOCTOR',
        },
    });
});

module.exports = { getUnregisteredDoctors, registerDoctor, loginDoctor };
