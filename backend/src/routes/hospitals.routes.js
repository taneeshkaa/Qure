const express = require("express");
const router = express.Router();

const { getNearbyHospitals } = require("../controllers/hospitals.controller");

// GET /api/v1/hospitals/nearby
router.get("/nearby", getNearbyHospitals);

module.exports = router;

