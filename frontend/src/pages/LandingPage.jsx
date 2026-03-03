import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SparkleCanvas from '../components/SparkleCanvas';

/* ── Animated hero blobs ──────────────────────────────────── */
function HeroBlobBg() {
    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(11,158,135,0.1) 0%, transparent 70%)' }} />
            <motion.div animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '10%', right: '-60px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,217,190,0.12) 0%, transparent 70%)' }} />
            <motion.div animate={{ y: [0, 14, 0], scale: [1, 0.94, 1] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }} style={{ position: 'absolute', bottom: '0%', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(11,158,135,0.07) 0%, transparent 70%)' }} />
        </div>
    );
}

/* ── Scrolling marquee for hospital logos ─────────────────── */
function MarqueeBand({ items, reverse = false }) {
    const ref = useRef(null);
    return (
        <div style={{ overflow: 'hidden', width: '100%' }}>
            <motion.div
                ref={ref}
                animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
                transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
                style={{ display: 'flex', gap: '0', width: 'max-content' }}
            >
                {[...items, ...items].map((item, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '12px 32px',
                        borderRight: '1px solid var(--border)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                    }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', opacity: 0.7 }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

/* ── Section wrapper ──────────────────────────────────────── */
function Section({ children, style = {} }) {
    return (
        <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto', ...style }}>
            {children}
        </section>
    );
}

function SectionHeader({ badge, title, subtitle }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '56px' }}
        >
            <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '16px' }}>{badge}</div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '12px' }}>
                {title}
            </h2>
            {subtitle && <p className="t-body" style={{ maxWidth: '480px', margin: '0 auto' }}>{subtitle}</p>}
        </motion.div>
    );
}

/* ── Data ─────────────────────────────────────────────────── */
const hospitals = [
    'Apollo Hospitals', 'Fortis Healthcare', 'AIIMS Delhi', 'Max Hospital',
    'Manipal Hospitals', 'Kokilaben Hospital', 'Medanta', 'Narayana Health',
    'KIMS Hospital', 'Lilavati Hospital', 'Breach Candy Hospital', 'Wockhardt',
];

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
    { name: 'Mr. Sanjay Khanna', role: 'Admin, Fortis Noida', quote: 'Registration took under 5 minutes. Our entire hospital was live on Qure in a day. The analytics dashboard is surprisingly powerful for the free tier.', rating: 5, avatar: 'SK', tag: 'Hospital' },
    { name: 'Meera Pillai', role: 'Patient, Chennai', quote: 'My daughter\'s prescription was ready at the chemist before we even reached! The pharmacist scanned the QR code and everything was sorted.', rating: 5, avatar: 'MP', tag: 'Patient' },
    { name: 'Dr. Kavitha Rao', role: 'Dermatologist, Hyderabad', quote: 'My patients love getting SMS updates when they\'re next in queue. I love that I can see their full history before they even walk in.', rating: 5, avatar: 'KR', tag: 'Doctor' },
];

const howItWorks = [
    { num: '01', title: 'Hospital registers on Qure', desc: 'Takes under 5 minutes. Add your doctors, departments, and working hours. You\'re live immediately.', icon: '🏥' },
    { num: '02', title: 'Patient books a slot', desc: 'Patients search for your hospital or doctor, choose a time, and get a digital token instantly.', icon: '📱' },
    { num: '03', title: 'Doctor sees you on time', desc: 'No more crowded waiting rooms. Patients arrive at their token time. Doctors run no overtime.', icon: '👨‍⚕️' },
    { num: '04', title: 'Prescription goes digital', desc: 'Doctor taps "Send prescription". Chemist receives it in seconds. Patient picks up with a QR scan.', icon: '💊' },
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

function StarRating({ rating }) {
    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= rating ? '#f59e0b' : '#e5e7eb'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
}

function Avatar({ initials, size = 44, bg = 'var(--accent-bg)', color = 'var(--accent-dark)' }) {
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 700, flexShrink: 0 }}>
            {initials}
        </div>
    );
}

