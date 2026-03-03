// ─── Location Routes ─────────────────────────────────────────
// GET endpoints for the State > City > Hospital dropdown cascade

const express = require("express");
const router = express.Router();
const {
    getStates,
    getCities,
    getHospitals,
} = require("../controllers/location.controller");

// GET /api/v1/locations/states
router.get("/states", getStates);

// GET /api/v1/locations/cities?state=Maharashtra
router.get("/cities", getCities);

// GET /api/v1/locations/hospitals?city=Mumbai
router.get("/hospitals", getHospitals);

module.exports = router;
