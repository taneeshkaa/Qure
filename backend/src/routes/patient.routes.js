// ─── Patient Registration & Login Routes ──────────────────────

const express = require("express");
const router = express.Router();
const {
	registerPatient,
	loginPatient,
	uploadAttachment,
	getPatientProfile,
	getActiveToken,
	getActiveQueueToken,
	getPatientTimeline,
	getHealthProfile,
	updateHealthProfile,
	getMedicationReminders,
	createMedicationReminder,
	toggleMedicationReminder,
} = require("../controllers/patient.controller");
const {
	getDashboardStatus,
	getDashboardStats,
	getDashboardRecommendations,
	getDashboardActivity,
	getDashboardAnalytics,
	getDashboardLastAction,
} = require("../controllers/patientDashboard.controller");
const validate = require("../middleware/validate");
const patientSchema = require("../validators/patient.validator");
const upload = require("../middleware/upload.middleware");
const { protect } = require("../middleware/auth.middleware");

// POST /api/v1/patient/register
router.post("/register", validate(patientSchema), registerPatient);

// POST /api/v1/patient/login (accepts email for dev/demo)
router.post("/login", loginPatient);

// GET /api/v1/patient/profile
router.get("/profile", protect, getPatientProfile);

// GET /api/v1/patient/active-token
router.get("/active-token", protect, getActiveToken);

// GET /api/v1/patient/queue/active
router.get("/queue/active", protect, getActiveQueueToken);

// GET /api/v1/patient/timeline
router.get("/timeline", protect, getPatientTimeline);

// GET/PUT /api/v1/patient/health-profile
router.get("/health-profile", protect, getHealthProfile);
router.put("/health-profile", protect, updateHealthProfile);

// Medication reminders
// GET  /api/v1/patient/reminders
// POST /api/v1/patient/reminders
// PATCH /api/v1/patient/reminders/:id  (toggle active)
router.get("/reminders", protect, getMedicationReminders);
router.post("/reminders", protect, createMedicationReminder);
router.patch("/reminders/:id", protect, toggleMedicationReminder);

// ─── Patient Dashboard (Phase 6) ───────────────────────────────
// GET /api/v1/patient/dashboard/status
router.get("/dashboard/status", protect, getDashboardStatus);
// GET /api/v1/patient/dashboard/stats
router.get("/dashboard/stats", protect, getDashboardStats);
// GET /api/v1/patient/dashboard/recommendations
router.get("/dashboard/recommendations", protect, getDashboardRecommendations);
// GET /api/v1/patient/dashboard/activity
router.get("/dashboard/activity", protect, getDashboardActivity);
// GET /api/v1/patient/dashboard/analytics
router.get("/dashboard/analytics", protect, getDashboardAnalytics);
// GET /api/v1/patient/dashboard/last-action
router.get("/dashboard/last-action", protect, getDashboardLastAction);

// POST /api/v1/patient/upload
// Multer intercepts `attachment` file field, limits to 5MB, and assigns req.file
router.post("/upload", upload.single("attachment"), uploadAttachment);

module.exports = router;

