import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingLabelInput from '../components/FloatingLabelInput';
import PulseButton from '../components/PulseButton';
import { loginHospital, loginAdmin } from '../api/auth';

const ROLES = [
    {
        value: 'hospital',
        label: 'Healthcare Provider',
        icon: (
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m7-11v6m-3-3h6" />
            </svg>
        ),
    },
    {
        value: 'patient',
        label: 'Patient',
        icon: (
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const [role, setRole] = useState('hospital');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { setError('Please fill in all fields.'); return; }

        // Patient login logic (simulated for demo purposes since patients don't have passwords in backend)
        if (role === 'patient') {
            localStorage.setItem('token', 'simulated_patient_token');
            localStorage.setItem('user', JSON.stringify({ email: email.trim(), role: 'patient' }));
            navigate('/patient/dashboard');
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Hospital owners use /hospital/login, everything else uses /admin/login
            const res = role === 'hospital'
                ? await loginHospital(email.trim(), password)
                : await loginAdmin(email.trim(), password);

            // Persist session
            localStorage.setItem('token', res.token);

            if (role === 'hospital' && res.data?.hospital_id) {
                localStorage.setItem('user', JSON.stringify({ role: 'hospital', ...res.data }));
                navigate('/hospital/dashboard');
            } else {
                localStorage.setItem('user', JSON.stringify(res.data?.admin || res.data || {}));
                const userRole = res.data?.admin?.role;
                navigate(userRole === 'SUPER_ADMIN' ? '/admin/dashboard' : '/doctor/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'relative',
            zIndex: 10,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', maxWidth: '440px' }}
            >
                {/* Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '28px',
                    justifyContent: 'center',
                }}>
                    <div className="logo-mark">
                        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" />
                        </svg>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.035em', color: 'var(--text-primary)' }}>
                        QueueEase
                    </span>
                </div>

                {/* Glass card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.86)',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    borderRadius: '24px',
                    padding: '32px',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    boxShadow: '0 4px 32px rgba(11,120,100,0.1), 0 24px 64px rgba(11,120,100,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: 'var(--accent)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: '4px',
                        }}>
                            Welcome back
                        </p>
                        <h1 style={{
                            fontSize: '1.375rem',
                            fontWeight: 800,
                            letterSpacing: '-0.035em',
                            color: 'var(--text-primary)',
                            marginBottom: '4px',
                        }}>
                            Sign in to QueueEase
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Let's get you back in.
                        </p>
                    </div>

                    {/* Premium role selector */}
                    <div style={{ marginBottom: '22px' }}>
                        <p style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            marginBottom: '8px',
                        }}>
                            Sign in as
                        </p>
                        <div className="seg-control">
                            {ROLES.map(opt => {
                                const active = role === opt.value;
                                return (
                                    <motion.button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => { setRole(opt.value); setError(''); }}
                                        whileTap={{ scale: 0.96 }}
                                        className={`seg-btn ${active ? 'active' : ''}`}
                                    >
                                        <motion.span
                                            animate={{ color: active ? 'var(--accent)' : 'var(--text-muted)', scale: active ? 1.1 : 1 }}
                                            transition={{ duration: 0.2 }}
                                            style={{ display: 'flex' }}
                                        >
                                            {opt.icon}
                                        </motion.span>
                                        {opt.label}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <FloatingLabelInput
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                            error={!email && error ? ' ' : undefined}
                        />
                        <div>
                            <FloatingLabelInput
                                label="Password"
                                type="password"
                                placeholder="Your password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                error={!password && error ? ' ' : undefined}
                            />
                            <div style={{ marginTop: '8px', textAlign: 'right' }}>
                                <button
                                    type="button"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '0.8125rem',
                                        color: 'var(--accent-light)',
                                        cursor: 'pointer',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 600,
                                    }}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        {/* Error banner */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    key={error}
                                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                    transition={{ duration: 0.22, ease: 'easeOut' }}
                                    style={{
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        background: 'rgba(244,63,94,0.07)',
                                        border: '1.5px solid rgba(244,63,94,0.22)',
                                        fontSize: '0.8125rem',
                                        color: 'var(--error)',
                                        display: 'flex',
                                        gap: '8px',
                                        alignItems: 'center',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                    </svg>
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <PulseButton type="submit" loading={loading} style={{ marginTop: '2px' }}>
                            Sign in →
                        </PulseButton>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                        <div className="divider" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>New to QueueEase?</span>
                        <div className="divider" />
                    </div>

                    <Link to="/register" style={{ textDecoration: 'none' }}>
                        <button
                            type="button"
                            className="btn-ghost"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            Create an account
                        </button>
                    </Link>
                </div>

                <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Protected by QueueEase · HIPAA-aligned
                </p>
            </motion.div>
        </div>
    );
}
