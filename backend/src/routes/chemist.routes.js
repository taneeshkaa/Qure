// ─── Chemist Routes (Phase 3) ────────────────────────────────
// GET   /api/v1/chemist/queue       — Live "To-Pack" list
// PATCH /api/v1/chemist/verify/:id  — Verify patient & deliver medicine

const express = require("express");
const router = express.Router();
const { getQueue, verifyAndDeliver } = require("../controllers/chemist.controller");
const validate = require("../middleware/validate");
const chemistVerifySchema = require("../validators/chemist.validator");

// GET /api/v1/chemist/queue?chemist_id=1
router.get("/queue", getQueue);

// PATCH /api/v1/chemist/verify/5
router.patch("/verify/:id", validate(chemistVerifySchema), verifyAndDeliver);

module.exports = router;
