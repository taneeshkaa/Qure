import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import SparkleCanvas from '../components/SparkleCanvas';


/* ── prefers-reduced-motion ──────────────────────────────── */
const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fade = (delay = 0) => reduced ? {} : { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } };

/* ── Count-up hook ───────────────────────────────────────── */
function useCountUp(target, inView) {
    const [val, setVal] = useState('0');
    useEffect(() => {
        if (!inView || reduced) { setVal(target); return; }
        const num = parseFloat(target.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) { setVal(target); return; }
        const suffix = target.replace(/[0-9.]/g, '');
        let start = 0; const steps = 40; const step = num / steps;
        const timer = setInterval(() => {
            start += step;
            if (start >= num) { setVal(target); clearInterval(timer); }
            else setVal(Math.round(start) + suffix);
        }, 32);
        return () => clearInterval(timer);
    }, [inView, target]);
    return val;
}

/* ── Data ─────────────────────────────────────────────────── */
const hospitals = ['Apollo Hospitals', 'Fortis Healthcare', 'AIIMS Delhi', 'Max Hospital', 'Manipal Hospitals', 'Kokilaben Hospital', 'Medanta', 'Narayana Health', 'KIMS Hospital', 'Lilavati Hospital', 'Breach Candy Hospital', 'Wockhardt'];
const doctors = [
    { name: 'Dr. Priya Mehta', specialty: 'Cardiologist', hospital: 'Apollo Mumbai', exp: '14 yrs', patients: '4,200+', rating: 4.9, avatar: 'PM' },
    { name: 'Dr. Rahul Sharma', specialty: 'Neurologist', hospital: 'AIIMS Delhi', exp: '19 yrs', patients: '6,100+', rating: 4.8, avatar: 'RS' },
    { name: 'Dr. Sneha Iyer', specialty: 'Pediatrician', hospital: 'Fortis Bangalore', exp: '11 yrs', patients: '3,500+', rating: 5.0, avatar: 'SI' },
    { name: 'Dr. Arjun Pillai', specialty: 'Orthopedist', hospital: 'Medanta Gurugram', exp: '16 yrs', patients: '5,800+', rating: 4.9, avatar: 'AP' },
];
const testimonials = [
    { name: 'Anjali Verma', role: 'Patient, Mumbai', quote: 'I used to spend 3 hours just waiting at the hospital. With Qure, I book a token from home, arrive just-in-time, and I\'m done in 40 minutes.', rating: 5, avatar: 'AV', tag: 'Patient' },
    { name: 'Dr. Ramesh Gupta', role: 'HOD, Apollo Delhi', quote: 'Our OPD chaos has reduced dramatically. The digital prescription flow saves our doctors 20 minutes per patient. Qure is a game changer.', rating: 5, avatar: 'RG', tag: 'Hospital' },
    { name: 'Preethi Nair', role: 'Patient, Bangalore', quote: 'The emergency contact feature and my medical card on the app saved my life when I had an allergic reaction. The doctor already knew my history.', rating: 5, avatar: 'PN', tag: 'Patient' },
    { name: 'Mr. Sanjay Khanna', role: 'Admin, Fortis Noida', quote: 'Registration took under 5 minutes. Our entire hospital was live on Qure in a day. The analytics dashboard is surprisingly powerful.', rating: 5, avatar: 'SK', tag: 'Hospital' },
    { name: 'Meera Pillai', role: 'Patient, Chennai', quote: 'My daughter\'s prescription was ready at the chemist before we even reached! The pharmacist scanned the QR code and everything was sorted.', rating: 5, avatar: 'MP', tag: 'Patient' },
    { name: 'Dr. Kavitha Rao', role: 'Dermatologist, Hyderabad', quote: 'My patients love getting SMS updates when they\'re next in queue. I love that I can see their full history before they even walk in.', rating: 5, avatar: 'KR', tag: 'Doctor' },
];
const howItWorks = [
    { num: '01', title: 'Hospital registers on Qure', desc: 'Takes under 5 minutes. Add your doctors, departments, and working hours. You\'re live immediately.', icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m7-11v6m-3-3h6" /></svg> },
    { num: '02', title: 'Patient books a slot', desc: 'Patients search for your hospital or doctor, choose a time, and get a digital token instantly.', icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    { num: '03', title: 'Doctor sees you on time', desc: 'No more crowded waiting rooms. Patients arrive at their token time. Doctors run no overtime.', icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { num: '04', title: 'Prescription goes digital', desc: 'Doctor taps "Send prescription". Chemist receives it in seconds. Patient picks up with a QR scan.', icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
];
const features = [
    { icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, title: 'Smart Token System', desc: 'Digital queue tokens issued in real time. Patients know exactly when to arrive — no more crowded waiting rooms.' },
    { icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, title: 'Digital Prescriptions', desc: 'Doctors write prescriptions digitally. Chemists receive them instantly with an anti-fraud verification flow.' },
    { icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, title: 'Live Queue Tracking', desc: 'Real-time patient queue position on any device. Get SMS alerts when you\'re next — no app download needed.' },
    { icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, title: 'Hospital Analytics', desc: 'See patient flow, peak hours, and doctor performance at a glance. Data-driven decisions for better care.' },
    { icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>, title: 'Patient Profiles', desc: 'Medical history, allergies, and emergency contacts — securely stored and accessible to authorized doctors.' },
    { icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>, title: 'Works on Any Device', desc: 'Desktop, mobile, tablet — Qure is fully responsive. Hospitals manage on desktop; patients use their phone.' },
];
const stats = [
    { value: '10k+', label: 'Patient Records' },
    { value: '500+', label: 'Hospitals' },
    { value: '99.9%', label: 'Uptime' },
    { value: '<1s', label: 'Avg Load Time' },
];

/* ── Helpers ─────────────────────────────────────────────── */
function StarRating({ rating }) {
    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= rating ? '#f59e0b' : '#e5e7eb'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
}
function Avatar({ initials, size = 44 }) {
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(11,158,135,0.15),rgba(52,217,190,0.15))', color: 'var(--accent-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 700, flexShrink: 0, border: '1.5px solid rgba(11,158,135,0.2)' }}>
            {initials}
        </div>
    );
}

/* ── Navbar ──────────────────────────────────────────────── */
function NavLink({ to, label, isActive }) {
    const [hovered, setHovered] = useState(false);
    return (
        <Link
            to={to}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                padding: '5px 13px', borderRadius: '20px', position: 'relative',
                color: isActive ? 'var(--accent-dark)' : hovered ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(11,158,135,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(11,158,135,0.22)' : '1px solid transparent',
                transition: 'color 0.2s, background 0.2s, border-color 0.2s',
                display: 'inline-block',
            }}
        >
            {label}
            {/* Slide-in underline from left */}
            <span style={{
                position: 'absolute', bottom: '2px', left: '13px', right: '13px',
                height: '1.5px', borderRadius: '2px',
                background: 'var(--accent)',
                transformOrigin: 'left',
                transform: (hovered && !isActive) ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                pointerEvents: 'none',
            }} />
        </Link>
    );
}

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const lastY = useRef(0);
    const location = useLocation();

    useEffect(() => {
        const fn = () => {
            const y = window.scrollY;
            setScrolled(y > 12);
            // Hide on scroll down, instantly reappear on scroll up
            if (y > lastY.current && y > 80) {
                setHidden(true);
            } else if (y < lastY.current) {
                setHidden(false);
            }
            lastY.current = y;
        };
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const navLinks = [
        { label: 'Hospitals', to: '/hospitals' },
        { label: 'Doctors', to: '/doctors' },
        { label: 'How it works', to: '/how-it-works' },
        { label: 'About', to: '/register' },
    ];

    return (
        <motion.nav
            animate={{ y: hidden ? -80 : 0 }}
            transition={{
                duration: hidden ? 0.35 : 0.18,
                ease: hidden ? [0.4, 0, 0.2, 1] : [0.22, 1, 0.36, 1],
            }}
            style={{
                position: 'sticky', top: 0, left: 0, right: 0, zIndex: 50,
                background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(22px) saturate(180%)',
                WebkitBackdropFilter: 'blur(22px) saturate(180%)',
                borderBottom: scrolled ? '1px solid rgba(11,158,135,0.13)' : '1px solid rgba(11,158,135,0.08)',
                boxShadow: scrolled ? '0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 24px rgba(11,120,100,0.08)' : '0 1px 0 rgba(255,255,255,0.5) inset',
                padding: '0 32px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
            }}
        >
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
                <div className="logo-mark">
                    <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" /></svg>
                </div>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Qure</span>
                {/* Teal BETA badge — intentional, not grey */}
                <motion.span
                    animate={{ boxShadow: ['0 0 0 0 rgba(11,158,135,0)', '0 0 0 5px rgba(11,158,135,0.18)', '0 0 0 0 rgba(11,158,135,0)'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        padding: '2px 8px',
                        background: 'linear-gradient(135deg, rgba(11,158,135,0.18) 0%, rgba(52,217,190,0.14) 100%)',
                        border: '1px solid rgba(11,158,135,0.35)',
                        borderRadius: '20px',
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        color: 'var(--accent-dark)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}
                >BETA</motion.span>
            </Link>

            {/* Nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {navLinks.map(link => (
                    <NavLink
                        key={link.label}
                        to={link.to}
                        label={link.label}
                        isActive={location.pathname === link.to}
                    />
                ))}
            </div>

            {/* CTA area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                {/* Sign in — ghost button with hover border reveal */}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                    <button
                        className="navbar-ghost-btn"
                        style={{
                            padding: '7px 18px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            background: 'transparent',
                            border: '1.5px solid transparent',
                            borderRadius: '10px',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontFamily: 'Inter,sans-serif',
                            transition: 'border-color 0.2s ease, color 0.2s ease, background 0.2s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(11,158,135,0.4)';
                            e.currentTarget.style.color = 'var(--accent)';
                            e.currentTarget.style.background = 'rgba(11,158,135,0.05)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >Sign in</button>
                </Link>

                {/* Get started — shimmer sweep + scale + teal glow */}
                <Link to="/register" style={{ textDecoration: 'none' }}>
                    <button
                        style={{
                            padding: '8px 20px',
                            background: 'linear-gradient(135deg,#0b9e87,#0ab29a)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            fontFamily: 'Inter,sans-serif',
                            boxShadow: '0 3px 14px rgba(11,158,135,0.32)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'box-shadow 0.25s ease, transform 0.2s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(11,158,135,0.5), 0 0 0 3px rgba(11,158,135,0.15)';
                            e.currentTarget.style.transform = 'scale(1.045) translateY(-1px)';
                            const s = e.currentTarget.querySelector('.nav-shimmer');
                            if (s) { s.style.left = '160%'; s.style.transition = 'left 0.5s ease'; }
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = '0 3px 14px rgba(11,158,135,0.32)';
                            e.currentTarget.style.transform = '';
                            const s = e.currentTarget.querySelector('.nav-shimmer');
                            if (s) { s.style.transition = 'none'; s.style.left = '-100%'; }
                        }}
                    >
                        <span className="nav-shimmer" style={{
                            position: 'absolute', top: 0, left: '-100%',
                            width: '60%', height: '100%',
                            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)',
                            transform: 'skewX(-20deg)',
                            pointerEvents: 'none',
                        }} />
                        Get started →
                    </button>
                </Link>
            </div>
        </motion.nav>
    );
}

/* ── Hero Section ────────────────────────────────────────── */
const HERO_STATS = [
    { value: '10k+', label: 'Patient Records' },
    { value: '500+', label: 'Hospitals' },
    { value: '99.9%', label: 'Uptime' },
    { value: '<1s', label: 'Avg Load Time' },
];

function HeroStatItem({ value, label, last }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const displayed = useCountUp(value, inView);
    return (
        <div ref={ref} style={{
            textAlign: 'left',
            paddingRight: last ? 0 : '28px',
            marginRight: last ? 0 : '28px',
            borderRight: last ? 'none' : '1px solid rgba(255,255,255,0.2)',
        }}>
            <p style={{ fontSize: 'clamp(1.25rem,2vw,1.625rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{displayed}</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '3px', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</p>
        </div>
    );
}

function HeroSection() {
    return (
        <section style={{
            padding: '30px 30px 30px',   /* 30px gap on all sides */
            position: 'relative',
            zIndex: 2,
        }}>
            {/* Outer wrapper — rounded corners + shadow */}
            <div style={{
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
                position: 'relative',
                height: 'calc(100vh - 62px - 60px)',   /* viewport minus navbar minus top+bottom margin */
                minHeight: '560px',
            }}>
                {/* Ken Burns image */}
                <motion.div
                    initial={reduced ? {} : { scale: 1.08 }}
                    animate={{ scale: 1.0 }}
                    transition={{ duration: 16, ease: 'linear' }}
                    style={{
                        position: 'absolute', inset: '-4%',
                        backgroundImage: 'url(https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1400)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 30%',
                        willChange: 'transform',
                        filter: 'blur(2.5px)',
                    }}
                />

                {/* Gradient overlays — left dark band + bottom vignette */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, rgba(5,18,14,0.88) 0%, rgba(5,18,14,0.6) 45%, rgba(5,18,14,0.15) 70%, transparent 100%)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(0deg, rgba(5,18,14,0.75) 0%, rgba(5,18,14,0.2) 35%, transparent 60%)',
                    pointerEvents: 'none',
                }} />

                {/* ── Content — bottom left ── */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '48px 52px',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    gap: '0',
                }}>
                    {/* Top badge */}
                    <motion.div
                        initial={reduced ? {} : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            padding: '5px 13px',
                            background: 'rgba(11,158,135,0.25)',
                            border: '1px solid rgba(11,209,180,0.4)',
                            borderRadius: '20px',
                            marginBottom: '18px',
                        }}
                    >
                        <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d9be', flexShrink: 0, display: 'inline-block' }}
                        />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.01em' }}>Now in Beta · Join 500+ hospitals on Qure</span>
                    </motion.div>

                    {/* Headline */}
                    <h1 style={{
                        fontSize: 'clamp(2.25rem,4.5vw,3.75rem)',
                        fontWeight: 800,
                        letterSpacing: '-0.04em',
                        lineHeight: 1.07,
                        color: '#ffffff',
                        marginBottom: '16px',
                        maxWidth: '680px',
                    }}>
                        <motion.span
                            initial={reduced ? {} : { opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            style={{ display: 'block' }}
                        >Healthcare management,</motion.span>
                        <motion.span
                            initial={reduced ? {} : { opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
                            style={{ display: 'block', background: 'linear-gradient(90deg,#34d9be,#7ef7e4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                        >simplified for India.</motion.span>
                    </h1>

                    {/* Subtext */}
                    <motion.p
                        initial={reduced ? {} : { opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            fontSize: '1.0625rem', color: 'rgba(255,255,255,0.7)',
                            lineHeight: 1.72, maxWidth: '500px', marginBottom: '28px',
                        }}
                    >
                        Qure connects hospitals, doctors, patients, and pharmacies in one intelligent platform — cutting wait times, digitising prescriptions, and putting healthcare data where it belongs.
                    </motion.p>

                    {/* CTA button */}
                    <motion.div
                        initial={reduced ? {} : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.56, ease: [0.22, 1, 0.36, 1] }}
                        style={{ marginBottom: '36px' }}
                    >
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.04, y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '9px',
                                    padding: '14px 28px',
                                    background: '#ffffff',
                                    color: '#0b1a17',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontFamily: 'Inter,sans-serif',
                                    boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                Get started free
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Inline stats */}
                    <motion.div
                        initial={reduced ? {} : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0' }}
                    >
                        {HERO_STATS.map((s, i) => (
                            <HeroStatItem key={s.label} {...s} last={i === HERO_STATS.length - 1} />
                        ))}
                    </motion.div>
                </div>

                {/* ── Glassmorphic pill — bottom right ── */}
                <motion.div
                    initial={reduced ? {} : { opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.55, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        position: 'absolute', bottom: '44px', right: '44px',
                        background: 'rgba(255,255,255,0.14)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.28)',
                        borderRadius: '18px',
                        padding: '16px 20px',
                        display: 'flex', flexDirection: 'column', gap: '8px',
                        minWidth: '210px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Mini hospital icon avatars */}
                        {['A', 'F', 'M'].map((initial, idx) => (
                            <div key={idx} style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: `linear-gradient(135deg, ${['#0b9e87', '#12b89e', '#34d9be'][idx]}, ${['#34d9be', '#0b9e87', '#12b89e'][idx]})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.6875rem', fontWeight: 800, color: 'white',
                                border: '2px solid rgba(255,255,255,0.3)',
                                marginLeft: idx > 0 ? '-8px' : 0,
                                flexShrink: 0,
                                position: 'relative', zIndex: 3 - idx,
                            }}>{initial}</div>
                        ))}
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff', marginLeft: '4px' }}>500+ Verified</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>Hospitals on Qure</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ── Word-by-word headline ───────────────────────────────── */
function WordReveal({ text, className, style, delay = 0 }) {
    const words = text.split(' ');
    return (
        <span className={className} style={{ ...style, display: 'inline' }}>
            {words.map((w, i) => (
                <motion.span key={i} initial={reduced ? {} : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }} style={{ display: 'inline-block', marginRight: i < words.length - 1 ? '0.28em' : 0 }}>{w}</motion.span>
            ))}
        </span>
    );
}

/* ── Single-row marquee with fade edges ──────────────────── */
function Marquee({ items }) {
    const [paused, setPaused] = useState(false);
    const doubled = [...items, ...items];
    return (
        <div style={{ position: 'relative', overflow: 'hidden', width: '100%' }}
            onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {/* Fade masks */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '120px', background: 'linear-gradient(90deg,white,transparent)', zIndex: 2, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', background: 'linear-gradient(270deg,white,transparent)', zIndex: 2, pointerEvents: 'none' }} />
            <motion.div
                animate={{ x: paused ? undefined : ['0%', '-50%'] }}
                transition={{ duration: 32, ease: 'linear', repeat: Infinity }}
                style={{ display: 'flex', width: 'max-content', willChange: 'transform' }}
            >
                {doubled.map((item, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.06 }} transition={{ duration: 0.2 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 36px', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap', flexShrink: 0, cursor: 'default' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', opacity: 0.65 }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item}</span>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

/* ── Stat item with count-up ─────────────────────────────── */
function StatItem({ value, label, last }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const displayed = useCountUp(value, inView);
    return (
        <div ref={ref} style={{ padding: '20px 32px', textAlign: 'center', borderRight: last ? 'none' : '1px solid rgba(11,158,135,0.14)', flex: 1 }}>
            <p style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.04em', background: 'linear-gradient(135deg,#0b9e87,#34d9be)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{displayed}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>{label}</p>
        </div>
    );
}

/* ── Section helpers ─────────────────────────────────────── */
function Section({ children, style = {} }) {
    return <section style={{ padding: '88px 24px', maxWidth: '1100px', margin: '0 auto', ...style }}>{children}</section>;
}
function SectionHeader({ badge, title, subtitle }) {
    return (
        <motion.div {...fade()} style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '16px' }}>{badge}</div>
            <h2 style={{ fontSize: 'clamp(1.75rem,3vw,2.25rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '12px' }}>{title}</h2>
            {subtitle && <p className="t-body" style={{ maxWidth: '480px', margin: '0 auto' }}>{subtitle}</p>}
        </motion.div>
    );
}

/* ── Feature card with glass hover ──────────────────────── */
function FeatureCard({ f, i }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div {...fade(i * 0.08)}
            onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
            whileHover={{ y: -5 }}
            style={{ background: hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)', border: `1.5px solid ${hovered ? 'rgba(11,158,135,0.35)' : 'rgba(11,158,135,0.14)'}`, borderRadius: '18px', padding: '26px', backdropFilter: 'blur(16px)', boxShadow: hovered ? '0 12px 40px rgba(11,158,135,0.14), 0 0 0 1px rgba(11,158,135,0.1)' : '0 2px 12px rgba(11,120,100,0.06)', transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s', cursor: 'default' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: hovered ? 'linear-gradient(135deg,rgba(11,158,135,0.15),rgba(52,217,190,0.12))' : 'rgba(11,158,135,0.08)', border: '1px solid rgba(11,158,135,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '14px', transition: 'background 0.2s' }}>{f.icon}</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '7px' }}>{f.title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
        </motion.div>
    );
}

/* ── Doctor card ─────────────────────────────────────────── */
function DoctorCard({ doc, i }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div {...fade(i * 0.1)} onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
            whileHover={{ y: -6 }}
            style={{ background: 'rgba(255,255,255,0.88)', border: `1.5px solid ${hovered ? 'rgba(11,158,135,0.32)' : 'rgba(11,158,135,0.14)'}`, borderRadius: '18px', padding: '22px', backdropFilter: 'blur(14px)', boxShadow: hovered ? '0 16px 48px rgba(11,158,135,0.15)' : '0 2px 12px rgba(11,120,100,0.06)', transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ position: 'relative' }}>
                    <motion.div animate={hovered ? { boxShadow: '0 0 0 3px rgba(11,158,135,0.3)' } : { boxShadow: '0 0 0 0px rgba(11,158,135,0)' }} transition={{ duration: 0.25 }} style={{ borderRadius: '50%' }}>
                        <Avatar initials={doc.avatar} size={48} />
                    </motion.div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(11,158,135,0.08)', border: '1px solid rgba(11,158,135,0.2)', borderRadius: '20px', padding: '3px 8px' }}>
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent-dark)' }}>Verified</span>
                </div>
            </div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{doc.name}</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 500, marginBottom: '4px' }}>{doc.specialty}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>{doc.hospital}</p>
            <div style={{ height: '1px', background: 'rgba(11,158,135,0.1)', marginBottom: '14px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ textAlign: 'center' }}><p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{doc.exp}</p><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Experience</p></div>
                <div style={{ textAlign: 'center' }}><p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{doc.patients}</p><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Patients</p></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StarRating rating={doc.rating} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{doc.rating}</span>
            </div>
        </motion.div>
    );
}

/* ── Testimonial carousel ────────────────────────────────── */
const tagColors = {
    Patient: { bg: 'rgba(11,158,135,0.09)', color: 'var(--accent-dark)', border: 'rgba(11,158,135,0.22)' },
    Hospital: { bg: 'rgba(245,158,11,0.09)', color: '#b45309', border: 'rgba(245,158,11,0.22)' },
    Doctor: { bg: 'rgba(99,102,241,0.09)', color: '#4338ca', border: 'rgba(99,102,241,0.22)' },
};
function TestimonialCarousel() {
    const [paused, setPaused] = useState(false);
    const doubled = [...testimonials, ...testimonials];
    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}
            onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(90deg,white,transparent)', zIndex: 2, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(270deg,white,transparent)', zIndex: 2, pointerEvents: 'none' }} />
            <motion.div
                animate={paused ? undefined : { x: ['0%', '-50%'] }}
                transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
                style={{ display: 'flex', gap: '18px', width: 'max-content', alignItems: 'stretch', padding: '12px 0' }}
            >
                {doubled.map((t, i) => {
                    const tc = tagColors[t.tag] || tagColors.Patient;
                    return (
                        <div key={i} style={{ width: '320px', flexShrink: 0, background: 'rgba(255,255,255,0.82)', border: '1.5px solid rgba(11,158,135,0.12)', borderRadius: '18px', padding: '22px', backdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(11,120,100,0.07)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <StarRating rating={t.rating} />
                                <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{t.tag}</span>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1, fontStyle: 'italic' }}>"{t.quote}"</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Avatar initials={t.avatar} size={36} />
                                <div><p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</p><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.role}</p></div>
                            </div>
                        </div>
                    );
                })}
            </motion.div>
        </div>
    );
}

/* ── How it works step ───────────────────────────────────── */
function HowStep({ step, i, total }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <div ref={ref} style={{ display: 'flex', alignItems: 'center', flex: i < total - 1 ? 1 : 'none' }}>
            <motion.div style={{ textAlign: 'center', flex: 1 }} initial={reduced ? {} : { opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}>
                <motion.div
                    animate={inView ? { boxShadow: ['0 0 0 0 rgba(11,158,135,0.3)', '0 0 0 10px rgba(11,158,135,0)', '0 0 0 0 rgba(11,158,135,0)'] } : {}}
                    transition={{ delay: i * 0.12 + 0.4, duration: 1.2, ease: 'easeOut' }}
                    style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(255,255,255,0.95),rgba(240,250,248,0.9))', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent)', backdropFilter: 'blur(8px)', boxShadow: '0 0 0 6px rgba(11,158,135,0.08)' }}>
                    {step.icon}
                </motion.div>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: '6px' }}>{step.num}</p>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{step.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
            </motion.div>
            {i < total - 1 && (
                <div style={{ flex: 1, height: '2px', background: 'rgba(11,158,135,0.12)', margin: '0 8px', position: 'relative', overflow: 'hidden', marginBottom: '70px', borderRadius: '2px' }}>
                    <motion.div
                        initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
                        transition={{ delay: i * 0.12 + 0.3, duration: 0.6, ease: 'easeInOut' }}
                        style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#0b9e87,#34d9be)', transformOrigin: 'left', borderRadius: '2px' }}
                    />
                </div>
            )}
        </div>
    );
}

/* ── MAIN ─────────────────────────────────────────────────── */
export default function LandingPage() {
    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2 }}>
            <SparkleCanvas />
            <Navbar />

            {/* ── HERO ─────────────────────────────────────────── */}
            <HeroSection />

            {/* ── MARQUEE ───────────────────────────────────────── */}
            <div style={{ background: 'white', borderTop: '1px solid rgba(11,158,135,0.1)', borderBottom: '1px solid rgba(11,158,135,0.1)', padding: '8px 0 0', position: 'relative', zIndex: 2 }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', padding: '12px 0 10px' }}>Trusted by India's leading hospitals</p>
                <Marquee items={hospitals} />
                <div style={{ height: '8px' }} />
            </div>

            {/* ── HOW IT WORKS ──────────────────────────────────── */}
            <Section>
                <SectionHeader badge="Simple to start" title="From sign-up to live in 5 minutes" subtitle="No IT team needed. No long onboarding. Qure is ready when you are." />
                <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                    {howItWorks.map((step, i) => <HowStep key={step.num} step={step} i={i} total={howItWorks.length} />)}
                </div>
            </Section>

            {/* ── FEATURES ──────────────────────────────────────── */}
            <div style={{ background: 'linear-gradient(180deg,rgba(240,250,248,0.6),white)', borderTop: '1px solid rgba(11,158,135,0.1)', padding: '88px 24px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <SectionHeader badge="Everything you need" title="Built for the whole ecosystem" subtitle="From hospital admins to patients, every stakeholder gets exactly what they need." />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {features.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
                    </div>
                </div>
            </div>

            {/* ── DOCTORS ───────────────────────────────────────── */}
            <Section>
                <SectionHeader badge="✓ Verified Doctors" title="Top-rated doctors, already on Qure" subtitle="Every doctor on Qure is hospital-verified. Patients see credentials, experience, and live ratings." />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {doctors.map((doc, i) => <DoctorCard key={doc.name} doc={doc} i={i} />)}
                </div>
                <motion.div {...fade(0.2)} style={{ textAlign: 'center', marginTop: '32px' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>…and 2,400+ more verified doctors across India</p>
                </motion.div>
            </Section>

            {/* ── TESTIMONIALS ──────────────────────────────────── */}
            <div style={{ background: 'white', borderTop: '1px solid rgba(11,158,135,0.1)', padding: '88px 0' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
                    <SectionHeader badge="❤️ Real stories" title="What our users say" subtitle="From patients to hospital admins — hear how Qure changed their healthcare experience." />
                </div>
                <TestimonialCarousel />
            </div>

            {/* ── CTA ───────────────────────────────────────────── */}
            <Section style={{ padding: '60px 24px 88px', position: 'relative' }}>
                {/* Radial teal glow behind */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
                    <div style={{ width: '600px', height: '400px', background: 'radial-gradient(ellipse,rgba(11,158,135,0.1) 0%,transparent 70%)', borderRadius: '50%' }} />
                </div>
                <motion.div {...fade()} style={{ position: 'relative', zIndex: 1, padding: '56px 48px', textAlign: 'center', background: 'rgba(255,255,255,0.82)', border: '1.5px solid rgba(11,158,135,0.22)', borderRadius: '24px', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', boxShadow: '0 8px 48px rgba(11,120,100,0.12), inset 0 1px 0 rgba(255,255,255,0.95)', maxWidth: '680px', margin: '0 auto' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg,#0b9e87,#34d9be)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(11,158,135,0.42)' }}>
                        <svg width="26" height="26" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" /></svg>
                    </div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.035em', marginBottom: '10px', color: 'var(--text-primary)' }}>Ready to modernise your hospital?</h2>
                    <p className="t-body" style={{ marginBottom: '32px' }}>Join hundreds of healthcare providers already using Qure. Setup takes under 5 minutes.</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.975 }}
                                style={{ padding: '13px 30px', background: 'linear-gradient(135deg,#0b9e87,#0ab29a)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif', boxShadow: '0 6px 20px rgba(11,158,135,0.38)', position: 'relative', overflow: 'hidden' }}>
                                Register now →
                            </motion.button>
                        </Link>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.975 }} className="btn-secondary" style={{ padding: '13px 28px', fontSize: '1rem', width: 'auto' }}>Sign in</motion.button>
                        </Link>
                    </div>
                </motion.div>
            </Section>

            {/* ── FOOTER ────────────────────────────────────────── */}
            <footer style={{ borderTop: '1px solid rgba(11,158,135,0.1)', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="logo-mark" style={{ width: '28px', height: '28px', borderRadius: '8px' }}><svg width="15" height="15" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" /></svg></div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Qure</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>© 2026 · All rights reserved</span>
                </div>
                <div style={{ display: 'flex', gap: '24px' }}>
                    {['Privacy', 'Terms', 'Contact'].map(link => (
                        <a key={link} href="#" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                            onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>{link}</a>
                    ))}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>HIPAA-aligned · Made in India 🇮🇳</p>
            </footer>
        </div>
    );
}
