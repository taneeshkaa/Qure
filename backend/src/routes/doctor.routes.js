// ─── Doctor Routes (Phase 3) ─────────────────────────────────
// GET  /api/v1/doctor/patient-card/:token — Patient card for consultation
// POST /api/v1/doctor/prescribe           — Send prescription to chemist

const express = require("express");
const router = express.Router();
const { getPatientCard, prescribe, getPatientAttachments } = require("../controllers/doctor.controller");
const validate = require("../middleware/validate");
const prescriptionSchema = require("../validators/doctor.validator");

// GET /api/v1/doctor/patient-card/24?doctor_id=1
router.get("/patient-card/:token", getPatientCard);

// POST /api/v1/doctor/prescribe
router.post("/prescribe", validate(prescriptionSchema), prescribe);

// GET /api/v1/doctor/attachments/:apptId
router.get("/attachments/:apptId", getPatientAttachments);

module.exports = router;
