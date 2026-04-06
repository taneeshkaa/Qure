// ─── Location Routes ─────────────────────────────────────────
// GET endpoints for the State > City > Hospital dropdown cascade

const express = require("express");
const router = express.Router();
const {
    getStates,
    getCities,
    getHospitals,
    getAllHospitals,
    getHospitalById,
} = require("../controllers/location.controller");

// GET /api/v1/locations/states
router.get("/states", getStates);

// GET /api/v1/locations/cities?state=Maharashtra
router.get("/cities", getCities);

// GET /api/v1/locations/all-hospitals — All hospitals (patient browse page)
// Optional: ?state=Maharashtra or ?specialty=Neurology
router.get("/all-hospitals", getAllHospitals);

// GET /api/v1/locations/hospitals/:id — Get single hospital by ID (MUST be before /hospitals with query)
router.get("/hospitals/:id", getHospitalById);

// GET /api/v1/locations/hospitals?city=Mumbai — Hospitals by city
router.get("/hospitals", getHospitals);

module.exports = router;
