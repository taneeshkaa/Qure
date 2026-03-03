import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SparkleCanvas from '../../components/SparkleCanvas';
import { detectSpecialty, smartSearch } from '../../data/searchData';

/* ── Shared patient nav ───────────────────────────────────────── */
function PatientNav({ active = '' }) {
    return (
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <div className="logo-mark" style={{ width: 32, height: 32, borderRadius: '9px' }}>
                    <svg width="17" height="17" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" /></svg>
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Qure</span>
            </Link>
            <nav style={{ display: 'flex', gap: '4px' }}>
                {[
                    { label: '🏠 Dashboard', to: '/patient/dashboard' },
                    { label: '📅 Appointments', to: '/patient/appointments' },
                    { label: '🏥 Hospitals', to: '/hospitals' },
                    { label: '👨‍⚕️ Doctors', to: '/doctors' },
                ].map(item => (
                    <Link key={item.to} to={item.to} style={{ fontSize: '0.8125rem', fontWeight: active === item.to ? 600 : 500, color: active === item.to ? 'var(--accent)' : 'var(--text-secondary)', textDecoration: 'none', padding: '6px 12px', borderRadius: '8px', background: active === item.to ? 'var(--accent-bg)' : 'transparent', transition: 'all 0.15s' }}
                        onMouseEnter={e => { if (active !== item.to) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                        onMouseLeave={e => { if (active !== item.to) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                    >{item.label}</Link>
                ))}
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-bg)', border: '2px solid rgba(11,158,135,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-dark)' }}>P</div>
                <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>Patient</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>My Account</p>
                </div>
            </div>
        </div>
    );
}

export { PatientNav };

const QUICK_SEARCHES = [
    'Heart checkup', 'Headache & migraine', 'Back pain', 'Skin rash',
    'Stomach acidity', 'Knee pain', 'Fever & cold', 'Eye checkup',
    'Anxiety & stress', 'Child vaccination', 'Cancer screening', 'Kidney stone',
];

export default function PatientDashboard() {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef(null);

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
        if (query.trim().length >= 2) {
            navigate(`/patient/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleKey = e => { if (e.key === 'Enter') doSearch(); };

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2, background: '#f8fffe' }}>
            <SparkleCanvas />
            <PatientNav active="/patient/dashboard" />

            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '56px 24px 80px' }}>

                {/* ── Greeting ─────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '40px' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Good {getGreeting()}</p>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        How can we help you today?
                    </h1>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                        Search by symptom, doctor name, specialty, or hospital.
                    </p>
                </motion.div>

                {/* ── Search bar ───────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ position: 'relative', marginBottom: '32px' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'white', border: `2px solid ${isFocused ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '16px', padding: '0 16px', boxShadow: isFocused ? '0 0 0 4px rgba(11,158,135,0.1), 0 8px 24px rgba(11,158,135,0.1)' : '0 2px 12px rgba(0,0,0,0.06)', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: isFocused ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0, transition: 'color 0.2s' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                            onKeyDown={handleKey}
                            placeholder="Type a symptom, doctor name, hospital, or specialty..."
                            style={{ flex: 1, border: 'none', outline: 'none', padding: '18px 12px', fontSize: '1rem', color: 'var(--text-primary)', background: 'transparent', fontFamily: 'Inter, sans-serif' }}
                        />
                        {/* Specialty detection indicator */}
                        <AnimatePresence>
                            {detection && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.25)', borderRadius: '20px', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite' }} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-dark)' }}>→ {detection.specialty}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={doSearch}
                            style={{ padding: '10px 22px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginLeft: '8px', flexShrink: 0, boxShadow: '0 2px 8px rgba(11,158,135,0.3)' }}>
                            Search
                        </motion.button>
                    </div>

                    {/* ── Live dropdown preview ─────────────────── */}
                    <AnimatePresence>
                        {isFocused && preview.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '6px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
                                {detection && (
                                    <div style={{ padding: '10px 16px', background: 'var(--accent-bg)', borderBottom: '1px solid rgba(11,158,135,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#0b9e87" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 500 }}>
                                            Searching for: <strong>"{detection.keyword}"</strong> → Mapping to <strong>{detection.specialty}</strong>
                                        </span>
                                    </div>
                                )}
                                {preview.map((item, i) => (
                                    <motion.div key={i} whileHover={{ background: '#f8fffe' }} onClick={() => { navigate(item.specialty ? `/doctors/${item.id}` : `/hospitals/${item.id}`); }} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: i < preview.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                                            {item.specialty ? '👨‍⚕️' : '🏥'}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {item.specialty ? `${item.specialty} · ${item.hospital}` : `${item.city}, ${item.state}`}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                                <div onClick={doSearch} style={{ padding: '10px 16px', textAlign: 'center', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 600, background: 'var(--bg-elevated)' }}>
                                    See all results for "{query}" →
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── Quick search chips ───────────────────────── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginBottom: '48px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Quick searches</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {QUICK_SEARCHES.map(qs => (
                            <motion.button key={qs} whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(11,158,135,0.15)' }} whileTap={{ scale: 0.97 }}
                                onClick={() => { setQuery(qs); navigate(`/patient/search?q=${encodeURIComponent(qs)}`); }}
                                style={{ padding: '8px 16px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '20px', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s, color 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(11,158,135,0.4)'; e.currentTarget.style.color = 'var(--accent-dark)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >{qs}</motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* ── Stats strip ──────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '48px' }}>
                    {[
                        { icon: '🏥', value: '11', label: 'Hospitals' },
                        { icon: '👨‍⚕️', value: '7', label: 'Doctors' },
                        { icon: '📅', value: '0', label: 'Appointments' },
                        { icon: '⚡', value: '<5 min', label: 'Avg booking' },
                    ].map(s => (
                        <div key={s.label} className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{s.icon}</p>
                            <p style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.03em' }}>{s.value}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* ── Quick action cards ───────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Quick actions</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {[
                            { emoji: '🔍', title: 'Find a Doctor', desc: 'Browse verified doctors by specialty and state', to: '/doctors', color: '#0b9e87' },
                            { emoji: '🏥', title: 'Find a Hospital', desc: 'Explore hospitals near you with live availability', to: '/hospitals', color: '#5865f2' },
                            { emoji: '📅', title: 'My Appointments', desc: 'View upcoming tokens and appointment reminders', to: '/patient/appointments', color: '#f59e0b' },
                        ].map((card) => (
                            <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
                                <motion.div whileHover={{ y: -4, boxShadow: `0 12px 28px ${card.color}18` }} className="card" style={{ padding: '24px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = card.color + '40'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: card.color + '12', border: `1.5px solid ${card.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '12px' }}>{card.emoji}</div>
                                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{card.title}</h3>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{card.desc}</p>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning ☀️';
    if (h < 17) return 'afternoon 🌤️';
    return 'evening 🌙';
}
