// ─── Central Route Barrel ────────────────────────────────────
// Mounts all sub-routes under the /api/v1 prefix

const express = require("express");
const router = express.Router();

// Phase 1 routes
const locationRoutes = require("./location.routes");
const hospitalRoutes = require("./hospital.routes");
const hospitalDashboardRoutes = require("./hospital.dashboard.routes");
const patientRoutes = require("./patient.routes");

// Phase 2 routes
const searchRoutes = require("./search.routes");
const availabilityRoutes = require("./availability.routes");
const appointmentRoutes = require("./appointment.routes");

// Phase 3 routes
const doctorRoutes = require("./doctor.routes");
const chemistRoutes = require("./chemist.routes");

// ─── Phase 1: Metadata / Lookup ──────────────────────────────
router.use("/locations", locationRoutes);

// ─── Phase 1: Registration & Patient Actions ───────────────────
router.use("/register/hospital", hospitalRoutes);
router.use("/hospital", hospitalDashboardRoutes); // Dashboard + login
router.use("/patient", patientRoutes);

// ─── Phase 2: Discovery & Appointments ───────────────────────
router.use("/search", searchRoutes);
router.use("/availability", availabilityRoutes);
router.use("/appointments", appointmentRoutes);

// ─── Phase 3: Doctor Consultation & Chemist ──────────────────
router.use("/doctor", doctorRoutes);
router.use("/chemist", chemistRoutes);

// ─── Phase 4: Admin Control & File Uploads ───────────────────
const adminRoutes = require("./admin.routes");
router.use("/admin", adminRoutes);

// Health check
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "API is running",
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;


