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
                maxWidth: '1100px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.12fr) minmax(0, 1fr)',
                gap: '20px',
                minHeight: '700px',
            }}>
                {/* ── LEFT: Hero Panel (Glass) ── */}
                <motion.div
                    style={{
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.82) 0%, rgba(240,250,248,0.78) 100%)',
                        border: '1px solid rgba(255,255,255,0.72)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        boxShadow: '0 4px 24px rgba(11,120,100,0.08), 0 24px 64px rgba(11,120,100,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
                    }}
                    initial={{ opacity: 0, x: -28, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                    <HeroPanel />
                </motion.div>

                {/* ── RIGHT: Registration Form (Glass) ── */}
                <motion.div
                    style={{
                        background: 'rgba(255,255,255,0.86)',
                        border: '1px solid rgba(255,255,255,0.68)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        boxShadow: '0 4px 24px rgba(11,120,100,0.07), 0 24px 64px rgba(11,120,100,0.05), inset 0 1px 0 rgba(255,255,255,0.95)',
                    }}
                    initial={{ opacity: 0, x: 28, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
                >
                    {/* Form header */}
                    <div style={{
                        padding: '28px 28px 0',
                        borderBottom: '1px solid rgba(11,158,135,0.1)',
                        paddingBottom: '20px',
                    }}>
                        <p style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: 'var(--accent)',
                            marginBottom: '4px',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                        }}>
                            Get started
                        </p>
                        <h2 style={{
                            fontSize: '1.375rem',
                            fontWeight: 800,
                            letterSpacing: '-0.035em',
                            color: 'var(--text-primary)',
                            marginBottom: '18px',
                        }}>
                            Create your account
                        </h2>

                        {/* Premium identity toggle */}
                        <IdentityToggle value={identity} onChange={handleIdentityChange} />
                    </div>

                    {/* Form body */}
                    <div style={{ flex: 1, padding: '22px 28px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <AnimatePresence mode="wait">
                            {identity === 'hospital' ? (
                                <motion.div
                                    key="hospital"
                                    initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                                >
                                    <HospitalRegistration />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="patient"
                                    initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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
                        borderTop: '1px solid rgba(11,158,135,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                    }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Already have an account?</span>
                        <Link
                            to="/login"
                            style={{
                                color: 'var(--accent)',
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                letterSpacing: '0.01em',
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
