// ─── Express Application Setup ───────────────────────────────

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("./routes/index");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ─── Security Headers ────────────────────────────────────────
app.use(helmet());

// ─── CORS Configuration ─────────────────────────────────────
// Allows the React frontend (Vite dev server) to make requests
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// ─── Body Parsers ────────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // Limit payload size for security
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── API Routes ──────────────────────────────────────────────
app.use("/api/v1", routes);

// ─── Root / 404 Handler ──────────────────────────────────────
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "QueueEase API v1 is running",
    });
});

// Express 5: app.all("*") is no longer supported — use app.use() instead
app.use((req, res, next) => {
    const AppError = require("./utils/AppError");
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// ─── Global Error Handler (MUST be last) ─────────────────────
app.use(errorHandler);

module.exports = app;