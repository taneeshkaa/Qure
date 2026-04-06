// ─── Appointment Routes ──────────────────────────────────────
// POST /api/v1/appointments/book — Book an appointment
// GET  /api/v1/appointments/my — Get patient's appointments (needs auth)
// GET  /api/v1/appointments/:id/card — Get the token card

const express = require("express");
const router = express.Router();
const {
    bookAppointment,
    getTokenCard,
    getMyAppointments,
    cancelAppointment,
} = require("../controllers/appointment.controller");
const validate = require("../middleware/validate");
const appointmentSchema = require("../validators/appointment.validator");
const { protect } = require("../middleware/auth.middleware");

// POST /api/v1/appointments/book
router.post("/book", validate(appointmentSchema), bookAppointment);

// GET /api/v1/appointments/my (must be before /:id/card to avoid route conflict)
router.get("/my", protect, getMyAppointments);

// PATCH /api/v1/appointments/:id/cancel
router.patch("/:id/cancel", protect, cancelAppointment);

// GET /api/v1/appointments/:id/card
router.get("/:id/card", getTokenCard);

module.exports = router;
