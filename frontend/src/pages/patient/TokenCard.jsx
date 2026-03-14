import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SparkleCanvas from '../../components/SparkleCanvas';
import { PatientNav } from './PatientDashboard';

function QRPattern({ token }) {
    /* Decorative mini SVG QR look */
    const cells = [];
    const seed = token * 37;
    for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
            const isCorner =
                (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
            const filled = isCorner || ((seed + r * 7 + c) % 3 !== 0);
            cells.push(<rect key={`${r}-${c}`} x={c * 8 + 1} y={r * 8 + 1} width={6} height={6} fill={filled ? '#0b9e87' : '#f0fdfb'} rx={1} />);
        }
    }
    return (
        <svg width="60" height="60" viewBox="0 0 60 60" style={{ borderRadius: '8px', border: '2px solid rgba(11,158,135,0.2)' }}>
            <rect width="60" height="60" fill="white" />
            {cells}
        </svg>
    );
}

export default function TokenCard() {
    const { state } = useLocation();

    /* Fallback demo data if navigated directly */
    const data = state || {
        token: 14,
        doctor: { name: 'Dr. Priya Mehta', specialty: 'Cardiology', hospital: 'Apollo Hospitals, Navi Mumbai', fee: 1200 },
        hospital: 'Apollo Hospitals, Navi Mumbai',
        slot: { date: 'Today', time: '11:00 AM', isoDate: new Date().toISOString().split('T')[0] },
        condition: 'Chest pain after physical activity for the past 3 days.',
    };

    const isToday = data.slot?.isoDate === new Date().toISOString().split('T')[0];

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2, background: '#f8fffe' }}>
            <SparkleCanvas />
            <PatientNav active="/patient/appointments" />

            <div style={{ maxWidth: '540px', margin: '0 auto', padding: '48px 24px 80px' }}>

                {/* ── Success header ──────────────────────────── */}
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                        style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(11,158,135,0.4)' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                    </motion.div>
                    <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '8px' }}>Booking Confirmed!</h1>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>Your digital token has been generated. Show it at the hospital.</p>
                </motion.div>

                {/* ── Token Card ────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.45 }}>
                    <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(11,158,135,0.14)', border: '1.5px solid rgba(11,158,135,0.15)' }}>

                        {/* Card header banner */}
                        <div style={{ background: 'linear-gradient(135deg, #0b9e87 0%, #0d7a6a 100%)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>QueueEase Digital Token</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Token</span>
                                    <motion.span
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 250, delay: 0.35 }}
                                        style={{ fontSize: '3rem', fontWeight: 900, color: 'white', letterSpacing: '-0.05em', lineHeight: 1 }}>
                                        #{String(data.token).padStart(2, '0')}
                                    </motion.span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <QRPattern token={data.token} />
                                <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Scan at hospital</p>
                            </div>
                        </div>

                        {/* Card body */}
                        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '0' }}>

                            {/* Appointment info */}
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Appointment Details</p>
                                {[
                                    { icon: '👨‍⚕️', label: 'Doctor', value: data.doctor.name },
                                    { icon: '🩺', label: 'Specialty', value: data.doctor.specialty },
                                    { icon: '🏥', label: 'Hospital', value: data.hospital || data.doctor.hospital },
                                    { icon: '📅', label: 'Date', value: data.slot?.date || '—' },
                                    { icon: '🕐', label: 'Time', value: data.slot?.time || '—' },
                                ].map(row => (
                                    <div key={row.label} style={{ display: 'flex', gap: '12px', padding: '9px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                                        <span style={{ fontSize: '0.9rem', flexShrink: 0, width: '20px' }}>{row.icon}</span>
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', minWidth: '72px' }}>{row.label}</span>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{row.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Condition */}
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Reported Condition</p>
                                <div style={{ padding: '12px 16px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.15)', borderRadius: '10px' }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, fontStyle: 'italic' }}>"{data.condition}"</p>
                                </div>
                            </div>

                            {/* Fee */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '2px dashed rgba(11,158,135,0.2)', borderBottom: '2px dashed rgba(11,158,135,0.2)', marginBottom: '20px' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Consultation fee</span>
                                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--accent)' }}>₹{data.doctor.fee}</span>
                            </div>

                            {/* Alert banner */}
                            <motion.div
                                animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }}
                                style={{ display: 'flex', gap: '10px', padding: '12px 16px', background: isToday ? 'rgba(245,158,11,0.08)' : 'var(--accent-bg)', border: `1.5px solid ${isToday ? 'rgba(245,158,11,0.25)' : 'rgba(11,158,135,0.2)'}`, borderRadius: '10px', marginBottom: '20px' }}>
                                <span style={{ fontSize: '1.1rem' }}>{isToday ? '⏰' : '📅'}</span>
                                <p style={{ fontSize: '0.8125rem', color: isToday ? '#92400e' : 'var(--accent-dark)', lineHeight: 1.6 }}>
                                    {isToday
                                        ? `Your appointment is today at ${data.slot?.time}. Arrive 10 minutes early.`
                                        : `You'll receive an SMS reminder 1 day and 1 hour before your appointment.`}
                                </p>
                            </motion.div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Link to="/patient/appointments" style={{ flex: 1, textDecoration: 'none' }}>
                                    <button style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 3px 10px rgba(11,158,135,0.3)' }}>
                                        📅 View Appointments
                                    </button>
                                </Link>
                                <Link to="/patient/dashboard" style={{ flex: 1, textDecoration: 'none' }}>
                                    <button className="btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}>🔍 New Search</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
