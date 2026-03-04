// ─── Hospital Dashboard Routes ────────────────────────────────
// All routes below /api/v1/hospital are protected (verifyHospital)

const express = require("express");
const router = express.Router();
const {
    loginHospital,
    getHospitalProfile,
    updateHospitalProfile,
    getHospitalDoctors,
    addHospitalDoctor,
    removeHospitalDoctor,
} = require("../controllers/hospital.controller");
const { verifyHospital } = require("../middleware/auth.middleware");

// POST /api/v1/hospital/login (public)
router.post("/login", loginHospital);

// All routes below need a valid hospital JWT
router.use(verifyHospital);

// GET    /api/v1/hospital/profile
// PUT    /api/v1/hospital/profile
router.get("/profile", getHospitalProfile);
router.put("/profile", updateHospitalProfile);

// GET    /api/v1/hospital/doctors
// POST   /api/v1/hospital/doctors
// DELETE /api/v1/hospital/doctors/:id
router.get("/doctors", getHospitalDoctors);
router.post("/doctors", addHospitalDoctor);
router.delete("/doctors/:id", removeHospitalDoctor);

module.exports = router;
