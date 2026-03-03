// ─── Reminder Cron Jobs ──────────────────────────────────────
// Processes scheduled reminders for upcoming appointments.
// Job 1: Runs every hour — checks for 1-day-before reminders.
// Job 2: Runs every 15 min — checks for 1-hour-before reminders.
// SMS/Email delivery is stubbed with console.log for now.

const cron = require("node-cron");
const prisma = require("../config/db");

/**
 * Process unsent reminders of a given type that are due.
 * @param {string} type - "1_DAY" or "1_HOUR"
 */
async function processReminders(type) {
    const now = new Date();

    try {
        // Find all unsent reminders where scheduled_at is in the past
        const dueReminders = await prisma.reminder.findMany({
            where: {
                type,
                sent: false,
                scheduled_at: {
                    lte: now,
                },
            },
            include: {
                appointment: {
                    include: {
                        patient: {
                            select: {
                                full_name: true,
                                phone: true,
                                email: true,
                            },
                        },
                        doctor: {
                            select: {
                                full_name: true,
                                specialization: true,
                            },
                        },
                    },
                },
            },
        });

        if (dueReminders.length === 0) return;

        for (const reminder of dueReminders) {
            const apt = reminder.appointment;
            const label = type === "1_DAY" ? "24-HOUR" : "1-HOUR";

            // ─── STUB: Replace with Twilio/SendGrid integration ──
            console.log(
                `\n📨 [${label} REMINDER] ` +
                `Patient: ${apt.patient.full_name} (${apt.patient.phone}) | ` +
                `Doctor: ${apt.doctor.full_name} (${apt.doctor.specialization}) | ` +
                `Date: ${apt.date.toISOString().split("T")[0]} | ` +
                `Slot: ${apt.slot} | ` +
                `Token: #${apt.token_number}`
            );

            // Mark as sent
            await prisma.reminder.update({
                where: { id: reminder.id },
                data: { sent: true },
            });
        }

        console.log(`  ✅ Processed ${dueReminders.length} ${type} reminder(s)`);
    } catch (err) {
        console.error(`  ❌ Error processing ${type} reminders:`, err.message);
    }
}

/**
 * Starts the reminder cron jobs.
 * Call this after the server starts listening.
 */
function startReminderJobs() {
    // Job 1: Check 1-day reminders every hour (at minute 0)
    cron.schedule("0 * * * *", () => {
        console.log("\n⏰ [CRON] Checking 1-day reminders...");
        processReminders("1_DAY");
    });

    // Job 2: Check 1-hour reminders every 15 minutes
    cron.schedule("*/15 * * * *", () => {
        console.log("\n⏰ [CRON] Checking 1-hour reminders...");
        processReminders("1_HOUR");
    });

    console.log("🔔 Reminder cron jobs started");
    console.log("   → 1-day reminders: checked every hour");
    console.log("   → 1-hour reminders: checked every 15 minutes");
}

module.exports = { startReminderJobs };
