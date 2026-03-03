import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SparkleCanvas from '../../components/SparkleCanvas';
import { PatientNav } from './PatientDashboard';

/* ── Demo upcoming appointments ─────────────────────────────── */
function makeFutureDate(hoursFromNow) {
    const d = new Date();
    d.setHours(d.getHours() + hoursFromNow);
    return d;
}

const DEMO_APPOINTMENTS = [
    {
        id: 1,
        token: 7,
        doctor: 'Dr. Priya Mehta',
        specialty: 'Cardiology',
        hospital: 'Apollo Hospitals, Navi Mumbai',
        date: makeFutureDate(0.5),  // 30 min from now — urgent
        condition: 'Recurring chest pain after physical activity for the past 3 days.',
        fee: 1200,
        status: 'upcoming',
    },
    {
        id: 2,
        token: 22,
        doctor: 'Dr. Rahul Sharma',
        specialty: 'Neurology',
        hospital: 'AIIMS New Delhi',
        date: makeFutureDate(26),   // ~1 day from now — 24h alert
        condition: 'Frequent migraines for the past month, 4–5 times a week.',
        fee: 1500,
        status: 'upcoming',
    },
    {
        id: 3,
        token: 15,
        doctor: 'Dr. Sneha Iyer',
        specialty: 'Pediatrics',
        hospital: 'Manipal Hospital, Bengaluru',
        date: makeFutureDate(72),   // 3 days — normal
        condition: "Child's annual vaccination and general checkup.",
        fee: 800,
        status: 'upcoming',
    },
    {
        id: 4,
        token: 3,
        doctor: 'Dr. Kavitha Rao',
        specialty: 'Dermatology',
        hospital: 'KIMS Hospital, Hyderabad',
        date: makeFutureDate(-48),  // past — completed
        condition: 'Recurring eczema on arms and neck.',
        fee: 900,
        status: 'completed',
    },
];

/* Returns { days, hours, minutes, seconds, urgent, soon, past } */
function useCountdown(targetDate) {
    // eslint-disable-next-line react-hooks/purity
    const [diff, setDiff] = useState(targetDate - Date.now());

    useEffect(() => {
        const id = setInterval(() => setDiff(targetDate - Date.now()), 1000);
        return () => clearInterval(id);
    }, [targetDate]);

    if (diff <= 0) return { past: true };
    const totalSec = Math.floor(diff / 1000);
    return {
        days: Math.floor(totalSec / 86400),
        hours: Math.floor((totalSec % 86400) / 3600),
        minutes: Math.floor((totalSec % 3600) / 60),
        seconds: totalSec % 60,
        urgent: diff < 3_600_000,       // < 1 hour
        soon: diff < 86_400_000,      // < 1 day
        past: false,
    };
}

function CountdownBadge({ date }) {
    const c = useCountdown(date);
    if (c.past) return <span style={{ padding: '4px 12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>✓ Completed</span>;

    const bg = c.urgent ? 'rgba(239,68,68,0.08)' : c.soon ? 'rgba(245,158,11,0.08)' : 'var(--accent-bg)';
    const bdr = c.urgent ? 'rgba(239,68,68,0.25)' : c.soon ? 'rgba(245,158,11,0.25)' : 'rgba(11,158,135,0.2)';
    const color = c.urgent ? '#dc2626' : c.soon ? '#b45309' : 'var(--accent-dark)';
    const icon = c.urgent ? '🚨' : c.soon ? '⏰' : '📅';

    const parts = c.days > 0
        ? `${c.days}d ${c.hours}h`
        : c.hours > 0
            ? `${c.hours}h ${c.minutes}m`
            : `${c.minutes}m ${c.seconds}s`;

    return (
        <motion.div animate={c.urgent ? { scale: [1, 1.02, 1] } : {}} transition={{ duration: 1.2, repeat: Infinity }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', background: bg, border: `1.5px solid ${bdr}`, borderRadius: '20px' }}>
            <span>{icon}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{parts}</span>
        </motion.div>
    );
}

function AlertBanner({ appointment }) {
    const c = useCountdown(appointment.date);
    if (c.past || (!c.urgent && !c.soon)) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '12px 18px', borderRadius: '12px', background: c.urgent ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)', border: `1.5px solid ${c.urgent ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{c.urgent ? '🚨' : '⏰'}</span>
            <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: c.urgent ? '#dc2626' : '#b45309', marginBottom: '2px' }}>
                    {c.urgent ? 'Your appointment is very soon!' : 'Appointment reminder — tomorrow!'}
                </p>
                <p style={{ fontSize: '0.8125rem', color: c.urgent ? '#ef4444' : '#d97706' }}>
                    {appointment.doctor} — {appointment.specialty} at {appointment.hospital}.
                </p>
            </div>
        </motion.div>
    );
}

