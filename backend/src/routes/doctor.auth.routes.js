// ─── Doctor Auth Routes ───────────────────────────────────────
// All public — no JWT required.
//
// GET  /api/v1/doctor/hospitals/:hospitalId/unregistered-doctors
// POST /api/v1/doctor/register
// POST /api/v1/doctor/login

const express = require('express');
const router = express.Router();
const {
    getUnregisteredDoctors,
    registerDoctor,
    loginDoctor,
} = require('../controllers/doctor.auth.controller');

// List unregistered doctors for a hospital (Step 4 of self-registration)
router.get('/hospitals/:hospitalId/unregistered-doctors', getUnregisteredDoctors);

// Doctor self-registration (claim an existing doctor record)
router.post('/register', registerDoctor);

// Doctor login
router.post('/login', loginDoctor);

module.exports = router;
