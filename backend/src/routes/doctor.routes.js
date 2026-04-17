// ─── Doctor Routes (Phase 3) ─────────────────────────────────
// GET  /api/v1/doctors                     — List all doctors (patient-facing)
// GET  /api/v1/doctors/slug/:slug          — Get doctor by slug (patient-facing)
// GET  /api/v1/doctors/:id                 — Get doctor by ID (patient-facing)
// GET  /api/v1/doctor/patient-card/:token — Patient card for consultation
// POST /api/v1/doctor/prescribe           — Send prescription to chemist

const express = require("express");
const router = express.Router();
const { 
  getPatientCard, prescribe, getPatientAttachments, getDoctors, getDoctorById, getDoctorBySlug, 
  getProfile, toggleAvailability, 
  getDashboardStats, getFilteredAppointments, getAppointmentDetails, upsertPrescription, sendToPharmacy, completeAppointment 
} = require("../controllers/doctor.controller");
const validate = require("../middleware/validate");
const prescriptionSchema = require("../validators/doctor.validator");

// IMPORTANT: Order matters! Specific routes must come BEFORE generic /:id route
// Otherwise Express will match /:id first and treat path parameters incorrectly

// GET /api/v1/doctor — List all doctors (must be before /:id route)
router.get("/", getDoctors);

// GET /api/v1/doctor/patient-card/:token — Patient card (must be before /:id route)
router.get("/patient-card/:token", getPatientCard);

// GET /api/v1/doctor/attachments/:apptId — Patient attachments (must be before /:id route)
router.get("/attachments/:apptId", getPatientAttachments);

// GET /api/v1/doctor/slug/:slug — Get doctor by slug (must be before /:id route)
router.get("/slug/:slug", getDoctorBySlug);

// GET /api/v1/doctor/:id — Get doctor by ID (LAST because it's most generic)
router.get("/:id", getDoctorById);

// POST /api/v1/doctor/prescribe
router.post("/prescribe", validate(prescriptionSchema), prescribe);


const requireRole = require('../middleware/requireRole');

const { protect } = require('../middleware/auth.middleware');

router.use('/dashboard', protect);
router.use('/dashboard', requireRole('DOCTOR'));

router.get('/dashboard/me', getProfile);
router.patch('/dashboard/availability', toggleAvailability);

// New dashboard endpoints
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/appointments', getFilteredAppointments);
router.get('/dashboard/appointments/:id', getAppointmentDetails);
router.post('/dashboard/prescriptions', upsertPrescription);
router.patch('/dashboard/prescriptions/:id/send-to-pharmacy', sendToPharmacy);
router.patch('/dashboard/appointments/:id/complete', completeAppointment);

module.exports = router;
