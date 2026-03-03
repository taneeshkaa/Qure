// ─── Patient Registration Route ──────────────────────────────

const express = require("express");
const router = express.Router();
const { registerPatient, uploadAttachment } = require("../controllers/patient.controller");
const validate = require("../middleware/validate");
const patientSchema = require("../validators/patient.validator");
const upload = require("../middleware/upload.middleware");

// POST /api/v1/patient/register
router.post("/register", validate(patientSchema), registerPatient);

// POST /api/v1/patient/upload
// Multer intercepts `attachment` file field, limits to 5MB, and assigns req.file
router.post("/upload", upload.single("attachment"), uploadAttachment);

module.exports = router;

