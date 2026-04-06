import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHospitalByIdAPI } from '../api/search';
import { isAuthenticated, saveRedirectPath, getUserRole } from '../utils/authRedirect';
import SparkleCanvas from '../components/SparkleCanvas';

function StarRating({ rating, size = 14 }) {
    return (
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f59e0b' : '#d1fae5'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
}

function Avatar({ initials, size = 44 }) {
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--accent-bg)', border: '2px solid rgba(11,158,135,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 700, color: 'var(--accent-dark)', flexShrink: 0 }}>
            {initials}
        </div>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '1rem', flexShrink: 0, width: '20px' }}>{icon}</span>
            <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</p>
            </div>
        </div>
    );
}

export default function HospitalDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

    // Fetch hospital by ID on mount
    useEffect(() => {
        const fetchHospital = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log(`🏥 Fetching hospital ${id}...`);
                
                const response = await getHospitalByIdAPI(id);
                console.log('✅ Hospital API Response:', response);
                
                const hospitalData = response.data?.data || response.data || null;
                setHospital(hospitalData);
            } catch (err) {
                console.error('❌ Error fetching hospital:', err);
                setError(err.message || 'Failed to load hospital');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchHospital();
        }
    }, [id]);

    // Check auth state on mount and when route changes
    useEffect(() => {
        setIsUserAuthenticated(isAuthenticated());
        setUserRole(getUserRole());
    }, []);

    // Handle book button click - logs in for patients, or scrolls to doctors section
    const handleBookClick = () => {
        if (!isUserAuthenticated) {
            saveRedirectPath(`/hospitals/${id}`);
            navigate('/register');
        } else if (userRole === 'patient') {
            // Scroll to the doctors section on this page for patient to select a doctor
            const doctorsSection = document.getElementById('doctors-section');
            if (doctorsSection) {
                doctorsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // Healthcare provider trying to book (shouldn't happen in normal flow)
            navigate('/patient/search');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '3rem' }}>⏳</p>
                <h2 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Loading hospital details...</h2>
            </div>
        );
    }

    // Error or not found state
    if (error || !hospital) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '3rem' }}>🏥</p>
                <h2 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Hospital not found</h2>
                {error && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{error}</p>}
                <Link to="/hospitals"><button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Browse hospitals</button></Link>
            </div>
        );
    }

    const hospitalName = hospital.hospital_name || 'Hospital';
    const doctorsList = hospital.doctors || [];
    const stateName = hospital.location?.state_name || '';
    const cityName = hospital.location?.city_name || '';
    const address = hospital.address || 'Address not available';
    const phone = hospital.phone_1 || hospital.phone_2 || 'Contact not available';

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2 }}>
            <SparkleCanvas />

            {/* Navbar */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div className="logo-mark" style={{ width: 32, height: 32, borderRadius: '9px' }}><svg width="17" height="17" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" /></svg></div>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>QueueEase</span>
                </Link>
                <nav style={{ display: 'flex', gap: '12px' }}>
                    <Link to="/hospitals" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', padding: '6px 12px' }}>← Hospitals</Link>
                    <Link to="/doctors" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 12px' }}>Doctors</Link>
                </nav>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to="/login"><button className="btn-ghost" style={{ padding: '7px 16px', fontSize: '0.8125rem', width: 'auto' }}>Sign in</button></Link>
                    <Link to="/register"><button style={{ padding: '7px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Get started</button></Link>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
                {/* ── Hero section ─────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '32px' }}>
                    {/* Breadcrumb */}
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
                        {' '} · {' '}
                        <Link to="/hospitals" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Hospitals</Link>
                        {' '} · {' '}
                        <span style={{ color: 'var(--text-primary)' }}>{hospitalName}</span>
                    </p>

                    <div className="card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            {/* Icon */}
                            <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'var(--accent-bg)', border: '2px solid rgba(11,158,135,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>🏥</div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                    <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>{hospitalName}</h1>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>📍 {address}</p>

                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>📍 {cityName}, {stateName}</span>
                                    {doctorsList.length > 0 && <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>👨‍⚕️ {doctorsList.length} doctors</span>}
                                </div>
                            </div>

                            <motion.button 
                                onClick={handleBookClick}
                                whileHover={{ scale: 1.02 }} 
                                style={{ padding: '11px 22px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(11,158,135,0.3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                {isUserAuthenticated && userRole === 'patient' ? 'Book via QueueEase →' : 'Register on QueueEase →'}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* ── Main content: 2-col layout ─────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
                    {/* LEFT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* About */}
                        {hospital.about && (
                            <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>About</h2>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>{hospital.about}</p>
                            </motion.div>
                        )}

                        {/* Specialties */}
                        {doctorsList.length > 0 && (
                            <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>Specialties</h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {[...new Set(doctorsList.map(d => d.specialization))].map(specialty => (
                                        <span key={specialty} style={{ padding: '7px 14px', borderRadius: '20px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.2)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--accent-dark)' }}>{specialty}</span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Doctors at this hospital */}
                        {doctorsList.length > 0 && (
                            <motion.div id="doctors-section" className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
                                    Doctors at this hospital <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({doctorsList.length})</span>
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {doctorsList.map(doc => {
                                        // Use the slug from API response; fallback to client-generated slug if missing
                                        const doctorSlug = doc.slug || (() => {
                                            const nameWithoutTitle = doc.full_name.replace(/^Dr\.\s*/i, '').trim();
                                            return `dr-${nameWithoutTitle.toLowerCase().replace(/\s+/g, '-')}`;
                                        })();
                                        return (
                                            <Link key={doc.id} to={`/patient/book/${doctorSlug}`} style={{ textDecoration: 'none' }}>
                                                <motion.div whileHover={{ x: 4 }} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', transition: 'border-color 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(11,158,135,0.3)'}
                                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                                >
                                                    <Avatar initials={doc.full_name.split(' ').slice(1).map(n => n[0]).join('').slice(0, 2)} size={44} />
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{doc.full_name}</p>
                                                        <p style={{ fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 500 }}>{doc.specialization}</p>
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                                                            {doc.experience > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{doc.experience} yrs exp</p>}
                                                            {doc.consultation_fee && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>• ₹{doc.consultation_fee} consultation</p>}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, whiteSpace: 'nowrap' }}>Book →</div>
                                                </motion.div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* RIGHT sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Quick info */}
                        <motion.div className="card" style={{ padding: '20px' }} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Hospital Info</h3>
                            <InfoRow icon="📞" label="Phone" value={phone} />
                            <InfoRow icon="📍" label="City" value={`${cityName}, ${stateName}`} />
                            {hospital.total_staff_count && <InfoRow icon="👥" label="Staff" value={hospital.total_staff_count} />}
                        </motion.div>

                        {/* CTA card */}
                        <motion.div style={{ padding: '24px', borderRadius: '16px', background: 'linear-gradient(135deg, #f0fdfb 0%, #ffffff 100%)', border: '1.5px solid rgba(11,158,135,0.25)' }} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            {isUserAuthenticated && userRole !== 'patient' ? (
                                // Healthcare provider (hospital/doctor/chemist/admin logged in)
                                <>
                                    <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Hospital Profile</p>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>You're logged in as a healthcare provider. Patients can book appointments with doctors at this hospital.</p>
                                </>
                            ) : (
                                // Patient or not authenticated
                                <>
                                    <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Book an appointment</p>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>Get a digital token and skip the waiting room.</p>
                                    {isUserAuthenticated && userRole === 'patient' ? (
                                        // Logged in as patient - direct booking button
                                        <button 
                                            onClick={handleBookClick}
                                            style={{ width: '100%', padding: '11px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 3px 10px rgba(11,158,135,0.3)' }}>
                                            Book via QueueEase →
                                        </button>
                                    ) : (
                                        // Not logged in - registration button
                                        <Link to="/register" style={{ textDecoration: 'none' }}>
                                            <button style={{ width: '100%', padding: '11px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 3px 10px rgba(11,158,135,0.3)' }}>
                                                Register on QueueEase →
                                            </button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
