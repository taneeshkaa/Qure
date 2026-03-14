import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SparkleCanvas from '../components/SparkleCanvas';

const steps = [
    {
        role: 'Hospital',
        emoji: '🏥',
        color: '#0b9e87',
        items: [
            { num: '01', title: 'Register your hospital', desc: 'Create a QueueEase account, add your departments, doctors, and working hours. Takes under 5 minutes.' },
            { num: '02', title: 'Go live instantly', desc: 'Your hospital is immediately discoverable by patients in your region. No code, no IT team needed.' },
            { num: '03', title: 'Receive appointments', desc: 'Patients book digital tokens. You see your daily schedule in real time. No more crowded OPDs.' },
            { num: '04', title: 'Monitor performance', desc: 'Access analytics on patient flow, peak hours, and doctor efficiency right from your dashboard.' },
        ],
    },
    {
        role: 'Patient',
        emoji: '🧑‍⚕️',
        color: '#5865f2',
        items: [
            { num: '01', title: 'Find your doctor or hospital', desc: 'Search by state, city, or specialty. View verified reviews and real doctor profiles.' },
            { num: '02', title: 'Book a digital token', desc: 'Pick a slot, register or sign in, get a digital token number on your phone instantly.' },
            { num: '03', title: 'Arrive on time — no waiting', desc: 'Get SMS alerts when your turn is approaching. Arrive just in time and walk straight in.' },
            { num: '04', title: 'Receive a digital prescription', desc: 'Your prescription is sent digitally to your preferred pharmacy. Collect it with a QR scan.' },
        ],
    },
    {
        role: 'Doctor',
        emoji: '👨‍⚕️',
        color: '#0ea5e9',
        items: [
            { num: '01', title: 'See your daily queue', desc: 'Your QueueEase dashboard shows all booked patients for the day — their name, age, and any notes.' },
            { num: '02', title: 'Access patient history', desc: 'With patient consent, view their medical history, allergies, and emergency contact before the consultation.' },
            { num: '03', title: 'Write digital prescriptions', desc: 'Tap to write a prescription. It is instantly sent to the patient\'s phone and their selected pharmacy.' },
            { num: '04', title: 'Manage your availability', desc: 'Update your available hours from anywhere. Patients see your real-time availability.' },
        ],
    },

];

function SharedNav() {
    return (
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <div className="logo-mark" style={{ width: 32, height: 32, borderRadius: '9px' }}><svg width="17" height="17" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" /></svg></div>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>QueueEase</span>
            </Link>
            <nav style={{ display: 'flex', gap: '12px' }}>
                <Link to="/hospitals" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 12px' }}>Hospitals</Link>
                <Link to="/doctors" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 12px' }}>Doctors</Link>
                <Link to="/how-it-works" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', padding: '6px 12px', background: 'var(--accent-bg)', borderRadius: '8px' }}>How it works</Link>
            </nav>
            <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/login"><button className="btn-ghost" style={{ padding: '7px 16px', fontSize: '0.8125rem', width: 'auto' }}>Sign in</button></Link>
                <Link to="/register"><button style={{ padding: '7px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Get started</button></Link>
            </div>
        </div>
    );
}

export default function HowItWorksPage() {
    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2 }}>
            <SparkleCanvas />
            <SharedNav />

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '56px 24px 80px' }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '16px' }}>⚡ Simple, fast, paperless</div>
                    <h1 style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        How QueueEase works
                    </h1>
                    <p className="t-body" style={{ maxWidth: '520px', margin: '0 auto', fontSize: '1rem' }}>
                        QueueEase simplifies healthcare for every stakeholder — hospitals, patients, and doctors. Here's how each journey works.
                    </p>
                </motion.div>

                {/* Role sections */}
                {steps.map((section, si) => (
                    <motion.div
                        key={section.role}
                        initial={{ opacity: 0, y: 32 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: si * 0.05 }}
                        style={{ marginBottom: '56px' }}
                    >
                        {/* Section label */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: section.color + '15', border: `2px solid ${section.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                                {section.emoji}
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>For {section.role}s</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', position: 'relative' }}>
                            {/* Connector */}
                            <div style={{ position: 'absolute', top: '22px', left: '12.5%', right: '12.5%', height: '2px', background: `linear-gradient(90deg, ${section.color}20, ${section.color}50, ${section.color}20)`, zIndex: 0 }} />

                            {section.items.map((item, i) => (
                                <motion.div
                                    key={item.num}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.35, delay: si * 0.05 + i * 0.08 }}
                                    className="card"
                                    whileHover={{ y: -4, boxShadow: `0 10px 28px ${section.color}18` }}
                                    style={{ padding: '20px', position: 'relative', zIndex: 1, transition: 'border-color 0.2s, box-shadow 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = section.color + '40'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: section.color + '15', border: `2px solid ${section.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', boxShadow: `0 0 0 5px ${section.color}08` }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: section.color }}>{i + 1}</span>
                                    </div>
                                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.3 }}>{item.title}</h3>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {/* Final CTA */}
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card" style={{ padding: '40px', textAlign: 'center', background: 'linear-gradient(135deg, #f0fdfb 0%, #ffffff)', borderColor: 'rgba(11,158,135,0.2)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Ready to try it?</h2>
                    <p className="t-body" style={{ marginBottom: '24px' }}>Join hospitals, doctors, and patients already using QueueEase across India.</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <button style={{ padding: '12px 26px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(11,158,135,0.3)' }}>Register now →</button>
                        </Link>
                        <Link to="/hospitals" style={{ textDecoration: 'none' }}>
                            <button className="btn-secondary" style={{ padding: '12px 26px', fontSize: '0.9375rem', width: 'auto' }}>Browse hospitals</button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
