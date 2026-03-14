import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getHospitalById, getDoctorsForHospital } from '../data/mockData';
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
    const hospital = getHospitalById(id);
    const relatedDoctors = hospital ? getDoctorsForHospital(hospital.id) : [];

    if (!hospital) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '3rem' }}>🏥</p>
                <h2 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Hospital not found</h2>
                <Link to="/hospitals"><button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Browse hospitals</button></Link>
            </div>
        );
    }

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
                        <span style={{ color: 'var(--text-primary)' }}>{hospital.name}</span>
                    </p>

                    <div className="card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            {/* Icon */}
                            <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'var(--accent-bg)', border: '2px solid rgba(11,158,135,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>🏥</div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                    <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>{hospital.name}</h1>
                                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7125rem', fontWeight: 700, background: hospital.type === 'Government' ? 'rgba(99,102,241,0.08)' : 'var(--accent-bg)', border: `1px solid ${hospital.type === 'Government' ? 'rgba(99,102,241,0.2)' : 'rgba(11,158,135,0.2)'}`, color: hospital.type === 'Government' ? '#4f46e5' : 'var(--accent-dark)' }}>
                                        {hospital.type}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>📍 {hospital.address}</p>

                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <StarRating rating={hospital.rating} />
                                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{hospital.rating}</span>
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>({hospital.reviewCount.toLocaleString()} reviews)</span>
                                    </div>
                                    <span style={{ color: 'var(--border)' }}>·</span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Est. {hospital.established}</span>
                                    <span style={{ color: 'var(--border)' }}>·</span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{hospital.beds} beds</span>
                                </div>
                            </div>

                            <Link to="/register" style={{ textDecoration: 'none', flexShrink: 0 }}>
                                <motion.button whileHover={{ scale: 1.02 }} style={{ padding: '11px 22px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(11,158,135,0.3)', whiteSpace: 'nowrap' }}>
                                    Book via QueueEase →
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* ── Main content: 2-col layout ─────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
                    {/* LEFT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* About */}
                        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>About</h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>{hospital.about}</p>
                        </motion.div>

                        {/* Specialties */}
                        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>Specialties</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {hospital.specialties.map(s => (
                                    <span key={s} style={{ padding: '7px 14px', borderRadius: '20px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.2)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--accent-dark)' }}>{s}</span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Doctors at this hospital */}
                        {relatedDoctors.length > 0 && (
                            <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
                                    Doctors at this hospital <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({relatedDoctors.length})</span>
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {relatedDoctors.map(doc => (
                                        <Link key={doc.id} to={`/doctors/${doc.id}`} style={{ textDecoration: 'none' }}>
                                            <motion.div whileHover={{ x: 4 }} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', transition: 'border-color 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(11,158,135,0.3)'}
                                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                            >
                                                <Avatar initials={doc.name.split(' ').slice(1).map(n => n[0]).join('').slice(0, 2)} size={44} />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{doc.name}</p>
                                                    <p style={{ fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 500 }}>{doc.specialty}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.experience} yrs exp · {doc.patients} patients</p>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                    <StarRating rating={doc.rating} size={12} />
                                                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{doc.fee}</p>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Reviews */}
                        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Patient Reviews</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {hospital.reviews.map((r, i) => (
                                    <div key={i} style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Avatar initials={r.author.split(' ').map(n => n[0]).join('')} size={34} />
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
                        {/* Quick info */}
                        <motion.div className="card" style={{ padding: '20px' }} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Hospital Info</h3>
                            <InfoRow icon="📞" label="Phone" value={hospital.phone} />
                            <InfoRow icon="📍" label="City" value={`${hospital.city}, ${hospital.state}`} />
                            <InfoRow icon="🛏️" label="Total Beds" value={hospital.beds} />
                            <InfoRow icon="📅" label="Established" value={hospital.established} />
                            <InfoRow icon="⭐" label="Rating" value={`${hospital.rating} / 5.0 (${hospital.reviewCount.toLocaleString()} reviews)`} />
                        </motion.div>

                        {/* CTA card */}
                        <motion.div style={{ padding: '24px', borderRadius: '16px', background: 'linear-gradient(135deg, #f0fdfb 0%, #ffffff 100%)', border: '1.5px solid rgba(11,158,135,0.25)' }} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Book an appointment</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>Get a digital token and skip the waiting room.</p>
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
