import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDoctorById, getHospitalById } from '../data/mockData';
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

function Avatar({ initials, size = 80 }) {
    const colors = ['#0b9e87', '#5865f2', '#e11d48', '#7c3aed', '#0ea5e9'];
    const idx = initials.charCodeAt(0) % colors.length;
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: colors[idx] + '15', border: `3px solid ${colors[idx]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.32, fontWeight: 800, color: colors[idx], flexShrink: 0 }}>
            {initials}
        </div>
    );
}

function InfoChip({ icon, label }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '20px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            <span>{icon}</span>{label}
        </div>
    );
}

export default function DoctorDetailPage() {
    const { id } = useParams();
    const doc = getDoctorById(id);
    const hospital = doc ? getHospitalById(doc.hospitalId) : null;

    if (!doc) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '3rem' }}>👨‍⚕️</p>
                <h2 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Doctor not found</h2>
                <Link to="/doctors"><button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Browse doctors</button></Link>
            </div>
        );
    }

    const initials = doc.name.split(' ').slice(1).map(n => n[0]).join('').slice(0, 2);

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
                    <Link to="/hospitals" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 12px' }}>Hospitals</Link>
                    <Link to="/doctors" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', padding: '6px 12px' }}>← Doctors</Link>
                </nav>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to="/login"><button className="btn-ghost" style={{ padding: '7px 16px', fontSize: '0.8125rem', width: 'auto' }}>Sign in</button></Link>
                    <Link to="/register"><button style={{ padding: '7px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Get started</button></Link>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
                {/* Breadcrumb */}
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
                    {' '} · {' '}
                    <Link to="/doctors" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Doctors</Link>
                    {' '} · {' '}
                    <span style={{ color: 'var(--text-primary)' }}>{doc.name}</span>
                </p>

                {/* ── Hero profile card ─────────────────────── */}
                <motion.div className="card" style={{ padding: '32px', marginBottom: '24px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <Avatar initials={initials} size={88} />

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>{doc.name}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.25)', borderRadius: '20px', padding: '3px 10px' }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#0b9e87"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent-dark)' }}>Verified</span>
                                </div>
                            </div>

                            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-dark)', marginBottom: '2px' }}>{doc.specialty}</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{doc.designation}</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                                <InfoChip icon="🏥" label={doc.hospital} />
                                <InfoChip icon="📍" label={`${doc.city}, ${doc.state}`} />
                                <InfoChip icon="🕐" label={doc.timings} />
                            </div>

                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <StarRating rating={doc.rating} />
                                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{doc.rating}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>({doc.reviewCount} reviews)</span>
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>·</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{doc.experience} yrs experience</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>·</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{doc.patients} patients treated</span>
                            </div>
                        </div>

                        {/* Right: fee + book */}
                        <div style={{ flexShrink: 0, textAlign: 'center' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Consultation fee</p>
                            <p style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>₹{doc.fee}</p>
                            <Link to="/register" style={{ textDecoration: 'none' }}>
                                <motion.button whileHover={{ scale: 1.02 }} style={{ padding: '11px 22px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(11,158,135,0.3)', whiteSpace: 'nowrap' }}>
                                    Book via QueueEase →
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* ── Main 2-col layout ─────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
                    {/* LEFT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* About */}
                        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>About Dr. {doc.name.split(' ').slice(-1)[0]}</h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>{doc.about}</p>
                        </motion.div>

                        {/* Education */}
                        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>Education & Training</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {doc.education.map((e, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', marginTop: '6px', flexShrink: 0 }} />
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{e}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Hospital Detail */}
                        {hospital && (
                            <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Hospital</h2>
                                <Link to={`/hospitals/${hospital.id}`} style={{ textDecoration: 'none' }}>
                                    <motion.div whileHover={{ x: 3 }} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(11,158,135,0.3)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                    >
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>🏥</div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{hospital.name}</p>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>📍 {hospital.city}, {hospital.state}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{hospital.beds} beds · Est. {hospital.established}</p>
                                        </div>
                                        <span style={{ color: 'var(--accent)', fontSize: '0.8125rem', fontWeight: 600 }}>View →</span>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        )}

                        {/* Reviews */}
                        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Patient Reviews</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {doc.reviews.map((r, i) => (
                                    <div key={i} style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-bg)', border: '1.5px solid rgba(11,158,135,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-dark)' }}>
                                                    {r.author.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{r.author}</p>
                                                    <StarRating rating={r.rating} size={11} />
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.date}</span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, fontStyle: 'italic' }}>"{r.text}"</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Stats */}
                        <motion.div className="card" style={{ padding: '20px' }} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>Quick Stats</h3>
                            {[
                                { label: 'Experience', value: `${doc.experience} years` },
                                { label: 'Patients', value: doc.patients },
                                { label: 'Rating', value: `${doc.rating} / 5.0` },
                                { label: 'Reviews', value: doc.reviewCount },
                            ].map(s => (
                                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{s.label}</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</span>
                                </div>
                            ))}
                        </motion.div>

                        {/* Languages */}
                        <motion.div className="card" style={{ padding: '20px' }} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Languages</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {doc.languages.map(l => (
                                    <span key={l} style={{ padding: '5px 12px', borderRadius: '20px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.15)', fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 500 }}>{l}</span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Timings */}
                        <motion.div className="card" style={{ padding: '20px' }} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>Availability</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>🕐 {doc.timings}</p>
                        </motion.div>

                        {/* Book CTA */}
                        <motion.div style={{ padding: '24px', borderRadius: '16px', background: 'linear-gradient(135deg, #f0fdfb 0%, #ffffff 100%)', border: '1.5px solid rgba(11,158,135,0.25)' }} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Book an appointment</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>Get a QueueEase token for {doc.name}'s next available slot.</p>
                            <Link to="/register" style={{ textDecoration: 'none' }}>
                                <button style={{ width: '100%', padding: '11px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 3px 10px rgba(11,158,135,0.3)' }}>
                                    Register on QueueEase →
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
