import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SparkleCanvas from '../components/SparkleCanvas';
import { getAllDoctors } from '../api/search';
import { STATES } from '../data/mockData';

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
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all doctors
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('👨‍⚕️ Fetching doctors...');
                
                const response = await getAllDoctors();
                
                console.log('✅ Doctors API Response:', response);
                
                // Handle different response structures
                const doctorData = response.data || response || [];
                const doctorsList = Array.isArray(doctorData) ? doctorData : (doctorData.data || []);
                
                setDoctors(doctorsList);
                
                // Extract unique specialties
                const uniqueSpecialties = [...new Set(doctorsList.map(d => d.specialization))].sort();
                setSpecialties(uniqueSpecialties);
            } catch (err) {
                console.error('❌ Error fetching doctors:', err);
                setError(err.message || 'Failed to load doctors');
                setDoctors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const filtered = useMemo(() => doctors.filter(d =>
        (!selectedState || d.hospital?.location?.state_name === selectedState) &&
        (!selectedSpecialty || d.specialization === selectedSpecialty) &&
        (!search || d.full_name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase()))
    ), [doctors, selectedState, selectedSpecialty, search]);

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

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
                {/* ── Page header ────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '32px' }}>
                    <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '12px' }}>👨‍⚕️ {filtered.length} doctors</div>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '8px' }}>Find a Doctor</h1>
                    <p className="t-body">Browse verified doctors across India. Filter by state, specialty, or search by name.</p>
                </motion.div>

                {/* ── Loading / Error state ───────────────────── */}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '3rem' }}>⏳</div>
                            <p>Loading doctors...</p>
                        </div>
                    </div>
                )}

                {error && !loading && (
                    <div style={{ padding: '16px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#dc2626', marginBottom: '24px' }}>
                        ❌ {error}
                    </div>
                )}

                {/* ── Filters ──────────────────────────────────── */}
                {!loading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                        {/* Search */}
                        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input className="input-field" placeholder="Search by name or specialty..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '38px' }} />
                        </div>

                        {/* State filter */}
                        <select className="input-field" value={selectedState} onChange={e => setSelectedState(e.target.value)} style={{ width: 'auto', minWidth: '180px' }}>
                            <option value="">All States</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        {/* Specialty filter */}
                        <select className="input-field" value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)} style={{ width: 'auto', minWidth: '200px' }}>
                            <option value="">All Specialties</option>
                            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        {/* Clear */}
                        {(selectedState || selectedSpecialty || search) && (
                            <button onClick={() => { setSelectedState(''); setSelectedSpecialty(''); setSearch(''); }} className="btn-ghost" style={{ padding: '0 16px', width: 'auto', fontSize: '0.8125rem' }}>
                                Clear filters ✕
                            </button>
                        )}
                    </motion.div>
                )}

                {/* ── Doctor grid ───────────────────────────────── */}
                {!loading && filtered.length === 0 && !error && (
                    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '2rem', marginBottom: '12px' }}>👨‍⚕️</p>
                        <p style={{ fontSize: '1rem', fontWeight: 600 }}>No doctors found for this filter combination.</p>
                    </div>
                )}

                {!loading && doctors.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                        {filtered.map((d, i) => (
                            <motion.div key={d.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.02 }}>
                                <Link to={`/doctors/${d.id}`} style={{ textDecoration: 'none' }}>
                                    <motion.div
                                        className="card"
                                        whileHover={{ y: -4 }}
                                        style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '16px' }}
                                    >
                                        {/* Doctor header */}
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <Avatar initials={d.full_name.split(' ').map(n => n[0]).join('')} size={52} />
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Dr. {d.full_name}</h3>
                                                <p style={{ fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 500, marginBottom: '2px' }}>{d.specialization}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.experience || 0} years exp.</p>
                                            </div>
                                        </div>

                                        <div style={{ height: '1px', background: 'var(--border)' }} />

                                        {/* Hospital info */}
                                        {d.hospital && (
                                            <div>
                                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>At Hospital</p>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{d.hospital.hospital_name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {d.hospital.location?.city_name}, {d.hospital.location?.state_name}</p>
                                            </div>
                                        )}

                                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--accent-dark)', fontSize: '0.8125rem', fontWeight: 600 }}>
                                            Book appointment →
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
