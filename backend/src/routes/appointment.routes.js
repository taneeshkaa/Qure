// ─── Appointment Routes ──────────────────────────────────────
// POST /api/v1/appointments/book — Book an appointment
// GET  /api/v1/appointments/:id/card — Get the token card

const express = require("express");
const router = express.Router();
const {
    bookAppointment,
    getTokenCard,
} = require("../controllers/appointment.controller");
const validate = require("../middleware/validate");
const appointmentSchema = require("../validators/appointment.validator");

// POST /api/v1/appointments/book
router.post("/book", validate(appointmentSchema), bookAppointment);

// GET /api/v1/appointments/1/card
router.get("/:id/card", getTokenCard);

module.exports = router;
