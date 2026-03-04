// ─── Hospital Controller ──────────────────────────────────────
// POST /api/v1/register/hospital              — Registration
// POST /api/v1/hospital/login                 — Hospital owner login
// GET  /api/v1/hospital/profile               — Get profile (protected)
// PUT  /api/v1/hospital/profile               — Update profile (protected)
// GET  /api/v1/hospital/doctors               — List doctors (protected)
// POST /api/v1/hospital/doctors               — Add doctor (protected)
// DELETE /api/v1/hospital/doctors/:id         — Remove doctor (protected)

const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ─── Helper ───────────────────────────────────────────────────
const signToken = (id) =>
    jwt.sign(
        { id, role: "HOSPITAL" },
        process.env.JWT_SECRET || "fallback_secret_for_dev_only",
        { expiresIn: "7d" }
    );

// ─── POST /api/v1/register/hospital ───────────────────────────
const registerHospital = catchAsync(async (req, res, next) => {
    const {
        state,
        city,
        hospital_name,
        contact_person,
        phone_1,
        phone_2,
        owner_name,
        license_number,
        total_staff_count,
        doctors,
        chemist_shop_name,
        chemist_staff_password,
        email,
        password,
    } = req.body;

    // Validate email uniqueness
    if (email) {
        const emailExists = await prisma.hospital.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
        if (emailExists) {
            return next(new AppError("An account with this email already exists", 409));
        }
    }

    // Step 1: Find or create the Location (state + city combo)
    let location = await prisma.location.findFirst({
        where: {
            state_name: state.trim(),
            city_name: city.trim(),
        },
    });

    if (!location) {
        location = await prisma.location.create({
            data: {
                state_name: state.trim(),
                city_name: city.trim(),
            },
        });
    }

    // Step 2: Check if this hospital already exists in this location
    const existingHospital = await prisma.hospital.findFirst({
        where: {
            location_id: location.id,
            hospital_name: hospital_name.trim(),
        },
    });

    if (existingHospital) {
        return next(
            new AppError(
                `Hospital "${hospital_name}" is already registered in ${city}, ${state}`,
                409
            )
        );
    }

    // Hash hospital owner password
    const password_hash = password
        ? await bcrypt.hash(password, 10)
        : null;

    // Step 3: Atomic transaction — create hospital + doctors + slots
    const result = await prisma.$transaction(async (tx) => {
        const hospital = await tx.hospital.create({
            data: {
                location_id: location.id,
                hospital_name: hospital_name.trim(),
                contact_person: contact_person.trim(),
                phone_1: phone_1.trim(),
                phone_2: phone_2 ? phone_2.trim() : null,
                owner_name: owner_name.trim(),
                license_number: license_number.trim(),
                total_staff_count: total_staff_count || null,
                email: email ? email.toLowerCase().trim() : null,
                password_hash,
            },
        });

        let createdDoctors = [];
        const allSlotData = [];

        if (doctors && doctors.length > 0) {
            for (const doc of doctors) {
                const createdDoctor = await tx.doctor.create({
                    data: {
                        full_name: doc.full_name.trim(),
                        specialization: doc.specialization.trim(),
                        experience: doc.experience || 0,
                        hospital_id: hospital.id,
                    },
                });

                for (let day = 1; day <= 6; day++) {
                    allSlotData.push({
                        doctor_id: createdDoctor.id,
                        day_of_week: day,
                        start_time: "09:00",
                        end_time: "17:00",
                        slot_duration_minutes: 30,
                    });
                }

                createdDoctors.push(createdDoctor);
            }

            if (allSlotData.length > 0) {
                await tx.doctorSlot.createMany({ data: allSlotData });
            }
        }

        return { hospital, createdDoctors };
    }, { timeout: 10000 });

    // Step 4: Create the Chemist
    const staffHash = await bcrypt.hash(chemist_staff_password, 10);

    const chemist = await prisma.chemist.create({
        data: {
            hospital_id: result.hospital.id,
            shop_name: chemist_shop_name.trim(),
            staff_password_hash: staffHash,
        },
    });

    const token = signToken(result.hospital.id);

    res.status(201).json({
        status: "success",
        message: "Hospital registered successfully",
        token,
        data: {
            hospital_id: result.hospital.id,
            hospital_name: result.hospital.hospital_name,
            owner_name: result.hospital.owner_name,
            license_number: result.hospital.license_number,
            contact_person: result.hospital.contact_person,
            phone_1: result.hospital.phone_1,
            phone_2: result.hospital.phone_2,
            email: result.hospital.email,
            total_staff_count: result.hospital.total_staff_count,
            location: {
                state_name: location.state_name,
                city_name: location.city_name,
            },
            doctors: result.createdDoctors.map((d) => ({
                doctor_id: d.id,
                full_name: d.full_name,
                specialization: d.specialization,
                experience: d.experience,
            })),
            chemist: {
                chemist_id: chemist.id,
                shop_name: chemist.shop_name,
            },
        },
    });
});

