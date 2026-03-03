import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FloatingLabelInput from '../components/FloatingLabelInput';
import PulseButton from '../components/PulseButton';
import { loginHospital } from '../api/auth';

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
            // POST /api/v1/admin/login
            const res = await loginHospital(email.trim(), password);
            // Persist session
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.data?.admin || {}));

            // Navigate by role
            const userRole = res.data?.admin?.role;
            if (userRole === 'SUPER_ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/doctor/dashboard');
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
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ width: '100%', maxWidth: '440px' }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
                    <div className="logo-mark">
                        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" />
                        </svg>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                        Qure
                    </span>
                </div>

                <div className="card" style={{ padding: '32px' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            Sign in to Qure
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Welcome back — let's get you in.
                        </p>
                    </div>

                    {/* Role selector */}
                    <div style={{ marginBottom: '20px' }}>
                        <div className="seg-control">
                            {[
                                {
                                    value: 'hospital', label: 'Healthcare Provider', icon: (
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m7-11v6m-3-3h6" />
                                        </svg>
                                    )
                                },
                                {
                                    value: 'patient', label: 'Patient', icon: (
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )
                                },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setRole(opt.value)}
                                    className={`seg-btn ${role === opt.value ? 'active' : ''}`}
                                >
                                    <span style={{ color: role === opt.value ? 'var(--accent)' : 'var(--text-muted)' }}>{opt.icon}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <FloatingLabelInput
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                        />
                        <div>
                            <FloatingLabelInput
                                label="Password"
                                type="password"
                                placeholder="Your password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                            />
                            <div style={{ marginTop: '8px', textAlign: 'right' }}>
                                <button
                                    type="button"
                                    style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: 'var(--accent-light)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: '9px',
                                    background: 'rgba(244,63,94,0.06)',
                                    border: '1.5px solid rgba(244,63,94,0.2)',
                                    fontSize: '0.8125rem',
                                    color: 'var(--error)',
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'center',
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                                {error}
                            </motion.div>
                        )}

                        <PulseButton type="submit" loading={loading} style={{ marginTop: '4px' }}>
                            Sign in →
                        </PulseButton>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                        <div className="divider" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>New to Qure?</span>
                        <div className="divider" />
                    </div>

                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <button
                            type="button"
                            className="btn-ghost"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            Create an account
                        </button>
                    </Link>
                </div>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Protected by Qure · HIPAA-aligned
                </p>
            </motion.div>
        </div>
    );
}
