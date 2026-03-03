import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useFormStore from '../store/formStore';
import IdentityToggle from '../components/IdentityToggle';
import HeroPanel from '../components/HeroPanel';
import HospitalRegistration from './HospitalRegistration';
import PatientRegistration from './PatientRegistration';

export default function RegisterPage() {
    const { identity, setIdentity } = useFormStore();

    const handleIdentityChange = (val) => {
        setIdentity(val);
    };

    return (
        <div style={{
            position: 'relative',
            zIndex: 10,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '1080px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
                gap: '24px',
                minHeight: '680px',
                /* Stack on mobile */
            }}>
                {/* ── LEFT: Brand / Hero Panel ── */}
                <motion.div
                    className="card"
                    style={{
                        background: 'var(--bg-card)',
                        overflow: 'hidden',
                    }}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                    <HeroPanel />
                </motion.div>

                {/* ── RIGHT: Registration Form ── */}
                <motion.div
                    className="card"
                    style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
                >
                    {/* Form header */}
                    <div style={{
                        padding: '28px 28px 0',
                        borderBottom: '1px solid var(--border)',
                        paddingBottom: '20px',
                    }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Get started
                        </p>
                        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            Create your account
                        </h2>

                        {/* Identity toggle */}
                        <IdentityToggle value={identity} onChange={handleIdentityChange} />
                    </div>

                    {/* Form body */}
                    <div style={{ flex: 1, padding: '24px 28px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <AnimatePresence mode="wait">
                            {identity === 'hospital' ? (
                                <motion.div
                                    key="hospital"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                                >
                                    <HospitalRegistration />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="patient"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                                >
                                    <PatientRegistration />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '14px 28px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                    }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Already have an account?</span>
                        <Link
                            to="/login"
                            style={{
                                color: 'var(--accent-light)',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                            }}
                        >
                            Sign in →
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
