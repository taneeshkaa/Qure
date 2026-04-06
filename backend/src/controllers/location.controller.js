// ─── Location Controller ─────────────────────────────────────
// Handles the State > City > Hospital cascading dropdown logic.
// These are read-only endpoints used by the React frontend.

const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// GET /api/v1/locations/states
// Returns a unique list of all Indian states
const getStates = catchAsync(async (req, res, next) => {
    const states = await prisma.location.findMany({
        distinct: ["state_name"],
        select: { state_name: true },
        orderBy: { state_name: "asc" },
    });

    res.status(200).json({
        status: "success",
        results: states.length,
        data: states.map((s) => s.state_name),
    });
});

// GET /api/v1/locations/cities?state=Maharashtra
// Returns all cities for a given state
const getCities = catchAsync(async (req, res, next) => {
    const { state } = req.query;

    if (!state || state.trim() === "") {
        return next(new AppError("Query parameter 'state' is required", 400));
    }

    const cities = await prisma.location.findMany({
        where: { state_name: state.trim() },
        select: { city_name: true },
        orderBy: { city_name: "asc" },
    });

    if (cities.length === 0) {
        return next(new AppError(`No cities found for state: ${state}`, 404));
    }

    res.status(200).json({
        status: "success",
        results: cities.length,
        data: cities.map((c) => c.city_name),
    });
});

// GET /api/v1/locations/hospitals?city=Mumbai
// Returns all hospitals registered in a given city
const getHospitals = catchAsync(async (req, res, next) => {
    const { city } = req.query;

    if (!city || city.trim() === "") {
        return next(new AppError("Query parameter 'city' is required", 400));
    }

    const hospitals = await prisma.hospital.findMany({
        where: {
            location: {
                city_name: city.trim(),
            },
        },
        select: {
            id: true,
            hospital_name: true,
            contact_person: true,
            phone_1: true,
            phone_2: true,
            location: {
                select: {
                    state_name: true,
                    city_name: true,
                },
            },
        },
        orderBy: { hospital_name: "asc" },
    });

    res.status(200).json({
        status: "success",
        results: hospitals.length,
        data: hospitals,
    });
});

// ─── GET /api/v1/locations/all-hospitals ─────────────────────
// Returns ALL hospitals (for patient-facing browse pages)
// Optional filter: ?state=Maharashtra or ?specialty=Neurology (searches doctors)
const getAllHospitals = catchAsync(async (req, res, next) => {
    const { state, specialty } = req.query;

    const where = {};
    if (state && state.trim()) {
        where.location = {
            state_name: state.trim(),
        };
    }

    let hospitals = await prisma.hospital.findMany({
        where,
        include: {
            location: {
                select: {
                    state_name: true,
                    city_name: true,
                },
            },
            doctors: {
                select: {
                    specialization: true,
                },
            },
        },
        orderBy: [
            { location: { state_name: "asc" } },
            { hospital_name: "asc" },
        ],
    });

    // If specialty filter is provided, only return hospitals with that specialist
    if (specialty && specialty.trim()) {
        hospitals = hospitals.filter(h =>
            h.doctors.some(d =>
                d.specialization.toLowerCase().includes(specialty.trim().toLowerCase())
            )
        );
    }

    // Remove the doctors list from response (we don't need it)
    const hospitalData = hospitals.map(({ doctors, ...rest }) => rest);

    console.log(
        `📋 Fetching all hospitals${state ? ` (state: ${state})` : ""}${specialty ? ` (specialty: ${specialty})` : ""} - Found ${hospitalData.length} results`
    );

    res.status(200).json({
        status: "success",
        results: hospitalData.length,
        data: hospitalData,
    });
});

// ─── GET /api/v1/hospitals/:id ────────────────────────────────
// Get a single hospital's full profile (patient-facing detail page)
// Includes all doctors at the hospital
const getHospitalById = catchAsync(async (req, res, next) => {
    const hospitalId = parseInt(req.params.id, 10);

    if (isNaN(hospitalId)) {
        return next(new AppError("Invalid hospital ID", 400));
    }

    const hospital = await prisma.hospital.findUnique({
        where: { id: hospitalId },
        include: {
            location: {
                select: {
                    state_name: true,
                    city_name: true,
                },
            },
            doctors: {
                where: {
                    deletedAt: null, // Exclude soft-deleted doctors
                },
                select: {
                    id: true,
                    full_name: true,
                    slug: true,
                    specialization: true,
                    experience: true,
                    consultation_fee: true,
                },
            },
        },
    });

    if (!hospital) {
        return next(new AppError(`Hospital with ID ${hospitalId} not found`, 404));
    }

    console.log(`🏥 Fetching hospital by ID: ${hospitalId} - ${hospital.hospital_name}`);

    res.status(200).json({
        status: "success",
        data: hospital,
    });
});

module.exports = { getStates, getCities, getHospitals, getAllHospitals, getHospitalById };
