// ─── Availability Routes ─────────────────────────────────────
// GET /api/v1/availability/:doctorId?date=... — free slot lookup

const express = require("express");
const router = express.Router();
const { getAvailability } = require("../controllers/availability.controller");

// GET /api/v1/availability/1?date=2026-03-02
router.get("/:doctorId", getAvailability);

module.exports = router;
