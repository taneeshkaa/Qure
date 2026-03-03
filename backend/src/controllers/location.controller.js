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

module.exports = { getStates, getCities, getHospitals };
