import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { detectSpecialty, smartSearch } from '../../data/searchData';
import SparkleCanvas from '../../components/SparkleCanvas';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good morning', emoji: '☀️' };
    if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    return { text: 'Good evening', emoji: '🌙' };
}

/* ─────────────────────────────────────────────
   Animated counter
───────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', duration = 1.4 }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const isNum = typeof target === 'number';
        if (!isNum) return;
        let start = null;
        const step = (ts) => {
            if (!start) start = ts;
            const prog = Math.min((ts - start) / (duration * 1000), 1);
            const ease = 1 - Math.pow(1 - prog, 3);
            setDisplay(Math.round(ease * target));
            if (prog < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration]);
    return typeof target === 'number' ? <>{display}{suffix}</> : <>{target}</>;
}

/* ─────────────────────────────────────────────
   Floating orb background
───────────────────────────────────────────── */
function FloatingOrbs() {
    const orbs = [
        { size: 340, x: '-8%', y: '-12%', color: 'rgba(11,158,135,0.10)', delay: 0 },
        { size: 260, x: '78%', y: '5%', color: 'rgba(52,217,190,0.08)', delay: 1.2 },
        { size: 200, x: '55%', y: '60%', color: 'rgba(11,158,135,0.07)', delay: 2.4 },
        { size: 180, x: '-5%', y: '65%', color: 'rgba(88,226,200,0.06)', delay: 0.8 },
    ];
    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
            {orbs.map((o, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: o.size,
                        height: o.size,
                        left: o.x,
                        top: o.y,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
                    }}
                    animate={{ scale: [1, 1.12, 1], x: [0, 14, 0], y: [0, -10, 0] }}
                    transition={{ duration: 8 + i * 1.5, delay: o.delay, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Nav
───────────────────────────────────────────── */
const NAV_ITEMS = [
    { label: 'Dashboard', to: '/patient/dashboard', icon: '◈' },
    { label: 'Appointments', to: '/patient/appointments', icon: '◷' },
    { label: 'Hospitals', to: '/hospitals', icon: '✦' },
    { label: 'Doctors', to: '/doctors', icon: '✿' },
];

function PatientNav({ active = '' }) {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <motion.header
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: scrolled ? 'rgba(240,250,248,0.85)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(214,238,234,0.7)' : '1px solid transparent',
                padding: '0 40px', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
            }}
        >
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <div className="logo-mark" style={{ width: 34, height: 34, borderRadius: '10px' }}>
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" />
                    </svg>
                </div>
                <span style={{ fontSize: '1.0625rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>QueueEase</span>
            </Link>

            {/* Nav links */}
            <nav style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px' }}>
                {NAV_ITEMS.map(item => {
                    const isActive = active === item.to;
                    return (
                        <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ background: isActive ? undefined : 'rgba(11,158,135,0.06)' }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '6px 14px', borderRadius: '8px',
                                    background: isActive ? 'var(--accent)' : 'transparent',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    fontSize: '0.8125rem', fontWeight: isActive ? 700 : 500,
                                    transition: 'all 0.15s', cursor: 'pointer',
                                }}
                            >
                                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{item.icon}</span>
                                {item.label}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Avatar */}
            <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#0b9e87,#34d9be)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: 800, color: 'white',
                    boxShadow: '0 2px 10px rgba(11,158,135,0.35)',
                }}>P</div>
                <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>Patient</p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>My Account</p>
                </div>
            </motion.div>
        </motion.header>
    );
}

export { PatientNav };

/* ─────────────────────────────────────────────
   Quick search chips
───────────────────────────────────────────── */
const QUICK_SEARCHES = [
    { label: 'Heart checkup', icon: '❤️' },
    { label: 'Headache & migraine', icon: '🧠' },
    { label: 'Back pain', icon: '🦴' },
    { label: 'Skin rash', icon: '🩺' },
    { label: 'Stomach acidity', icon: '🫁' },
    { label: 'Knee pain', icon: '🦵' },
    { label: 'Fever & cold', icon: '🌡️' },
    { label: 'Eye checkup', icon: '👁️' },
    { label: 'Anxiety & stress', icon: '🧘' },
    { label: 'Child vaccination', icon: '💉' },
    { label: 'Cancer screening', icon: '🔬' },
    { label: 'Kidney stone', icon: '🫀' },
];

/* ─────────────────────────────────────────────
   Stats
───────────────────────────────────────────── */
const STATS = [
    { icon: '🏥', value: 11, suffix: '+', label: 'Hospitals', color: '#0b9e87' },
    { icon: '👨‍⚕️', value: 7, suffix: '+', label: 'Doctors', color: '#5865f2' },
    { icon: '⚡', value: '<5 min', suffix: '', label: 'Avg. booking', color: '#f59e0b' },
    { icon: '⭐', value: 4.9, suffix: '', label: 'Avg. rating', color: '#ec4899' },
];

/* ─────────────────────────────────────────────
   Action cards
───────────────────────────────────────────── */
const ACTIONS = [
    {
        icon: '🔍',
        title: 'Find a Doctor',
        desc: 'Browse 7+ verified specialists by name, symptom, or specialty — with live token availability.',
        to: '/doctors',
        gradient: 'linear-gradient(135deg,#0b9e87 0%,#34d9be 100%)',
        glow: 'rgba(11,158,135,0.22)',
        tag: 'Most popular',
    },
    {
        icon: '🏥',
        title: 'Explore Hospitals',
        desc: 'Discover top-rated hospitals near you. Filter by city, services, and availability.',
        to: '/hospitals',
        gradient: 'linear-gradient(135deg,#5865f2 0%,#8b95ff 100%)',
        glow: 'rgba(88,101,242,0.20)',
        tag: '',
    },
    {
        icon: '📅',
        title: 'My Appointments',
        desc: 'Track your upcoming tokens, get reminders, and view your consultation history.',
        to: '/patient/appointments',
        gradient: 'linear-gradient(135deg,#f59e0b 0%,#fcd34d 100%)',
        glow: 'rgba(245,158,11,0.18)',
        tag: '',
    },
];

/* ─────────────────────────────────────────────
   Trust strip
───────────────────────────────────────────── */
const TRUST = [
    { label: 'NABH Accredited', icon: '🏅' },
    { label: 'ISO 27001 Secure', icon: '🔒' },
    { label: 'Verified Doctors', icon: '✅' },
    { label: '24/7 Support', icon: '🕐' },
];

/* ─────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────── */
export default function PatientDashboard() {
    const [query, setQuery] = useState('');
    const [isFocused, setFocused] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const greeting = getGreeting();

    const detection = useMemo(() => {
        if (query.trim().length >= 2) return detectSpecialty(query);
        return null;
    }, [query]);

    const preview = useMemo(() => {
        if (query.trim().length >= 2) {
            const { doctors: d, hospitals: h } = smartSearch(query);
            return [...d.slice(0, 3), ...h.slice(0, 2)];
        }
        return [];
    }, [query]);

    const doSearch = () => {
        if (query.trim().length >= 2)
            navigate(`/patient/search?q=${encodeURIComponent(query.trim())}`);
    };

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
            <SparkleCanvas />
            <FloatingOrbs />

            {/* Dot grid background */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
                backgroundImage: 'radial-gradient(circle, rgba(11,158,135,0.07) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
                <PatientNav active="/patient/dashboard" />

                {/* ── HERO SECTION ─────────────────────────────── */}
                <section style={{
                    maxWidth: '900px', margin: '0 auto',
                    padding: '72px 28px 56px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    textAlign: 'center',
                }}>
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '6px 18px',
                            background: 'rgba(11,158,135,0.08)',
                            border: '1px solid rgba(11,158,135,0.2)',
                            borderRadius: '20px', marginBottom: '28px',
                        }}
                    >
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0b9e87', display: 'inline-block', animation: 'pulse 1.4s ease-in-out infinite' }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-dark)' }}>
                            India's smartest healthcare platform
                        </span>
                    </motion.div>

                    {/* Greeting */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 500 }}
                    >
                        {greeting.text} {greeting.emoji}
                    </motion.p>

                    {/* Main heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        style={{
                            fontSize: 'clamp(2.25rem,5vw,3.5rem)',
                            fontWeight: 900,
                            letterSpacing: '-0.05em',
                            lineHeight: 1.08,
                            color: 'var(--text-primary)',
                            marginBottom: '20px',
                        }}
                    >
                        Your health,{' '}
                        <span style={{
                            background: 'linear-gradient(135deg,#0b9e87 0%,#34d9be 60%,#0b9e87 100%)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            animation: 'gradientShift 4s ease-in-out infinite',
                        }}>
                            on your terms.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.18 }}
                        style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '40px' }}
                    >
                        Search by symptom, specialty, doctor name, or hospital — and get a confirmed token in under 5 minutes.
                    </motion.p>

                    {/* ── SEARCH BAR ─────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        style={{ position: 'relative', width: '100%', maxWidth: '680px', marginBottom: '20px' }}
                    >
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            background: 'rgba(255,255,255,0.92)',
                            backdropFilter: 'blur(12px)',
                            border: `2px solid ${isFocused ? 'var(--accent)' : 'rgba(214,238,234,0.9)'}`,
                            borderRadius: '18px', padding: '0 8px 0 18px',
                            boxShadow: isFocused
                                ? '0 0 0 5px rgba(11,158,135,0.12), 0 12px 40px rgba(11,158,135,0.14)'
                                : '0 4px 20px rgba(0,0,0,0.07)',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}>
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                                style={{ color: isFocused ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0, transition: 'color 0.2s' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>

                            <input
                                ref={inputRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setTimeout(() => setFocused(false), 160)}
                                onKeyDown={e => e.key === 'Enter' && doSearch()}
                                placeholder="Type a symptom, doctor name, or hospital..."
                                style={{
                                    flex: 1, border: 'none', outline: 'none',
                                    padding: '18px 12px', fontSize: '1rem',
                                    color: 'var(--text-primary)', background: 'transparent',
                                    fontFamily: 'Inter, sans-serif',
                                }}
                            />

                            {/* Specialty pill */}
                            <AnimatePresence>
                                {detection && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.85 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '5px 12px',
                                            background: 'var(--accent-bg)',
                                            border: '1px solid rgba(11,158,135,0.25)',
                                            borderRadius: '20px', whiteSpace: 'nowrap', marginRight: '8px',
                                        }}
                                    >
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-dark)' }}>→ {detection.specialty}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={doSearch}
                                style={{
                                    padding: '11px 26px',
                                    background: 'linear-gradient(135deg,#0b9e87,#34d9be)',
                                    color: 'white', border: 'none', borderRadius: '12px',
                                    fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                                    fontFamily: 'Inter, sans-serif', flexShrink: 0,
                                    boxShadow: '0 3px 12px rgba(11,158,135,0.35)',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                Search →
                            </motion.button>
                        </div>

                        {/* Live dropdown */}
                        <AnimatePresence>
                            {isFocused && preview.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0,
                                        marginTop: '8px',
                                        background: 'rgba(255,255,255,0.97)',
                                        backdropFilter: 'blur(16px)',
                                        border: '1.5px solid var(--border)',
                                        borderRadius: '14px',
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                        zIndex: 100, overflow: 'hidden',
                                    }}
                                >
                                    {detection && (
                                        <div style={{
                                            padding: '10px 16px',
                                            background: 'var(--accent-bg)',
                                            borderBottom: '1px solid rgba(11,158,135,0.12)',
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                        }}>
                                            <span style={{ fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 500 }}>
                                                Searching <strong>"{detection.keyword}"</strong> → <strong>{detection.specialty}</strong>
                                            </span>
                                        </div>
                                    )}
                                    {preview.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ background: '#f0faf8' }}
                                            onClick={() => navigate(item.specialty ? `/doctors/${item.id}` : `/hospitals/${item.id}`)}
                                            style={{
                                                padding: '12px 16px', cursor: 'pointer',
                                                display: 'flex', gap: '12px', alignItems: 'center',
                                                borderBottom: i < preview.length - 1 ? '1px solid var(--border)' : 'none',
                                            }}
                                        >
                                            <div style={{
                                                width: 38, height: 38, borderRadius: '10px',
                                                background: item.specialty ? 'rgba(11,158,135,0.1)' : 'rgba(88,101,242,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
                                            }}>
                                                {item.specialty ? '👨‍⚕️' : '🏥'}
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {item.specialty ? `${item.specialty} · ${item.hospital}` : `${item.city}, ${item.state}`}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <motion.div
                                        whileHover={{ background: 'rgba(11,158,135,0.05)' }}
                                        onClick={doSearch}
                                        style={{
                                            padding: '11px 16px', textAlign: 'center', cursor: 'pointer',
                                            fontSize: '0.8125rem', color: 'var(--accent-dark)',
                                            fontWeight: 600, borderTop: '1px solid var(--border)',
                                        }}
                                    >
                                        See all results for "{query}" →
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Quick search chips */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '680px' }}
                    >
                        {QUICK_SEARCHES.map((qs, i) => (
                            <motion.button
                                key={qs.label}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.36 + i * 0.03 }}
                                whileHover={{ y: -2, boxShadow: '0 6px 16px rgba(11,158,135,0.14)', borderColor: 'rgba(11,158,135,0.4)', scale: 1.02 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => { setQuery(qs.label); navigate(`/patient/search?q=${encodeURIComponent(qs.label)}`); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    padding: '8px 14px',
                                    background: 'rgba(255,255,255,0.85)',
                                    backdropFilter: 'blur(8px)',
                                    border: '1.5px solid var(--border)',
                                    borderRadius: '20px', fontSize: '0.8125rem',
                                    color: 'var(--text-secondary)', fontWeight: 500,
                                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                    transition: 'border-color 0.15s, color 0.15s',
                                }}
                            >
                                <span style={{ fontSize: '0.9rem' }}>{qs.icon}</span>
                                {qs.label}
                            </motion.button>
                        ))}
                    </motion.div>
                </section>

                {/* ── STATS STRIP ───────────────────────────────── */}
                <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 28px 64px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        style={{
                            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px',
                        }}
                    >
                        {STATS.map((s, i) => (
                            <motion.div
                                key={s.label}
                                whileHover={{ y: -5, boxShadow: `0 16px 36px ${s.color}20` }}
                                style={{
                                    background: 'rgba(255,255,255,0.85)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(214,238,234,0.7)',
                                    borderRadius: '18px', padding: '22px 16px',
                                    textAlign: 'center', cursor: 'default',
                                    transition: 'box-shadow 0.25s, transform 0.25s',
                                    position: 'relative', overflow: 'hidden',
                                }}
                            >
                                {/* Accent corner glow */}
                                <div style={{
                                    position: 'absolute', top: -20, right: -20,
                                    width: 70, height: 70, borderRadius: '50%',
                                    background: `${s.color}18`,
                                }} />
                                <p style={{ fontSize: '1.75rem', marginBottom: '8px' }}>{s.icon}</p>
                                <p style={{
                                    fontSize: '1.875rem', fontWeight: 900,
                                    letterSpacing: '-0.04em',
                                    background: `linear-gradient(135deg, ${s.color}, ${s.color}aa)`,
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                    marginBottom: '4px',
                                }}>
                                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.03em' }}>{s.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* ── ACTION CARDS ──────────────────────────────── */}
                <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 28px 64px' }}>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '18px' }}
                    >
                        What do you need today?
                    </motion.p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
                        {ACTIONS.map((card, i) => (
                            <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.52 + i * 0.08 }}
                                    whileHover={{ y: -6, boxShadow: `0 20px 48px ${card.glow}` }}
                                    style={{
                                        background: 'rgba(255,255,255,0.9)',
                                        backdropFilter: 'blur(12px)',
                                        border: '1.5px solid rgba(214,238,234,0.7)',
                                        borderRadius: '20px', padding: '26px',
                                        cursor: 'pointer', position: 'relative', overflow: 'hidden',
                                        transition: 'box-shadow 0.3s, transform 0.3s, border-color 0.2s',
                                        height: '100%',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = card.glow.replace('0.', '0.5')}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(214,238,234,0.7)'}
                                >
                                    {/* Corner gradient */}
                                    <div style={{
                                        position: 'absolute', top: 0, right: 0,
                                        width: 120, height: 120,
                                        background: `radial-gradient(circle at top right, ${card.glow}, transparent 70%)`,
                                        borderRadius: '0 20px 0 0',
                                    }} />

                                    {/* Tag */}
                                    {card.tag && (
                                        <div style={{
                                            position: 'absolute', top: '14px', right: '14px',
                                            padding: '3px 10px', borderRadius: '10px',
                                            background: card.gradient, color: 'white',
                                            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em',
                                        }}>
                                            {card.tag}
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <motion.div
                                        whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                                        transition={{ duration: 0.4 }}
                                        style={{
                                            width: 52, height: 52, borderRadius: '14px',
                                            background: card.gradient,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem', marginBottom: '16px',
                                            boxShadow: `0 4px 16px ${card.glow}`,
                                        }}
                                    >
                                        {card.icon}
                                    </motion.div>

                                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                                        {card.title}
                                    </h3>
                                    <p style={{ fontSize: '0.8375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        {card.desc}
                                    </p>

                                    {/* Arrow */}
                                    <div style={{
                                        marginTop: '18px', display: 'flex', alignItems: 'center', gap: '6px',
                                        fontSize: '0.8125rem', fontWeight: 700,
                                        background: card.gradient,
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                    }}>
                                        Explore <span style={{ fontSize: '1rem' }}>→</span>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ── TRUST STRIP ───────────────────────────────── */}
                <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 28px 80px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        style={{
                            background: 'rgba(255,255,255,0.75)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(214,238,234,0.8)',
                            borderRadius: '18px', padding: '20px 32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: '16px',
                        }}
                    >
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Trusted & Certified
                        </p>
                        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {TRUST.map(t => (
                                <motion.div
                                    key={t.label}
                                    whileHover={{ scale: 1.05 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}
                                >
                                    <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </section>
                {/* ── HOW IT WORKS ──────────────────────────────── */}
                <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 28px 80px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                            How QueueEase Works
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Your journey to better health, simplified.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', position: 'relative' }}>
                        {/* Connecting line */}
                        <div style={{ position: 'absolute', top: '40px', left: '15%', right: '15%', height: '2px', background: 'var(--border)', zIndex: 0 }} />

                        {[
                            { step: '1', title: 'Find', desc: 'Search for the right doctor or hospital quickly.', icon: '🔍' },
                            { step: '2', title: 'Book', desc: 'Secure a live token and skip the waiting room.', icon: '🎟️' },
                            { step: '3', title: 'Consult', desc: 'Meet your doctor exactly when it\'s your turn.', icon: '👨‍⚕️' }
                        ].map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                                style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                                <div style={{
                                    width: 80, height: 80, margin: '0 auto 20px', borderRadius: '50%',
                                    background: 'var(--bg-card)', border: '2px solid var(--accent)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2rem', boxShadow: '0 8px 24px rgba(11,158,135,0.15)'
                                }}>
                                    {s.icon}
                                </div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{s.title}</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── HEALTH ARTICLES ────────────────────────────── */}
                <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 28px 100px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                            Latest Health Insights
                        </h2>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}>View all →</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        {[
                            { title: 'Understanding Seasonal Allergies', readTime: '4 min read', category: 'Wellness', bg: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' },
                            { title: 'Heart Health: Daily Habits that Matter', readTime: '6 min read', category: 'Cardiology', bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' },
                        ].map((art, i) => (
                            <motion.div key={i} whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                                style={{
                                    position: 'relative', overflow: 'hidden', borderRadius: '20px',
                                    padding: '30px 24px', cursor: 'pointer', border: '1px solid var(--border)',
                                    background: 'var(--bg-card)', transition: 'all 0.3s'
                                }}>
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: art.bg, opacity: 0.6, filter: 'blur(30px)' }} />
                                <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'var(--accent-bg)', color: 'var(--accent-dark)', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '16px' }}>{art.category}</span>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.4, position: 'relative', zIndex: 1 }}>{art.title}</h3>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>⏱️ {art.readTime}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Global keyframes */}
            <style>{`
                @keyframes gradientShift {
                    0%,100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes pulse {
                    0%,100% { opacity:1; transform:scale(1); }
                    50% { opacity:0.5; transform:scale(0.85); }
                }
            `}</style>
        </div>
    );
}
