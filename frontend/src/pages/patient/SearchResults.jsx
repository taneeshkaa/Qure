import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SparkleCanvas from '../../components/SparkleCanvas';
import { PatientNav } from './PatientDashboard';
import { smartSearch } from '../../data/searchData';
import { getDoctorsForHospital } from '../../data/mockData';

function StarRating({ rating, size = 12 }) {
    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(i => <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f59e0b' : '#d1fae5'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}
        </div>
    );
}

function AvailabilityBadge({ available }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', background: available ? 'rgba(11,158,135,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${available ? 'rgba(11,158,135,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: available ? '#0b9e87' : '#ef4444' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: available ? 'var(--accent-dark)' : '#dc2626' }}>
                {available ? 'Available today' : 'Next slot: Tomorrow'}
            </span>
        </div>
    );
}

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const q = searchParams.get('q') || '';
    const [expandedHospital, setExpandedHospital] = useState(null);
    const [tab, setTab] = useState('all'); // all | doctors | hospitals

    const { doctors: matchedDoctors, hospitals: matchedHospitals, detection } = smartSearch(q);
    const total = matchedDoctors.length + matchedHospitals.length;

    const filteredDoctors = tab === 'hospitals' ? [] : matchedDoctors;
    const filteredHospitals = tab === 'doctors' ? [] : matchedHospitals;

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2 }}>
            <SparkleCanvas />
            <PatientNav active="/patient/dashboard" />

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '36px 24px 80px' }}>

                {/* ── Header ─────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Link to="/patient/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '4px' }}>← Back</Link>
                        <span style={{ color: 'var(--border)' }}>·</span>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{total} results for <strong style={{ color: 'var(--text-primary)' }}>"{q}"</strong></p>
                    </div>

                    {/* Specialty routing banner */}
                    <AnimatePresence>
                        {detection && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', background: 'var(--accent-bg)', border: '1.5px solid rgba(11,158,135,0.2)', borderRadius: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#0b9e87" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 500 }}>
                                        Searching for: <strong>"{detection.keyword}"</strong>
                                    </span>
                                </div>
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 12px', background: 'white', border: '1.5px solid rgba(11,158,135,0.3)', borderRadius: '20px' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#0b9e87"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-dark)' }}>Found: {detection.specialty}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { key: 'all', label: `All (${total})` },
                            { key: 'doctors', label: `Doctors (${matchedDoctors.length})` },
                            { key: 'hospitals', label: `Hospitals (${matchedHospitals.length})` },
                        ].map(t => (
                            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '7px 16px', borderRadius: '20px', border: `1.5px solid ${tab === t.key ? 'var(--accent)' : 'var(--border)'}`, background: tab === t.key ? 'var(--accent)' : 'white', color: tab === t.key ? 'white' : 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {total === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 24px' }}>
                        <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</p>
                        <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>No results found</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Try searching for a symptom like "headache", "knee pain", or a doctor name.</p>
                        <Link to="/patient/dashboard"><button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>← Back to Search</button></Link>
                    </motion.div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {/* ── Doctor results ──────────────────── */}
                        {filteredDoctors.length > 0 && (
                            <div>
                                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>👨‍⚕️</span> Doctors <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({filteredDoctors.length})</span>
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {filteredDoctors.map((doc, i) => (
                                        <motion.div key={doc.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                            <div className="card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                                {/* Avatar */}
                                                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-bg)', border: '2px solid rgba(11,158,135,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 800, color: 'var(--accent-dark)', flexShrink: 0 }}>
                                                    {doc.name.split(' ').slice(1).map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                                                        <div>
                                                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{doc.name}</h3>
                                                            <p style={{ fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 600 }}>{doc.specialty} · {doc.designation}</p>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{doc.fee}</p>
                                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per consultation</p>
                                                        </div>
                                                    </div>
                                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>🏥 {doc.hospital} · 📍 {doc.city}</p>
                                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <StarRating rating={doc.rating} />
                                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{doc.rating} · {doc.reviewCount} reviews</span>
                                                        <span style={{ color: 'var(--border)' }}>·</span>
                                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{doc.experience} yrs</span>
                                                        <AvailabilityBadge available={i % 2 === 0} />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                                                    <Link to={`/patient/book/${doc.id}`}>
                                                        <motion.button whileHover={{ scale: 1.02 }} style={{ padding: '9px 18px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                                                            Book Now
                                                        </motion.button>
                                                    </Link>
                                                    <Link to={`/doctors/${doc.id}`} style={{ textDecoration: 'none' }}>
                                                        <button style={{ padding: '7px 18px', background: 'white', color: 'var(--accent-dark)', border: '1.5px solid rgba(11,158,135,0.3)', borderRadius: '9px', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', width: '100%' }}>View Profile</button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Hospital results ─────────────────── */}
                        {filteredHospitals.length > 0 && (
                            <div>
                                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>🏥</span> Hospitals <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({filteredHospitals.length})</span>
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {filteredHospitals.map((h, i) => {
                                        const expanded = expandedHospital === h.id;
                                        const hDoctors = getDoctorsForHospital(h.id);
                                        return (
                                            <motion.div key={h.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                                <div className="card" style={{ overflow: 'hidden' }}>
                                                    <div style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.375rem', flexShrink: 0 }}>🏥</div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                                                                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{h.name}</h3>
                                                                <AvailabilityBadge available={i % 3 !== 2} />
                                                            </div>
                                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>📍 {h.city}, {h.state} · {h.type}</p>
                                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                <StarRating rating={h.rating} />
                                                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{h.rating} · {h.reviewCount.toLocaleString()} reviews</span>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                    {h.specialties.slice(0, 3).map(s => (
                                                                        <span key={s} style={{ padding: '2px 8px', borderRadius: '20px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.15)', fontSize: '0.7rem', color: 'var(--accent-dark)', fontWeight: 500 }}>{s}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            <Link to={`/hospitals/${h.id}`} style={{ textDecoration: 'none' }}>
                                                                <button style={{ padding: '9px 18px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>View Hospital</button>
                                                            </Link>
                                                            {hDoctors.length > 0 && (
                                                                <button onClick={() => setExpandedHospital(expanded ? null : h.id)} style={{ padding: '7px 18px', background: 'white', color: 'var(--accent-dark)', border: '1.5px solid rgba(11,158,135,0.3)', borderRadius: '9px', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                                                    {expanded ? 'Hide' : `${hDoctors.length} Doctors ▾`}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Expandable doctor roster */}
                                                    <AnimatePresence>
                                                        {expanded && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                                                                <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: '#f8fffe' }}>
                                                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Doctors at {h.name}</p>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                        {hDoctors.map(doc => (
                                                                            <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'white', border: '1px solid var(--border)', borderRadius: '10px' }}>
                                                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                                                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-dark)' }}>
                                                                                        {doc.name.split(' ').slice(1).map(n => n[0]).join('').slice(0, 2)}
                                                                                    </div>
                                                                                    <div>
                                                                                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</p>
                                                                                        <p style={{ fontSize: '0.75rem', color: 'var(--accent-dark)' }}>{doc.specialty} · ₹{doc.fee}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <Link to={`/patient/book/${doc.id}`}>
                                                                                    <button style={{ padding: '6px 14px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Book</button>
                                                                                </Link>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
