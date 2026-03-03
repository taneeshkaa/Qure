// ─── Server Entry Point ──────────────────────────────────────

require("dotenv").config();

const app = require("./src/app");
const prisma = require("./src/config/db");
const { startReminderJobs } = require("./src/jobs/reminder");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 Local:    http://localhost:${PORT}`);
    console.log(`📍 Health:   http://localhost:${PORT}/api/v1/health`);
    console.log(`🌐 CORS:     ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
    console.log(`📦 Mode:     ${process.env.NODE_ENV || "development"}\n`);

    // Start the reminder cron jobs (Phase 2)
    startReminderJobs();
});

// ─── Node 22 Windows Event Loop Workaround ───────────────────
// Node 22.x on Windows has a bug where the event loop drains
// immediately after server startup despite an active listener.
const keepAlive = setInterval(() => { }, 1 << 30);

// ─── Graceful Shutdown ───────────────────────────────────────
// Ensures Prisma disconnects cleanly on server stop,
// preventing dangling Neon connections.
const gracefulShutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
    clearInterval(keepAlive);
    await prisma.$disconnect();
    server.close(() => {
        console.log("💤 Server closed.");
        process.exit(0);
    });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ─── Unhandled Errors ────────────────────────────────────────
process.on("unhandledRejection", (err) => {
    console.error("❌ UNHANDLED REJECTION:", err.message);
    clearInterval(keepAlive);
    server.close(() => {
        process.exit(1);
    });
});

process.on("uncaughtException", (err) => {
    console.error("❌ UNCAUGHT EXCEPTION:", err.message);
    clearInterval(keepAlive);
    process.exit(1);
});