function AppointmentCard({ appt }) {
    const [expanded, setExpanded] = useState(false);
    const c = useCountdown(appt.date);
    const isPast = appt.status === 'completed' || c.past;

    const dateStr = appt.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = appt.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div layout className="card" style={{ overflow: 'hidden', opacity: isPast ? 0.75 : 1, transition: 'opacity 0.2s, border-color 0.2s' }}
            onMouseEnter={e => !isPast && (e.currentTarget.style.borderColor = 'rgba(11,158,135,0.3)')}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    {/* Token badge */}
                    <div style={{ width: 52, height: 52, borderRadius: '14px', background: isPast ? '#f5f5f5' : 'linear-gradient(135deg, #0b9e87 0%, #0d7a6a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isPast ? 'none' : '0 4px 14px rgba(11,158,135,0.3)' }}>
                        <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: isPast ? '#aaa' : 'rgba(255,255,255,0.7)', letterSpacing: '0.06em' }}>TOKEN</span>
                        <span style={{ fontSize: '1.0625rem', fontWeight: 900, color: isPast ? '#aaa' : 'white', lineHeight: 1 }}>#{appt.token}</span>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                            <div>
                                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{appt.doctor}</h3>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 500 }}>{appt.specialty}</p>
                            </div>
                            <CountdownBadge date={appt.date} />
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>🏥 {appt.hospital}</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>📅 {dateStr} · 🕐 {timeStr} · ₹{appt.fee}</p>
                    </div>
                </div>

                {/* Expand toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 600, fontFamily: 'Inter, sans-serif', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {expanded ? 'Hide details ▲' : 'View details ▼'}
                    </button>
                    {!isPast && (
                        <button style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', background: '#f8fffe' }}>
                        <div style={{ padding: '16px 20px' }}>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Reported Condition</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, fontStyle: 'italic' }}>"{appt.condition}"</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function AppointmentsPage() {
    const upcoming = DEMO_APPOINTMENTS.filter(a => a.status === 'upcoming');
    const completed = DEMO_APPOINTMENTS.filter(a => a.status === 'completed');
    const urgentAlert = upcoming.find(a => {
        // eslint-disable-next-line react-hooks/purity
        const diff = a.date - Date.now();
        return diff > 0 && diff < 86_400_000;
    });

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2, background: '#f8fffe' }}>
            <SparkleCanvas />
            <PatientNav active="/patient/appointments" />

            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>

                {/* ── Page header ───────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 1.875rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '6px' }}>My Appointments</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Manage your upcoming tokens and appointment history.</p>
                </motion.div>

                {/* ── Reminder banners ──────────────────────── */}
                {urgentAlert && <AlertBanner appointment={urgentAlert} />}

                {/* ── Upcoming ─────────────────────────────── */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Upcoming <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({upcoming.length})</span>
                        </h2>
                        <Link to="/patient/dashboard" style={{ fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}>+ Book new →</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {upcoming.map((appt, i) => (
                            <motion.div key={appt.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                                <AppointmentCard appt={appt} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ── Completed ────────────────────────────── */}
                {completed.length > 0 && (
                    <div>
                        <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                            Past appointments <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({completed.length})</span>
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {completed.map((appt, i) => (
                                <motion.div key={appt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                                    <AppointmentCard appt={appt} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
