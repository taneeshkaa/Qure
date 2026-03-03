import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SparkleCanvas from '../../components/SparkleCanvas';
import DoctorNav from '../../components/DoctorNav';
import useSocket from '../../hooks/useSocket';
import { getPatientCard, sendPrescription } from '../../api/consultation';

/* Fallback generic patient shown while loading or on error */
const DEFAULT_PATIENT = {
    tokenNumber: '—', name: 'Loading...', age: '—', gender: '—',
    bloodGroup: '—', allergies: [], chronicDiseases: [],
    problem: 'Fetching patient data...',
    phone: '—', attachments: [], bookedAt: '—', hospital_id: null,
};

/* Map backend response shape → component shape */
function mapPatient(data) {
    if (!data) return DEFAULT_PATIENT;
    return {
        tokenNumber: data.token_number ?? data.id,
        name: data.patient?.full_name ?? '—',
        age: data.patient?.age ?? '—',
        gender: data.patient?.gender ?? '—',
        bloodGroup: data.patient?.blood_group ?? '—',
        allergies: data.patient?.medicalProfile?.allergies
            ? data.patient.medicalProfile.allergies.split(',').map(s => s.trim())
            : [],
        chronicDiseases: data.patient?.medicalProfile?.notes
            ? [data.patient.medicalProfile.notes]
            : [],
        problem: data.condition_notes ?? 'No description provided.',
        phone: data.patient?.phone ?? '—',
        attachments: (data.attachments ?? []).map(a => ({
            type: a.file_type?.split('/')[1] ?? 'file',
            name: a.file_url?.split('/').pop() ?? 'attachment',
            url: a.file_url,
            icon: a.file_type?.startsWith('image') ? '🖼️' : '📄',
        })),
        bookedAt: data.appointment_date
            ? new Date(data.appointment_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
            : '—',
        hospital_id: data.doctor?.hospital_id ?? null,
        doctorId: data.doctor_id ?? null,
        appointmentId: data.id ?? null,
    };
}

export default function ConsultationHub() {
    const { tokenId } = useParams();
    const navigate = useNavigate();

    const [patient, setPatient] = useState(DEFAULT_PATIENT);
    const [loadError, setLoadError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const { socket, connected } = useSocket(patient.hospital_id);

    const [prescription, setPrescription] = useState('');
    const [sendStatus, setSendStatus] = useState('idle'); // idle | sending | sent | error
    const [sendError, setSendError] = useState('');
    const [draftSaved, setDraftSaved] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const textareaRef = useRef(null);

    /* ── Fetch patient card from backend on mount ─────────────── */
    useEffect(() => {
        let cancelled = false;
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        setIsLoading(true);
        setLoadError('');

        getPatientCard(tokenId, user.id)
            .then(res => {
                if (cancelled) return;
                setPatient(mapPatient(res.data?.appointment ?? res.data));
            })
            .catch(err => {
                if (cancelled) return;
                setLoadError(err.message || 'Failed to load patient data.');
                // Keep DEFAULT_PATIENT so UI doesn't crash
            })
            .finally(() => { if (!cancelled) setIsLoading(false); });

        return () => { cancelled = true; };
    }, [tokenId]);

    /* Save draft to localStorage on network drop */
    useEffect(() => {
        if (!connected && prescription.trim().length > 0) {
            localStorage.setItem(`draft_${tokenId}`, prescription);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDraftSaved(true);
        }
    }, [connected, prescription, tokenId]);

    /* Restore draft on mount */
    useEffect(() => {
        const saved = localStorage.getItem(`draft_${tokenId}`);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (saved) { setPrescription(saved); setDraftSaved(true); }
    }, [tokenId]);

    const handleSend = async () => {
        if (!prescription.trim()) {
            textareaRef.current?.focus();
            return;
        }
        setSendStatus('sending');
        setSendError('');

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            // Save prescription to backend
            await sendPrescription(tokenId, user.id, prescription);

            // Emit real-time event to chemist via WebSocket
            if (socket && connected) {
                socket.emit('new-prescription', {
                    tokenId,
                    tokenNumber: patient.tokenNumber,
                    patientName: patient.name,
                    patientPhone: patient.phone,
                    prescriptionText: prescription,
                    hospitalId: patient.hospital_id,
                    timestamp: new Date().toISOString(),
                });
            }

            localStorage.removeItem(`draft_${tokenId}`);
            setDraftSaved(false);
            setSendStatus('sent');
        } catch (err) {
            setSendStatus('error');
            setSendError(err.message || 'Failed to send prescription. Please retry.');
        }
    };

    const handleComplete = () => {
        navigate('/doctor/dashboard');
    };

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2, background: '#f8fffe' }}>
            <SparkleCanvas />
            <DoctorNav active="/doctor/consultation" />

            {/* ── Connection status banner ───────────────────────── */}
            <AnimatePresence>
                {!connected && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        style={{ background: 'rgba(244,63,94,0.08)', borderBottom: '1px solid rgba(244,63,94,0.2)', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#be123c' }}>
                            ⚠️ Real-time connection lost. {draftSaved ? 'Draft saved locally — will sync when reconnected.' : 'Reconnecting...'}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px 80px' }}>

                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <Link to="/doctor/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Queue</Link>
                    <span>·</span>
                    <span style={{ color: 'var(--text-primary)' }}>Token #{patient.tokenNumber} — {patient.name}</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: connected ? '#0b9e87' : '#f43f5e', animation: connected ? 'pulse 2s infinite' : 'none' }} />
                        <span style={{ fontSize: '0.75rem', color: connected ? 'var(--accent-dark)' : '#dc2626', fontWeight: 500 }}>
                            {connected ? 'Live' : 'Offline'}
                        </span>
                    </div>
                </div>

                {/* ── MAIN SIDE-BY-SIDE LAYOUT ──────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

                    {/* ═══════ LEFT: Patient Live Card ═══════════════════ */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Patient identity card */}
                        <div className="card" style={{ padding: '22px', borderLeft: '4px solid #5865f2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                                    background: 'rgba(88,101,242,0.1)', border: '2px solid rgba(88,101,242,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: 800, color: '#5865f2'
                                }}>
                                    {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>{patient.name}</h2>
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                                            background: 'rgba(88,101,242,0.1)', color: '#5865f2', border: '1px solid rgba(88,101,242,0.2)'
                                        }}>TOKEN #{patient.tokenNumber}</span>
                                    </div>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        {patient.age} years · {patient.gender} · Arrived: {patient.bookedAt}
                                    </p>
                                </div>
                            </div>

                            {/* Vitals grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                                {[
                                    { label: 'Blood Group', value: patient.bloodGroup, icon: '🩸', highlight: true },
                                    { label: 'Gender', value: patient.gender, icon: '👤', highlight: false },
                                ].map(v => (
                                    <div key={v.label} style={{
                                        padding: '10px 12px', borderRadius: '10px',
                                        background: v.highlight ? 'rgba(244,63,94,0.06)' : 'var(--bg-elevated)',
                                        border: v.highlight ? '1px solid rgba(244,63,94,0.2)' : '1px solid var(--border)'
                                    }}>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '2px' }}>{v.icon} {v.label}</p>
                                        <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{v.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Allergies */}
                            {patient.allergies.length > 0 && (
                                <div style={{ marginBottom: '12px' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        ⚠️ Known Allergies
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {patient.allergies.map(a => (
                                            <span key={a} style={{
                                                padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                                                background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', color: '#be123c'
                                            }}>{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Chronic diseases */}
                            {patient.chronicDiseases.length > 0 && (
                                <div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b45309', marginBottom: '6px' }}>📋 Chronic Conditions</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {patient.chronicDiseases.map(d => (
                                            <span key={d} style={{
                                                padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                                                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#92400e'
                                            }}>{d}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {patient.allergies.length === 0 && patient.chronicDiseases.length === 0 && (
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No known allergies or chronic conditions.</p>
                            )}
                        </div>

                        {/* Booking context */}
                        <div className="card" style={{ padding: '20px' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                                💬 Patient's Problem Description
                            </p>
                            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, fontStyle: 'italic', borderLeft: '3px solid var(--accent)', paddingLeft: '14px', color: 'var(--text-secondary)' }}>
                                "{patient.problem}"
                            </p>
                        </div>

                        {/* Attachments gallery */}
                        {patient.attachments.length > 0 && (
                            <div className="card" style={{ padding: '20px' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                                    📎 Uploaded Documents
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {patient.attachments.map((att, i) => (
                                        <motion.div key={i} whileHover={{ x: 3 }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '12px 14px', borderRadius: '10px',
                                                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                                cursor: 'pointer'
                                            }}>
                                            <span style={{ fontSize: '1.25rem' }}>{att.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{att.name}</p>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{att.type.toUpperCase()} file</p>
                                            </div>
                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* ═══════ RIGHT: Prescription Input ════════════════ */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '80px' }}>

                        <div className="card" style={{ padding: '24px', borderTop: '4px solid var(--accent)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>✍️ Prescription</h3>
                                {draftSaved && sendStatus === 'idle' && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        style={{ fontSize: '0.75rem', color: '#b45309', background: 'rgba(245,158,11,0.1)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(245,158,11,0.2)', fontWeight: 600 }}>
                                        💾 Draft saved locally
                                    </motion.span>
                                )}
                            </div>

                            <textarea
                                ref={textareaRef}
                                value={prescription}
                                onChange={e => { setPrescription(e.target.value); setCharCount(e.target.value.length); setSendStatus('idle'); }}
                                placeholder={`Write medicines, dosage, tests ordered...\n\nExample:\n• Tab. Amoxicillin 500mg — 1-0-1 × 5 days\n• Tab. Paracetamol 650mg — SOS\n• CBC + ESR test\n\nAdvice: REST, warm compress, follow-up in 1 week.`}
                                style={{
                                    width: '100%', minHeight: '280px',
                                    border: sendStatus === 'error' ? '2px solid rgba(244,63,94,0.5)' : '1.5px solid var(--border)',
                                    borderRadius: '12px', padding: '16px',
                                    fontSize: '0.9rem', color: 'var(--text-primary)',
                                    fontFamily: 'Inter, sans-serif', lineHeight: 1.7,
                                    resize: 'vertical', outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                    background: sendStatus === 'sent' ? 'rgba(11,158,135,0.03)' : 'white',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(11,158,135,0.1)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                                disabled={sendStatus === 'sent'}
                            />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', marginBottom: '20px' }}>
                                <p style={{ fontSize: '0.75rem', color: charCount > 20 ? 'var(--accent-dark)' : 'var(--text-muted)' }}>
                                    {charCount} characters
                                </p>
                                {sendStatus === 'error' && (
                                    <p style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 500 }}>⚠️ Failed to send. Please retry.</p>
                                )}
                            </div>

                            {/* Send button */}
                            <AnimatePresence mode="wait">
                                {sendStatus !== 'sent' ? (
                                    <motion.button key="send"
                                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                        whileHover={sendStatus !== 'sending' ? { scale: 1.02, y: -2 } : {}}
                                        whileTap={sendStatus !== 'sending' ? { scale: 0.98 } : {}}
                                        onClick={handleSend}
                                        disabled={sendStatus === 'sending' || !prescription.trim()}
                                        style={{
                                            width: '100%', padding: '14px',
                                            background: sendStatus === 'sending' ? 'rgba(11,158,135,0.6)' : !prescription.trim() ? '#ccc' : 'var(--accent)',
                                            color: 'white', border: 'none', borderRadius: '12px',
                                            fontWeight: 700, fontSize: '1rem', cursor: sendStatus === 'sending' || !prescription.trim() ? 'not-allowed' : 'pointer',
                                            fontFamily: 'Inter, sans-serif',
                                            boxShadow: prescription.trim() ? '0 4px 14px rgba(11,158,135,0.35)' : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            transition: 'all 0.2s'
                                        }}>
                                        {sendStatus === 'sending' ? (
                                            <>
                                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                                    style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                                Sending to Chemist...
                                            </>
                                        ) : '💊 Send to Chemist →'}
                                    </motion.button>
                                ) : (
                                    <motion.div key="sent"
                                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                        style={{
                                            width: '100%', padding: '14px',
                                            background: 'rgba(11,158,135,0.08)', border: '2px solid rgba(11,158,135,0.3)',
                                            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b9e87" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span style={{ fontWeight: 700, color: 'var(--accent-dark)', fontSize: '0.9375rem' }}>Sent to Chemist ✓</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {sendStatus === 'sent' && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                    style={{ marginTop: '14px' }}>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '12px' }}>
                                        Prescription delivered. Mark consultation as complete?
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleComplete}
                                        style={{
                                            width: '100%', padding: '12px',
                                            background: '#5865f2', color: 'white', border: 'none', borderRadius: '10px',
                                            fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer',
                                            fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(88,101,242,0.3)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}>
                                        ✅ Complete &amp; Call Next
                                    </motion.button>
                                </motion.div>
                            )}
                        </div>

                        {/* Quick tips */}
                        <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.2)' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '8px' }}>💡 Quick format guide</p>
                            {[
                                'Drug Name Strength — Frequency × Duration',
                                'Tab. / Cap. / Syp. / Inj. prefixes',
                                'Tests: mention specific panels (CBC, LFT, etc.)',
                                'Advice section at the end',
                            ].map(tip => (
                                <p key={tip} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>• {tip}</p>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
