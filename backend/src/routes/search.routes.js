// ─── Search Routes ───────────────────────────────────────────
// GET /api/v1/search?q=... — keyword/doctor name search

const express = require("express");
const router = express.Router();
const { searchByKeyword } = require("../controllers/search.controller");

// GET /api/v1/search?q=pancreas
router.get("/", searchByKeyword);

module.exports = router;
