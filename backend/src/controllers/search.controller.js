// ─── Search Controller ───────────────────────────────────────
// GET /api/v1/search?q=pancreas
// Logic: Maps symptom keywords → specialist, then finds doctors
// of that specialty. Also supports direct doctor name search.

const prisma = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const searchByKeyword = catchAsync(async (req, res, next) => {
    const { q } = req.query;

    if (!q || q.trim() === "") {
        return next(new AppError("Query parameter 'q' is required", 400));
    }

    const query = q.trim().toLowerCase();

    // Step 1: Check symptom mapping for keyword → specialization
    const mappings = await prisma.symptomMapping.findMany({
        where: {
            keyword: {
                contains: query,
                mode: "insensitive",
            },
        },
        select: { specialization: true },
    });

    // Collect unique specializations from matched keywords
    const specializations = [...new Set(mappings.map((m) => m.specialization))];

    let doctors = [];
    let searchType = "";

    if (specializations.length > 0) {
        // Step 2a: Found keyword match → search doctors by specialization
        searchType = "keyword";
        doctors = await prisma.doctor.findMany({
            where: {
                specialization: {
                    in: specializations,
                },
            },
            select: {
                id: true,
                full_name: true,
                specialization: true,
                experience: true,
                hospital: {
                    select: {
                        id: true,
                        hospital_name: true,
                        phone_1: true,
                        location: {
                            select: {
                                state_name: true,
                                city_name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { full_name: "asc" },
        });
    } else {
        // Step 2b: No keyword match → try direct doctor name search
        searchType = "doctor_name";
        doctors = await prisma.doctor.findMany({
            where: {
                full_name: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            select: {
                id: true,
                full_name: true,
                specialization: true,
                experience: true,
                hospital: {
                    select: {
                        id: true,
                        hospital_name: true,
                        phone_1: true,
                        location: {
                            select: {
                                state_name: true,
                                city_name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { full_name: "asc" },
        });
    }

    // Step 3: Fallback — suggest General Physician
    if (doctors.length === 0) {
        searchType = "fallback";
        doctors = await prisma.doctor.findMany({
            where: {
                specialization: "General Physician",
            },
            select: {
                id: true,
                full_name: true,
                specialization: true,
                experience: true,
                hospital: {
                    select: {
                        id: true,
                        hospital_name: true,
                        phone_1: true,
                        location: {
                            select: {
                                state_name: true,
                                city_name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { full_name: "asc" },
        });
    }

    res.status(200).json({
        status: "success",
        search_type: searchType,
        matched_specializations: specializations.length > 0 ? specializations : undefined,
        fallback_message:
            searchType === "fallback"
                ? `No specific match found for "${q}". Showing General Physicians.`
                : undefined,
        results: doctors.length,
        data: doctors,
    });
});

module.exports = { searchByKeyword };