/* ── Navbar ───────────────────────────────────────────────── */
function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <nav className="navbar" style={{ boxShadow: scrolled ? '0 2px 16px rgba(11,120,100,0.08)' : 'none', transition: 'box-shadow 0.3s' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <div className="logo-mark">
                    <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" /></svg>
                </div>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Qure</span>
                <span style={{ padding: '2px 7px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.25)', borderRadius: '20px', fontSize: '0.625rem', fontWeight: 700, color: 'var(--accent-dark)', letterSpacing: '0.08em' }}>BETA</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[
                    { label: 'Hospitals', to: '/hospitals' },
                    { label: 'Doctors', to: '/doctors' },
                    { label: 'How it works', to: '/how-it-works' },
                    { label: 'About', to: '/register' },
                ].map(link => (
                    <Link key={link.label} to={link.to} style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 14px', borderRadius: '8px', transition: 'color 0.15s, background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-bg)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                    >{link.label}</Link>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/login"><button className="btn-ghost" style={{ padding: '8px 18px', fontSize: '0.875rem', width: 'auto' }}>Sign in</button></Link>
                <Link to="/register">
                    <button style={{ padding: '8px 18px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '9px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s, box-shadow 0.15s' }}
                        onMouseEnter={e => { e.target.style.background = 'var(--accent-dark)'; e.target.style.boxShadow = '0 4px 14px rgba(11,158,135,0.35)'; }}
                        onMouseLeave={e => { e.target.style.background = 'var(--accent)'; e.target.style.boxShadow = 'none'; }}
                    >Get started →</button>
                </Link>
            </div>
        </nav>
    );
}

/* ── MAIN LANDING PAGE ────────────────────────────────────── */
export default function LandingPage() {
    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2 }}>
            <SparkleCanvas />
            <Navbar />

            {/* ── HERO ──────────────────────────────────────────── */}
            <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 60px', position: 'relative', overflow: 'hidden' }}>
                <HeroBlobBg />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                        <div className="hero-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            Now in Beta · Join 500+ hospitals on Qure
                        </div>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '20px', color: 'var(--text-primary)' }}>
                        Healthcare management,<br />
                        <span className="gradient-text">simplified for India.</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="t-body" style={{ fontSize: '1.0625rem', maxWidth: '520px', margin: '0 auto 36px', lineHeight: 1.75 }}>
                        Qure connects hospitals, doctors, patients, and pharmacies in one intelligent platform — cutting wait times, digitising prescriptions, and putting healthcare data where it belongs.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} style={{ padding: '14px 28px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '11px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 18px rgba(11,158,135,0.35)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Get started free
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </motion.button>
                        </Link>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem', width: 'auto' }}>Sign in</motion.button>
                        </Link>
                    </motion.div>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} style={{ marginTop: '28px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        HIPAA-aligned · No credit card required · Free for the first 30 days
                    </motion.p>
                </div>

                {/* Floating stats strip */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }} style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0', marginTop: '64px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(11,120,100,0.08)' }}>
                    {stats.map((s, i) => (
                        <div key={s.label} style={{ padding: '18px 32px', textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent)' }}>{s.value}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>{s.label}</p>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* ── TRUSTED HOSPITALS MARQUEE ─────────────────────── */}
            <div style={{ background: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '0', position: 'relative', zIndex: 2 }}>
                <div style={{ padding: '12px 0 4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Trusted by India's leading hospitals</p>
                </div>
                <MarqueeBand items={hospitals} />
                <MarqueeBand items={[...hospitals].reverse()} reverse />
                <div style={{ padding: '4px 0 12px' }} />
            </div>

            {/* ── HOW IT WORKS ──────────────────────────────────── */}
            <Section>
                <SectionHeader badge="Simple to start" title="From sign-up to live in 5 minutes" subtitle="No IT team needed. No long onboarding. Qure is ready when you are." />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', position: 'relative' }}>
                    {/* connector line */}
                    <div style={{ position: 'absolute', top: '28px', left: '12.5%', right: '12.5%', height: '2px', background: 'linear-gradient(90deg, var(--accent-bg), var(--accent-mid), var(--accent-bg))', zIndex: 0 }} />
                    {howItWorks.map((step, i) => (
                        <motion.div
                            key={step.num}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
                        >
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'white', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', boxShadow: '0 0 0 6px var(--accent-bg)' }}>
                                {step.icon}
                            </div>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: '6px' }}>{step.num}</p>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{step.title}</h3>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* ── FEATURES ──────────────────────────────────────── */}
            <div style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '80px 24px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <SectionHeader badge="Everything you need" title="Built for the whole ecosystem" subtitle="From hospital admins to patients, every stakeholder gets exactly what they need." />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                className="feature-card"
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                            >
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '14px' }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{f.title}</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── VERIFIED DOCTORS ──────────────────────────────── */}
            <Section>
                <SectionHeader badge="✓ Verified Doctors" title="Top-rated doctors, already on Qure" subtitle="Every doctor on Qure is hospital-verified. Patients see credentials, experience, and live ratings." />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {doctors.map((doc, i) => (
                        <motion.div
                            key={doc.name}
                            className="card"
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(11,158,135,0.12)', borderColor: 'rgba(11,158,135,0.35)' }}
                            style={{ padding: '20px', cursor: 'default' }}
                        >
                            {/* Avatar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                <Avatar initials={doc.avatar} size={48} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.2)', borderRadius: '20px', padding: '3px 8px' }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#0b9e87"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent-dark)' }}>Verified</span>
                                </div>
                            </div>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{doc.name}</h3>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 500, marginBottom: '10px' }}>{doc.specialty}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{doc.hospital}</p>
                            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '12px' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{doc.exp}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Experience</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{doc.patients}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Patients</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <StarRating rating={doc.rating} />
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{doc.rating}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginTop: '32px' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>…and 2,400+ more verified doctors across India</p>
                </motion.div>
            </Section>

            {/* ── TESTIMONIALS ──────────────────────────────────── */}
            <div style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '80px 24px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <SectionHeader badge="❤️ Real stories" title="What our users say" subtitle="From patients to hospital admins — hear how Qure changed their healthcare experience." />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={t.name}
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.07 }}
                                whileHover={{ y: -3, boxShadow: '0 10px 32px rgba(11,158,135,0.1)', borderColor: 'rgba(11,158,135,0.3)' }}
                                style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                            >
                                {/* Tag */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <StarRating rating={t.rating} />
                                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: t.tag === 'Patient' ? 'rgba(11,158,135,0.08)' : t.tag === 'Doctor' ? 'rgba(99,102,241,0.08)' : 'rgba(245,158,11,0.08)', color: t.tag === 'Patient' ? 'var(--accent-dark)' : t.tag === 'Doctor' ? '#4f46e5' : '#b45309', border: `1px solid ${t.tag === 'Patient' ? 'rgba(11,158,135,0.2)' : t.tag === 'Doctor' ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                                        {t.tag}
                                    </span>
                                </div>
                                {/* Quote */}
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1, fontStyle: 'italic' }}>"{t.quote}"</p>
                                {/* Author */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Avatar initials={t.avatar} size={38} />
                                    <div>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── FINAL CTA ─────────────────────────────────────── */}
            <Section style={{ padding: '60px 24px 80px' }}>
                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    style={{ padding: '56px 48px', textAlign: 'center', background: 'linear-gradient(135deg, #f0fdfb 0%, #ffffff 60%)', borderColor: 'rgba(11,158,135,0.2)', maxWidth: '680px', margin: '0 auto' }}
                >
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--accent)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(11,158,135,0.4)' }}>
                        <svg width="26" height="26" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" /></svg>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '10px', color: 'var(--text-primary)' }}>
                        Ready to modernise your hospital?
                    </h2>
                    <p className="t-body" style={{ marginBottom: '32px' }}>
                        Join hundreds of healthcare providers already using Qure. Setup takes under 5 minutes.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} style={{ padding: '13px 28px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(11,158,135,0.35)' }}>
                                Register now →
                            </motion.button>
                        </Link>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} className="btn-secondary" style={{ padding: '13px 28px', fontSize: '1rem', width: 'auto' }}>
                                Sign in
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </Section>

            {/* ── FOOTER ────────────────────────────────────────── */}
            <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="logo-mark" style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
                        <svg width="15" height="15" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" /></svg>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Qure</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>© 2026 · All rights reserved</span>
                </div>
                <div style={{ display: 'flex', gap: '24px' }}>
                    {['Privacy', 'Terms', 'Contact'].map(link => (
                        <a key={link} href="#" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                            onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                        >{link}</a>
                    ))}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>HIPAA-aligned · Made in India 🇮🇳</p>
            </footer>
        </div>
    );
}
