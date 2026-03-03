// ─── Admin Routing ──────────────────────────────────────────────
// Registration, login, and secured administrative capabilities.

const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { adminAuthSchema } = require("../validators/admin.validator");
const { registerAdmin, loginAdmin, softDeleteEntity, getAdminStats } = require("../controllers/admin.controller");
const { verifyAdmin } = require("../middleware/auth.middleware");

// Public Auth Endpoints
router.post("/register", validate(adminAuthSchema), registerAdmin);
router.post("/login", validate(adminAuthSchema), loginAdmin);

// Protected Admin Endpoints
router.use(verifyAdmin); // All routes below this require a valid Admin JWT

router.delete("/entity/:type/:id", softDeleteEntity);
router.get("/stats", getAdminStats);

module.exports = router;
