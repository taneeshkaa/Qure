// ─── Server Entry Point ──────────────────────────────────────

require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");
const prisma = require("./src/config/db");
const { startReminderJobs } = require("./src/jobs/reminder");

const PORT = process.env.PORT || 5000;

// ─── Create HTTP Server (required for socket.io) ─────────────
const server = http.createServer(app);

// ─── Socket.io Setup ─────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Doctor / Chemist joins a hospital room on connect
    socket.on("join-hospital", (hospitalId) => {
        if (!hospitalId) return;
        socket.join(`hospital:${hospitalId}`);
        console.log(`   ↳ Socket ${socket.id} joined room hospital:${hospitalId}`);
    });

    // Doctor sends prescription → broadcast to chemist in same hospital room
    socket.on("new-prescription", (data) => {
        const room = `hospital:${data.hospitalId}`;
        socket.to(room).emit("new-prescription", data);
        console.log(`   💊 Prescription relayed to room ${room}`);
    });

    socket.on("disconnect", () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
});

// Expose io for use in controllers if needed
app.set("io", io);

server.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 Local:    http://localhost:${PORT}`);
    console.log(`📍 Health:   http://localhost:${PORT}/api/v1/health`);
    console.log(`🌐 CORS:     ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
    console.log(`📦 Mode:     ${process.env.NODE_ENV || "development"}\n`);

    // Start the reminder cron jobs (Phase 2)
    startReminderJobs();
});

// ─── Node 22 Windows Event Loop Workaround ───────────────────
const keepAlive = setInterval(() => { }, 1 << 30);

// ─── Graceful Shutdown ───────────────────────────────────────
const gracefulShutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
    clearInterval(keepAlive);
    io.close();
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
