// ─── Hospital Registration Route ─────────────────────────────

const express = require("express");
const router = express.Router();
const { registerHospital } = require("../controllers/hospital.controller");
const validate = require("../middleware/validate");
const hospitalSchema = require("../validators/hospital.validator");

// POST /api/v1/register/hospital
router.post("/", validate(hospitalSchema), registerHospital);


const { addDoctor } = require('../controllers/hospital.controller');
router.post('/add-doctor', addDoctor);

module.exports = router;
