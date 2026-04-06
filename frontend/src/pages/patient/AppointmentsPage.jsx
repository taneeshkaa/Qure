import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SparkleCanvas from '../../components/SparkleCanvas';
import { PatientNav } from './PatientDashboard';
import { getMyAppointments, cancelAppointmentAPI } from '../../api/search';

/* ── Countdown hook for remaining time ─────────────────────── */
function useCountdown(targetDate) {
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
        soon: diff < 86_400_000,        // < 1 day
        past: false,
    };
}

function CountdownBadge({ date }) {
    const c = useCountdown(date);
    
    // Completed or past appointments
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

function AppointmentCard({ appt, onCancel }) {
    const [expanded, setExpanded] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const c = useCountdown(appt.date);
    const isPast = appt.status === 'completed' || appt.status === 'cancelled' || c.past;

    const dateStr = appt.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = appt.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Status badge styling
    const getStatusBadge = () => {
        if (appt.status === 'booked' || appt.status === 'confirmed') return { text: '📅 Confirmed', color: 'var(--accent-dark)' };
        if (appt.status === 'completed') return { text: '✓ Completed', color: '#15803d' };
        if (appt.status === 'cancelled') return { text: '✕ Cancelled', color: '#dc2626' };
        return { text: '—', color: 'var(--text-muted)' };
    };
    const statusBadge = getStatusBadge();

    return (
        <motion.div layout className="card" style={{ overflow: 'hidden', opacity: isPast ? 0.7 : 1, transition: 'opacity 0.2s, border-color 0.2s', borderColor: isPast ? 'rgba(0,0,0,0.08)' : 'var(--border)' }}
            onMouseEnter={e => !isPast && (e.currentTarget.style.borderColor = 'rgba(11,158,135,0.3)')}
            onMouseLeave={e => e.currentTarget.style.borderColor = isPast ? 'rgba(0,0,0,0.08)' : 'var(--border)'}>
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
                                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: isPast ? '#999' : 'var(--text-primary)' }}>{appt.doctor}</h3>
                                <p style={{ fontSize: '0.8125rem', color: isPast ? '#bbb' : 'var(--accent-dark)', fontWeight: 500 }}>{appt.specialty}</p>
                            </div>
                            {isPast ? (
                                <span style={{ padding: '4px 12px', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: statusBadge.color }}>
                                    {statusBadge.text}
                                </span>
                            ) : (
                                <CountdownBadge date={appt.date} />
                            )}
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: isPast ? '#bbb' : 'var(--text-secondary)', marginBottom: '8px' }}>🏥 {appt.hospital}</p>
                        <p style={{ fontSize: '0.8125rem', color: isPast ? '#ccc' : 'var(--text-muted)' }}>📅 {dateStr} · {appt.slot} · ₹{appt.fee}</p>
                    </div>
                </div>

                {/* Expand toggle + actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: isPast ? '#ccc' : 'var(--accent-dark)', fontWeight: 600, fontFamily: 'Inter, sans-serif', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {expanded ? 'Hide details ▲' : 'View details ▼'}
                    </button>
                    {!isPast && (
                        <button 
                            disabled={isCancelling}
                            onClick={async () => {
                                if (onCancel) {
                                    setIsCancelling(true);
                                    await onCancel(appt.id);
                                    setIsCancelling(false);
                                }
                            }}
                            style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', cursor: isCancelling ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: isCancelling ? 0.6 : 1 }}>
                            {isCancelling ? 'Cancelling...' : 'Cancel'}
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', background: '#f8fffe' }}>
                        <div style={{ padding: '16px 20px' }}>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Reported Condition</p>
                            <p style={{ fontSize: '0.875rem', color: isPast ? '#bbb' : 'var(--text-secondary)', lineHeight: 1.65 }}>"{appt.condition}"</p>
                            {appt.paymentMethod && (
                                <>
                                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '12px 0 8px 0' }}>Payment</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {appt.paymentMethod === 'UPI' ? '📱 Pay Now via UPI' : '🏥 Pay at Hospital'} — {appt.paymentStatus === 'PAID' ? '✓ Paid' : 'Pending'}
                                    </p>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch appointments on mount
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('📋 Fetching patient appointments...');
                const response = await getMyAppointments();

                console.log('✅ API Response:', response);

                if (!response.data || !Array.isArray(response.data)) {
                    throw new Error('Invalid response format from API - expected array');
                }

                // Convert date strings to Date objects for countdown
                const convertedAppointments = response.data.map(apt => {
                    const datePart = apt.date.split('T')[0];
                    return {
                        ...apt,
                        date: new Date(`${datePart}T${apt.slot || '00:00'}:00`), // Combine date string + slot time correctly
                    };
                });

                console.log('📊 Converted appointments:', convertedAppointments);

                // Sort appointments: booked/confirmed first, then completed/cancelled
                // Within each group, sort by date ascending
                const statusOrder = { 'booked': 0, 'confirmed': 1, 'completed': 2, 'cancelled': 3 };
                const sortedAppointments = convertedAppointments.sort((a, b) => {
                    const statusDiff = (statusOrder[a.status] ?? 999) - (statusOrder[b.status] ?? 999);
                    if (statusDiff !== 0) return statusDiff;
                    return new Date(a.date) - new Date(b.date);
                });

                console.log('✨ Sorted appointments:', sortedAppointments);
                setAppointments(sortedAppointments);
                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching appointments:', err);
                setError(err.message || 'Failed to load appointments');
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const handleCancelAppointment = async (id) => {
        try {
            await cancelAppointmentAPI(id);
            setAppointments(prev => prev.map(a => 
                a.id === id ? { ...a, status: 'cancelled' } : a
            ));
        } catch (err) {
            console.error('Failed to cancel appointment:', err);
            setError(err.message || 'Failed to cancel appointment. Please try again.');
            setTimeout(() => setError(null), 5000); // Clear error after 5s
        }
    };

    // Split appointments into upcoming and past
    const upcoming = appointments.filter(a => a.status === 'booked' || a.status === 'confirmed');
    const past = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

    const urgentAlert = upcoming.find(a => {
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

                {/* ── Loading State ────────────────────────── */}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ width: 40, height: 40, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading your appointments...</p>
                    </motion.div>
                )}

                {/* ── Error State ────────────────────────── */}
                {error && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', marginBottom: '24px' }}>
                        <p style={{ color: '#dc2626', fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>⚠️ {error}</p>
                    </motion.div>
                )}

                {/* ── Empty State ────────────────────────── */}
                {!loading && appointments.length === 0 && !error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <p style={{ fontSize: '2rem', marginBottom: '12px' }}>📅</p>
                        <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>No appointments yet</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Book your first appointment with a doctor</p>
                        <Link to="/patient/dashboard" style={{ display: 'inline-block', padding: '10px 24px', background: 'var(--accent)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                            + Book Appointment
                        </Link>
                    </motion.div>
                )}

                {/* ── Reminder banners ──────────────────────── */}
                {!loading && urgentAlert && <AlertBanner appointment={urgentAlert} />}

                {/* ── Upcoming ─────────────────────────────── */}
                {!loading && upcoming.length > 0 && (
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
                                    <AppointmentCard appt={appt} onCancel={handleCancelAppointment} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Past Appointments ────────────────────────── */}
                {!loading && past.length > 0 && (
                    <div>
                        <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                            Past appointments <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({past.length})</span>
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {past.map((appt, i) => (
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
