import { motion } from 'framer-motion';

const features = [
    {
        icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
        title: 'Smart Queue Management',
        desc: 'Real-time token system eliminates waiting room chaos.',
    },
    {
        icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        title: 'Prescription Workflow',
        desc: 'Seamless doctor-to-chemist digital prescription flow.',
    },
    {
        icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
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
    visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function HeroPanel() {
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '40px',
        }}>
            {/* Top: Logo + Tagline */}
            <div>
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}
                >
                    <div className="logo-mark">
                        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" />
                        </svg>
                    </div>
                    <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                        Qure
                    </span>
                    <span style={{
                        marginLeft: '4px',
                        padding: '2px 8px',
                        background: 'var(--accent-bg)',
                        border: '1px solid rgba(88,101,242,0.25)',
                        borderRadius: '20px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: 'var(--accent-light)',
                        letterSpacing: '0.05em',
                    }}>
                        BETA
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h1 className="t-display" style={{ marginBottom: '12px' }}>
                        Healthcare,
                        <br />
                        <span className="gradient-text">Re-engineered.</span>
                    </h1>
                    <p className="t-body" style={{ maxWidth: '320px', lineHeight: 1.7 }}>
                        Qure is a digital-first platform that connects hospitals,
                        doctors, and patients — making healthcare smarter for everyone.
                    </p>
                </motion.div>

                {/* Features */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                    {features.map((f) => (
                        <motion.div
                            key={f.title}
                            variants={itemVariants}
                            style={{
                                display: 'flex',
                                gap: '14px',
                                alignItems: 'flex-start',
                            }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'var(--accent-bg)',
                                border: '1px solid rgba(88,101,242,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--accent-light)',
                                flexShrink: 0,
                            }}>
                                {f.icon}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                                    {f.title}
                                </p>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {f.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Bottom: Stats */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <div style={{ height: '1px', background: 'var(--border)', marginBottom: '24px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {stats.map(s => (
                        <div key={s.label} className="stat-card">
                            <p style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '2px' }}>
                                {s.value}
                            </p>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</p>
                        </div>
                    ))}
                </div>
                <p style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Trusted by healthcare providers across India · HIPAA-aligned
                </p>
            </motion.div>
        </div>
    );
}
