// ─── Prisma Client Singleton ─────────────────────────────────
// Ensures a single PrismaClient instance is reused across the app,
// which is critical for connection pooling with Neon's serverless model.

const { PrismaClient } = require("@prisma/client");

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  // In development, reuse the client across hot-reloads (nodemon)
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();

    // Force connection to surface any DB errors on startup
    global.__prisma.$connect()
      .then(() => console.log("✅ Database connected successfully"))
      .catch((err) => {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
      });
  }
  prisma = global.__prisma;
}

module.exports = prisma;