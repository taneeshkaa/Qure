import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doctors, STATES, SPECIALTIES } from '../data/mockData';
import SparkleCanvas from '../components/SparkleCanvas';

function StarRating({ rating, size = 13 }) {
    return (
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f59e0b' : '#d1fae5'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginLeft: '4px' }}>{rating}</span>
        </div>
    );
}

function Avatar({ initials, size = 52 }) {
    const colors = ['#0b9e87', '#5865f2', '#e11d48', '#7c3aed', '#0ea5e9'];
    const idx = initials.charCodeAt(0) % colors.length;
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: colors[idx] + '18', border: `2px solid ${colors[idx]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.32, fontWeight: 700, color: colors[idx], flexShrink: 0 }}>
            {initials}
        </div>
    );
}

export default function DoctorsPage() {
    const [selectedState, setSelectedState] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => doctors.filter(d =>
        (!selectedState || d.state === selectedState) &&
        (!selectedSpecialty || d.specialty === selectedSpecialty) &&
        (!search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()))
    ), [selectedState, selectedSpecialty, search]);

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2 }}>
            <SparkleCanvas />

            {/* ── Header ───────────────────────────────────────── */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div className="logo-mark" style={{ width: 32, height: 32, borderRadius: '9px' }}>
                        <svg width="17" height="17" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" /></svg>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>QueueEase</span>
                </Link>
                <nav style={{ display: 'flex', gap: '12px' }}>
                    <Link to="/hospitals" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 12px' }}>Hospitals</Link>
                    <Link to="/doctors" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', padding: '6px 12px', background: 'var(--accent-bg)', borderRadius: '8px' }}>Doctors</Link>
                    <Link to="/how-it-works" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 12px' }}>How it works</Link>
                </nav>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to="/login"><button className="btn-ghost" style={{ padding: '7px 16px', fontSize: '0.8125rem', width: 'auto' }}>Sign in</button></Link>
                    <Link to="/register"><button style={{ padding: '7px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Get started</button></Link>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '32px' }}>
                    <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '12px' }}>👨‍⚕️ {doctors.length} verified doctors</div>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Find a Doctor
                    </h1>
                    <p className="t-body">Every doctor on QueueEase is hospital-verified. Filter by state and specialty to find the right specialist.</p>
                </motion.div>

                {/* ── Filters ──────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                        <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input className="input-field" placeholder="Search by name or specialty..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '38px' }} />
                    </div>
                    <select className="input-field" value={selectedState} onChange={e => setSelectedState(e.target.value)} style={{ width: 'auto', minWidth: '180px' }}>
                        <option value="">All States</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className="input-field" value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)} style={{ width: 'auto', minWidth: '200px' }}>
                        <option value="">All Specialties</option>
                        {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {(selectedState || selectedSpecialty || search) && (
                        <button onClick={() => { setSelectedState(''); setSelectedSpecialty(''); setSearch(''); }} className="btn-ghost" style={{ padding: '0 16px', width: 'auto', fontSize: '0.8125rem' }}>
                            Clear ✕
                        </button>
                    )}
                </motion.div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
                    {selectedSpecialty ? ` · ${selectedSpecialty}` : ''}
                    {selectedState ? ` in ${selectedState}` : ''}
                </p>

                {/* ── Doctor cards ──────────────────────────────── */}
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '2rem', marginBottom: '12px' }}>👨‍⚕️</p>
                        <p style={{ fontSize: '1rem', fontWeight: 600 }}>No doctors match your filters.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filtered.map((doc, i) => (
                            <motion.div key={doc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.06 }}>
                                <Link to={`/doctors/${doc.id}`} style={{ textDecoration: 'none' }}>
                                    <motion.div
                                        className="card"
                                        whileHover={{ y: -3, boxShadow: '0 10px 32px rgba(11,158,135,0.1)', borderColor: 'rgba(11,158,135,0.3)' }}
                                        style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                    >
                                        <Avatar initials={doc.name.split(' ').map(n => n[0]).join('').slice(1, 3)} size={60} />

                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                                        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>{doc.name}</h3>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.2)', borderRadius: '20px', padding: '2px 8px' }}>
                                                            <svg width="9" height="9" viewBox="0 0 24 24" fill="#0b9e87"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--accent-dark)' }}>Verified</span>
                                                        </div>
                                                    </div>
                                                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-dark)', marginBottom: '2px' }}>{doc.specialty}</p>
                                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{doc.designation}</p>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{doc.fee}</p>
                                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Consultation fee</p>
                                                </div>
                                            </div>

                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '10px 0 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span>🏥</span> {doc.hospital}
                                                <span style={{ margin: '0 4px', color: 'var(--border)' }}>·</span>
                                                <span>📍</span> {doc.city}, {doc.state}
                                            </p>

                                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <StarRating rating={doc.rating} />
                                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{doc.reviewCount} reviews</span>
                                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>· {doc.experience} yrs exp.</span>
                                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>· {doc.patients} patients</span>
                                            </div>
                                        </div>

                                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: 'var(--accent-dark)', fontSize: '0.875rem', fontWeight: 600, gap: '4px' }}>
                                            View →
                                        </div>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
