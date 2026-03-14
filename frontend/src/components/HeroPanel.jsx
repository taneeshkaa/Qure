import { motion } from 'framer-motion';

const features = [
    {
        icon: (
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
        title: 'Smart Queue Management',
        desc: 'Real-time token system eliminates waiting room chaos.',
    },
    {
        icon: (
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        title: 'Prescription Workflow',
        desc: 'Seamless doctor-to-chemist digital prescription flow.',
    },
    {
        icon: (
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        title: 'Live Status Tracking',
        desc: 'Patients track their queue position in real time.',
    },
];

const stats = [
    { value: '10k+', label: 'Patient Records' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '< 1s', label: 'Load Time' },
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.11 } },
};

const itemVariants = {
    hidden: { opacity: 0, x: -18, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
};

export default function HeroPanel() {
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '36px 36px 32px',
        }}>
            {/* Top: Logo + Tagline */}
            <div>
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}
                >
                    <div className="logo-mark">
                        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" />
                        </svg>
                    </div>
                    <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                        QueueEase
                    </span>
                    <span style={{
                        marginLeft: '4px',
                        padding: '2px 8px',
                        background: 'rgba(11, 158, 135, 0.08)',
                        border: '1px solid rgba(11, 158, 135, 0.2)',
                        borderRadius: '20px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: 'var(--accent)',
                        letterSpacing: '0.06em',
                        backdropFilter: 'blur(8px)',
                    }}>
                        BETA
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.52, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h1 className="t-display" style={{ marginBottom: '12px' }}>
                        Healthcare,
                        <br />
                        <span className="gradient-text">Re-engineered.</span>
                    </h1>
                    <p className="t-body" style={{ maxWidth: '310px', lineHeight: 1.75 }}>
                        QueueEase is a digital-first platform connecting hospitals,
                        doctors, and patients — making healthcare smarter for everyone.
                    </p>
                </motion.div>

                {/* Features */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '14px' }}
                >
                    {features.map((f) => (
                        <motion.div
                            key={f.title}
                            variants={itemVariants}
                            style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}
                        >
                            <div className="feature-icon-chip">
                                {f.icon}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                                    {f.title}
                                </p>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                                    {f.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Bottom: Glass floating stat chips */}
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Subtle gradient divider */}
                <div style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(11,158,135,0.2), transparent)',
                    margin: '0 0 20px',
                }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            className="stat-card"
                            initial={{ opacity: 0, y: 10, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.55 + i * 0.08, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                        >
                            <p style={{
                                fontSize: '1.25rem',
                                fontWeight: 800,
                                letterSpacing: '-0.035em',
                                color: 'var(--text-primary)',
                                marginBottom: '2px',
                                background: 'linear-gradient(135deg, #0b9e87 0%, #34d9be 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                {s.value}
                            </p>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</p>
                        </motion.div>
                    ))}
                </div>
                <p style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Trusted by healthcare providers across India · HIPAA-aligned
                </p>
            </motion.div>
        </div>
    );
}