// ─── POST /api/v1/hospital/login ──────────────────────────────
const loginHospital = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }

    const hospital = await prisma.hospital.findUnique({
        where: { email: email.toLowerCase().trim() },
    });

    if (!hospital || !hospital.password_hash) {
        return next(new AppError("Invalid email or password", 401));
    }

    const isMatch = await bcrypt.compare(password, hospital.password_hash);
    if (!isMatch) {
        return next(new AppError("Invalid email or password", 401));
    }

    const token = signToken(hospital.id);

    res.status(200).json({
        status: "success",
        message: "Logged in successfully",
        token,
        data: {
            hospital_id: hospital.id,
            hospital_name: hospital.hospital_name,
            email: hospital.email,
        },
    });
});

// ─── GET /api/v1/hospital/profile ─────────────────────────────
const getHospitalProfile = catchAsync(async (req, res, next) => {
    const hospital = await prisma.hospital.findUnique({
        where: { id: req.hospital.id },
        include: { location: true },
    });

    if (!hospital) {
        return next(new AppError("Hospital not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            hospital_id: hospital.id,
            hospital_name: hospital.hospital_name,
            about: hospital.about || "",
            address: hospital.address || "",
            contact_person: hospital.contact_person,
            phone_1: hospital.phone_1,
            phone_2: hospital.phone_2,
            email: hospital.email,
            owner_name: hospital.owner_name,
            license_number: hospital.license_number,
            location: {
                state_name: hospital.location.state_name,
                city_name: hospital.location.city_name,
            },
        },
    });
});

// ─── PUT /api/v1/hospital/profile ─────────────────────────────
const updateHospitalProfile = catchAsync(async (req, res, next) => {
    const { hospital_name, about, address, contact_person, phone_1, phone_2 } = req.body;

    const updated = await prisma.hospital.update({
        where: { id: req.hospital.id },
        data: {
            hospital_name: hospital_name ? hospital_name.trim() : undefined,
            about: about !== undefined ? about.trim() : undefined,
            address: address !== undefined ? address.trim() : undefined,
            contact_person: contact_person ? contact_person.trim() : undefined,
            phone_1: phone_1 ? phone_1.trim() : undefined,
            phone_2: phone_2 !== undefined ? (phone_2.trim() || null) : undefined,
        },
    });

    res.status(200).json({
        status: "success",
        message: "Profile updated successfully",
        data: {
            hospital_name: updated.hospital_name,
            about: updated.about || "",
            address: updated.address || "",
            contact_person: updated.contact_person,
            phone_1: updated.phone_1,
            phone_2: updated.phone_2,
        },
    });
});

// ─── GET /api/v1/hospital/doctors ─────────────────────────────
const getHospitalDoctors = catchAsync(async (req, res, next) => {
    const doctors = await prisma.doctor.findMany({
        where: {
            hospital_id: req.hospital.id,
            deletedAt: null,
        },
        orderBy: { createdAt: "asc" },
    });

    res.status(200).json({
        status: "success",
        data: doctors.map((d) => ({
            doctor_id: d.id,
            full_name: d.full_name,
            specialization: d.specialization,
            experience: d.experience,
        })),
    });
});

// ─── POST /api/v1/hospital/doctors ────────────────────────────
const addHospitalDoctor = catchAsync(async (req, res, next) => {
    const { full_name, specialization, experience } = req.body;

    if (!full_name || !specialization) {
        return next(new AppError("Doctor name and specialization are required", 400));
    }

    const result = await prisma.$transaction(async (tx) => {
        const doctor = await tx.doctor.create({
            data: {
                full_name: full_name.trim(),
                specialization: specialization.trim(),
                experience: experience || 0,
                hospital_id: req.hospital.id,
            },
        });

        const slotData = [];
        for (let day = 1; day <= 6; day++) {
            slotData.push({
                doctor_id: doctor.id,
                day_of_week: day,
                start_time: "09:00",
                end_time: "17:00",
                slot_duration_minutes: 30,
            });
        }
        await tx.doctorSlot.createMany({ data: slotData });

        return doctor;
    }, { timeout: 10000 });

    res.status(201).json({
        status: "success",
        message: "Doctor added successfully",
        data: {
            doctor_id: result.id,
            full_name: result.full_name,
            specialization: result.specialization,
            experience: result.experience,
        },
    });
});

// ─── DELETE /api/v1/hospital/doctors/:id ──────────────────────
const removeHospitalDoctor = catchAsync(async (req, res, next) => {
    const doctorId = parseInt(req.params.id, 10);

    if (isNaN(doctorId)) {
        return next(new AppError("Invalid doctor ID", 400));
    }

    const doctor = await prisma.doctor.findFirst({
        where: { id: doctorId, hospital_id: req.hospital.id, deletedAt: null },
    });

    if (!doctor) {
        return next(new AppError("Doctor not found or does not belong to your hospital", 404));
    }

    await prisma.doctor.update({
        where: { id: doctorId },
        data: { deletedAt: new Date() },
    });

    res.status(200).json({
        status: "success",
        message: "Doctor removed successfully",
        data: null,
    });
});

module.exports = {
    registerHospital,
    loginHospital,
    getHospitalProfile,
    updateHospitalProfile,
    getHospitalDoctors,
    addHospitalDoctor,
    removeHospitalDoctor,
};
