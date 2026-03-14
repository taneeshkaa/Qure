import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { hospitals, STATES } from '../data/mockData';
import SparkleCanvas from '../components/SparkleCanvas';

function StarRating({ rating, size = 14 }) {
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

function TypeBadge({ type }) {
    const colors = {
        'Government': { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', color: '#4f46e5' },
        'Private': { bg: 'rgba(11,158,135,0.08)', border: 'rgba(11,158,135,0.2)', color: 'var(--accent-dark)' },
        'Government-aided': { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#b45309' },
    };
    const s = colors[type] || colors['Private'];
    return (
        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
            {type}
        </span>
    );
}

export default function HospitalsPage() {
    const [selectedState, setSelectedState] = useState('');
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('');

    const filtered = useMemo(() => {
        return hospitals.filter(h =>
            (!selectedState || h.state === selectedState) &&
            (!selectedType || h.type === selectedType) &&
            (!search || h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase()))
        );
    }, [selectedState, selectedType, search]);

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2 }}>
            <SparkleCanvas />

            {/* ── Header bar ───────────────────────────────────── */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div className="logo-mark" style={{ width: 32, height: 32, borderRadius: '9px' }}>
                        <svg width="17" height="17" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" /></svg>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>QueueEase</span>
                </Link>
                <nav style={{ display: 'flex', gap: '12px' }}>
                    <Link to="/hospitals" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', padding: '6px 12px', background: 'var(--accent-bg)', borderRadius: '8px' }}>Hospitals</Link>
                    <Link to="/doctors" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 12px' }}>Doctors</Link>
                    <Link to="/how-it-works" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 12px' }}>How it works</Link>
                </nav>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to="/login"><button className="btn-ghost" style={{ padding: '7px 16px', fontSize: '0.8125rem', width: 'auto' }}>Sign in</button></Link>
                    <Link to="/register"><button style={{ padding: '7px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Get started</button></Link>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
                {/* ── Page header ──────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '32px' }}>
                    <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '12px' }}>🏥 {hospitals.length} hospitals on QueueEase</div>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Find a Hospital
                    </h1>
                    <p className="t-body">Browse verified hospitals across India. Filter by state, type, or search by name.</p>
                </motion.div>

                {/* ── Filters ──────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                        <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input className="input-field" placeholder="Search by name or city..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '38px' }} />
                    </div>

                    {/* State filter */}
                    <select className="input-field" value={selectedState} onChange={e => setSelectedState(e.target.value)} style={{ width: 'auto', minWidth: '180px' }}>
                        <option value="">All States</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Type filter */}
                    <select className="input-field" value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ width: 'auto', minWidth: '160px' }}>
                        <option value="">All Types</option>
                        {['Government', 'Private', 'Government-aided'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    {/* Clear */}
                    {(selectedState || selectedType || search) && (
                        <button onClick={() => { setSelectedState(''); setSelectedType(''); setSearch(''); }} className="btn-ghost" style={{ padding: '0 16px', width: 'auto', fontSize: '0.8125rem' }}>
                            Clear filters ✕
                        </button>
                    )}
                </motion.div>

                {/* ── Results count ────────────────────────────── */}
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    {filtered.length} hospital{filtered.length !== 1 ? 's' : ''} found
                    {selectedState ? ` in ${selectedState}` : ''}
                </p>

                {/* ── Hospital grid ─────────────────────────────  */}
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '2rem', marginBottom: '12px' }}>🏥</p>
                        <p style={{ fontSize: '1rem', fontWeight: 600 }}>No hospitals found for this filter combination.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                        {filtered.map((h, i) => (
                            <motion.div key={h.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.06 }}>
                                <Link to={`/hospitals/${h.id}`} style={{ textDecoration: 'none' }}>
                                    <motion.div
                                        className="card"
                                        whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(11,158,135,0.12)', borderColor: 'rgba(11,158,135,0.35)' }}
                                        style={{ padding: '24px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                    >
                                        {/* Top row */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.375rem', flexShrink: 0 }}>🏥</div>
                                            <TypeBadge type={h.type} />
                                        </div>

                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>{h.name}</h3>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>📍 {h.city}, {h.state}</p>

                                        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '12px' }} />

                                        {/* Stats row */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div><p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{h.beds}</p><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Beds</p></div>
                                            <div><p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{h.established}</p><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est.</p></div>
                                            <div><p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)' }}>{h.reviewCount.toLocaleString()}+</p><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reviews</p></div>
                                        </div>

                                        <StarRating rating={h.rating} />

                                        {/* Specialties */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                                            {h.specialties.slice(0, 3).map(s => (
                                                <span key={s} style={{ padding: '3px 9px', borderRadius: '20px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.15)', fontSize: '0.7rem', fontWeight: 500, color: 'var(--accent-dark)' }}>{s}</span>
                                            ))}
                                            {h.specialties.length > 3 && <span style={{ padding: '3px 9px', borderRadius: '20px', background: '#f4f5f7', border: '1px solid var(--border)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{h.specialties.length - 3}</span>}
                                        </div>

                                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', color: 'var(--accent-dark)', fontSize: '0.8125rem', fontWeight: 600 }}>
                                            View details →
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
