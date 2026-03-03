import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SparkleCanvas from '../../components/SparkleCanvas';
import DoctorNav from '../../components/DoctorNav';

/* ── Mock queue data (replaced by real API) ─────────────────────── */
const MOCK_QUEUE = [
    { tokenId: 'tkn_001', tokenNumber: 21, patientName: 'Priya Sharma', age: 34, gender: 'Female', problem: 'Recurring lower back pain for 2 weeks, especially while sitting.', status: 'waiting', arrivalTime: '09:14 AM', bloodGroup: 'B+' },
    { tokenId: 'tkn_002', tokenNumber: 22, patientName: 'Rahul Mehta', age: 52, gender: 'Male', problem: 'Chest heaviness and mild shortness of breath post-exercise.', status: 'waiting', arrivalTime: '09:28 AM', bloodGroup: 'O+' },
    { tokenId: 'tkn_003', tokenNumber: 23, patientName: 'Ananya Iyer', age: 27, gender: 'Female', problem: 'Migraine headaches occurring 3-4 times a week with light sensitivity.', status: 'waiting', arrivalTime: '09:41 AM', bloodGroup: 'A-' },
    { tokenId: 'tkn_004', tokenNumber: 24, patientName: 'Dev Kapoor', age: 61, gender: 'Male', problem: 'High blood sugar readings at home, currently on Metformin.', status: 'waiting', arrivalTime: '09:55 AM', bloodGroup: 'AB+' },
    { tokenId: 'tkn_005', tokenNumber: 25, patientName: 'Sneha Nair', age: 19, gender: 'Female', problem: 'Persistent cough and sore throat lasting over 10 days.', status: 'waiting', arrivalTime: '10:03 AM', bloodGroup: 'O-' },
];

const statusColors = {
    waiting: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#b45309', dot: '#f59e0b' },
    in_progress: { bg: 'rgba(88,101,242,0.1)', border: 'rgba(88,101,242,0.3)', text: '#4338ca', dot: '#5865f2' },
    completed: { bg: 'rgba(11,158,135,0.1)', border: 'rgba(11,158,135,0.3)', text: '#047857', dot: '#0b9e87' },
};

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const [queue, setQueue] = useState(MOCK_QUEUE);
    const [activeToken, setActiveToken] = useState(null);
    const [calling, setCalling] = useState(false);

    /* Simulate calling next patient */
    const callNext = async () => {
        const next = queue.find(t => t.status === 'waiting');
        if (!next) return;
        setCalling(true);
        await new Promise(r => setTimeout(r, 800));
        setActiveToken(next.tokenId);
        setQueue(q => q.map(t => t.tokenId === next.tokenId ? { ...t, status: 'in_progress' } : t));
        setCalling(false);
        setTimeout(() => navigate(`/doctor/consultation/${next.tokenId}`), 600);
    };

    const waiting = queue.filter(t => t.status === 'waiting').length;
    const done = queue.filter(t => t.status === 'completed').length;

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2, background: '#f8fffe' }}>
            <SparkleCanvas />
            <DoctorNav active="/doctor/dashboard" />

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>

                {/* ── Header strip ─────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Today's Session</p>
                        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
                            Patient Queue
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {waiting} waiting · {done} completed
                        </p>
                    </div>
                    <motion.button
                        whileHover={!calling ? { scale: 1.03, y: -2 } : {}}
                        whileTap={!calling ? { scale: 0.97 } : {}}
                        onClick={callNext}
                        disabled={calling || waiting === 0}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '12px 24px', background: waiting === 0 ? '#ccc' : '#5865f2',
                            color: 'white', border: 'none', borderRadius: '12px',
                            fontWeight: 700, fontSize: '0.9375rem', cursor: waiting === 0 ? 'not-allowed' : 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            boxShadow: waiting > 0 ? '0 4px 16px rgba(88,101,242,0.35)' : 'none',
                            transition: 'all 0.2s'
                        }}>
                        {calling ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                        ) : '👋'}
                        {calling ? 'Calling...' : waiting === 0 ? 'Queue Empty' : 'Call Next Patient'}
                    </motion.button>
                </motion.div>

                {/* ── Stat strip ───────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '32px' }}>
                    {[
                        { icon: '⏳', label: 'Waiting', value: waiting, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                        { icon: '🩺', label: 'In Consultation', value: queue.filter(t => t.status === 'in_progress').length, color: '#5865f2', bg: 'rgba(88,101,242,0.08)' },
                        { icon: '✅', label: 'Completed', value: done, color: '#0b9e87', bg: 'rgba(11,158,135,0.08)' },
                    ].map(s => (
                        <div key={s.label} className="card" style={{ padding: '18px 20px', borderLeft: `3px solid ${s.color}` }}>
                            <p style={{ fontSize: '1.25rem', marginBottom: '6px' }}>{s.icon}</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* ── Token queue list ──────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {queue.map((tok, i) => {
                        const colors = statusColors[tok.status];
                        const isActive = tok.tokenId === activeToken;
                        return (
                            <motion.div key={tok.tokenId}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + i * 0.06 }}
                                className="card"
                                style={{
                                    padding: '18px 22px',
                                    border: isActive ? '2px solid #5865f2' : '1.5px solid var(--border)',
                                    background: isActive ? 'rgba(88,101,242,0.03)' : 'white',
                                    cursor: tok.status !== 'completed' ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                }}
                                onClick={() => tok.status !== 'completed' && navigate(`/doctor/consultation/${tok.tokenId}`)}
                                whileHover={tok.status !== 'completed' ? { y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.07)' } : {}}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {/* Token badge */}
                                    <div style={{
                                        width: 48, height: 48, borderRadius: '12px', flexShrink: 0,
                                        background: isActive ? '#5865f2' : 'var(--accent-bg)',
                                        border: isActive ? 'none' : '1.5px solid rgba(11,158,135,0.2)',
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', letterSpacing: '0.1em' }}>TOKEN</span>
                                        <span style={{ fontSize: '1.125rem', fontWeight: 800, color: isActive ? 'white' : 'var(--accent-dark)', lineHeight: 1.1 }}>#{tok.tokenNumber}</span>
                                    </div>

                                    {/* Patient info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                                            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{tok.patientName}</p>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{tok.age}y · {tok.gender}</span>
                                            <span className="chip" style={{ fontSize: '0.65rem', padding: '2px 7px' }}>{tok.bloodGroup}</span>
                                        </div>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            📋 {tok.problem}
                                        </p>
                                    </div>

                                    {/* Right meta */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                                            background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text,
                                            display: 'flex', alignItems: 'center', gap: '5px'
                                        }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.dot }} />
                                            {tok.status === 'waiting' ? 'Waiting' : tok.status === 'in_progress' ? 'In Consultation' : 'Completed'}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🕐 {tok.arrivalTime}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {queue.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>All patients seen!</p>
                        <p style={{ fontSize: '0.875rem' }}>Your queue is clear for today.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
