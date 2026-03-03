// ─── Hospital Registration Controller ────────────────────────
// POST /api/v1/register/hospital
// Logic: Creates hospital with ownership info and optional doctor
// roster in a single atomic transaction. Each doctor also gets
// default weekly availability slots (Mon–Sat, 09:00–17:00).

const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const crypto = require("crypto");

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
    } = req.body;

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

    // Step 3: Atomic transaction — create hospital + doctors + slots
    const result = await prisma.$transaction(async (tx) => {
        // Create the hospital record with ownership details
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
            },
        });

        // If doctors array is provided, bulk-create them
        let createdDoctors = [];
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

                // Create default weekly slots (Mon–Sat, 09:00–17:00, 30 min)
                const slotData = [];
                for (let day = 1; day <= 6; day++) {
                    slotData.push({
                        doctor_id: createdDoctor.id,
                        day_of_week: day,
                        start_time: "09:00",
                        end_time: "17:00",
                        slot_duration_minutes: 30,
                    });
                }
                await tx.doctorSlot.createMany({ data: slotData });

                createdDoctors.push(createdDoctor);
            }
        }

        return { hospital, createdDoctors };
    });

    // Step 4 (outside main tx): Create the Chemist for this hospital
    const staffHash = crypto
        .createHash("sha256")
        .update(chemist_staff_password)
        .digest("hex");

    const chemist = await prisma.chemist.create({
        data: {
            hospital_id: result.hospital.id,
            shop_name: chemist_shop_name.trim(),
            staff_password_hash: staffHash,
        },
    });

    res.status(201).json({
        status: "success",
        message: "Hospital registered successfully",
        data: {
            hospital_id: result.hospital.id,
            hospital_name: result.hospital.hospital_name,
            owner_name: result.hospital.owner_name,
            license_number: result.hospital.license_number,
            contact_person: result.hospital.contact_person,
            phone_1: result.hospital.phone_1,
            phone_2: result.hospital.phone_2,
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

module.exports = { registerHospital };
