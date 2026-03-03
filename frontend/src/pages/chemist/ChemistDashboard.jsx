import { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SparkleCanvas from '../../components/SparkleCanvas';
import ChemistNav from '../../components/ChemistNav';
import useSocket from '../../hooks/useSocket';
import { getChemistQueue, verifyAndDeliver } from '../../api/consultation';

/* Chemist ID comes from the logged-in session */
const HOSPITAL_ID = JSON.parse(localStorage.getItem('user') || '{}')?.hospital_id ?? null;
const CHEMIST_ID = JSON.parse(localStorage.getItem('user') || '{}')?.chemist_id
    ?? JSON.parse(localStorage.getItem('user') || '{}')?.id
    ?? null;

/* Map backend prescription shape → local queue shape */
function mapRx(rx) {
    return {
        id: String(rx.id),
        tokenNumber: rx.appointment?.token_number ?? rx.appointment_id,
        prescriptionText: rx.prescription_text ?? '',
        status: rx.status?.toLowerCase() ?? 'pending',
        timestamp: rx.createdAt
            ? new Date(rx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            : '—',
        patientName: rx.appointment?.patient?.full_name ?? 'Unknown',
        patientPhone: rx.appointment?.patient?.phone ?? '—',
        verified: rx.verified ?? false,
        mismatch: false,
    };
}

const STATUS_CONFIG = {
    pending: { label: 'Pending', icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', next: 'packing', nextLabel: '→ Start Packing' },
    packing: { label: 'Packing', icon: '📦', color: '#5865f2', bg: 'rgba(88,101,242,0.08)', border: 'rgba(88,101,242,0.25)', next: 'ready', nextLabel: '→ Mark Ready' },
    ready: { label: 'Ready', icon: '✅', color: '#0b9e87', bg: 'rgba(11,158,135,0.08)', border: 'rgba(11,158,135,0.25)', next: null, nextLabel: null },
};

const COLUMN_ORDER = ['pending', 'packing', 'ready'];

export default function ChemistDashboard() {
    const { socket, connected } = useSocket(HOSPITAL_ID);
    const [queue, setQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [verifying, setVerifying] = useState(null);  // prescriptionId being verified
    const [nameInput, setNameInput] = useState('');

    /* ── Load real queue from backend on mount ──────────────── */
    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);

        getChemistQueue(CHEMIST_ID)
            .then(res => {
                if (cancelled) return;
                const rows = res.data?.prescriptions ?? res.data ?? [];
                setQueue(rows.map(mapRx));
            })
            .catch(err => {
                if (cancelled) return;
                toast.error(`⚠️ Failed to load queue: ${err.message}`, { autoClose: 6000 });
            })
            .finally(() => { if (!cancelled) setIsLoading(false); });

        return () => { cancelled = true; };
    }, []);

    /* ── Real-time prescription listener ─────────────────────────── */
    useEffect(() => {
        if (!socket) return;

        const handleNewPrescription = (data) => {
            const newCard = {
                id: `rx_${Date.now()}`,
                tokenNumber: data.tokenNumber,
                prescriptionText: data.prescriptionText,
                status: 'pending',
                timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                patientName: data.patientName,
                patientPhone: data.patientPhone,
                verified: false,
                mismatch: false,
            };

            setQueue(prev => [newCard, ...prev]);

            toast.success(`💊 New prescription — Token #${data.tokenNumber}`, {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                style: { fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' },
            });
        };

        socket.on('new-prescription', handleNewPrescription);
        return () => socket.off('new-prescription', handleNewPrescription);
    }, [socket]);

    /* ── Status toggle ───────────────────────────────────────────── */
    const advanceStatus = async (id) => {
        const rx = queue.find(r => r.id === id);
        if (!rx) return;
        const nextStatus = STATUS_CONFIG[rx.status]?.next;
        if (!nextStatus) return;

        // Optimistic UI update first
        setQueue(prev => prev.map(r =>
            r.id === id ? { ...r, status: nextStatus } : r
        ));

        try {
            await verifyAndDeliver(id, rx.patientName);
        } catch (err) {
            // Rollback on failure
            setQueue(prev => prev.map(r =>
                r.id === id ? { ...r, status: rx.status } : r
            ));
            toast.error(`⚠️ Status update failed: ${err.message}`);
        }
    };

    /* ── Anti-scam verification ──────────────────────────────────── */
    const startVerify = (id) => {
        setVerifying(id);
        setNameInput('');
    };

    const confirmVerify = (rx) => {
        const providedName = nameInput.trim().toLowerCase();
        const actualName = rx.patientName.trim().toLowerCase();
        const match = providedName === actualName || actualName.includes(providedName) || providedName.includes(actualName.split(' ')[0].toLowerCase());

        setQueue(prev => prev.map(r =>
            r.id === rx.id ? { ...r, verified: true, mismatch: !match } : r
        ));
        setVerifying(null);
        setNameInput('');

        if (!match) {
            toast.error(`⚠️ Name mismatch for Token #${rx.tokenNumber}! Do NOT hand over medicine.`, {
                autoClose: 8000,
                style: { fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' },
            });
        }
    };

    const columns = COLUMN_ORDER.map(status => ({
        status,
        config: STATUS_CONFIG[status],
        items: queue.filter(rx => rx.status === status),
    }));

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2, background: '#f8fffe' }}>
            <SparkleCanvas />
            <ToastContainer />
            <ChemistNav active="/chemist/dashboard" />

            {/* Connection warning */}
            <AnimatePresence>
                {!connected && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        style={{ background: 'rgba(244,63,94,0.08)', borderBottom: '1px solid rgba(244,63,94,0.2)', padding: '8px 24px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#be123c' }}>
                            ⚠️ Real-time connection lost — new prescriptions may be delayed. Reconnecting...
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>

                {/* ── Header ───────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Pharmacy Operations</p>
                        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
                            Prescription Queue
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {queue.length} active · {queue.filter(r => r.status === 'ready').length} ready for pickup
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', background: connected ? 'rgba(11,158,135,0.08)' : 'rgba(244,63,94,0.08)', border: `1px solid ${connected ? 'rgba(11,158,135,0.25)' : 'rgba(244,63,94,0.25)'}` }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#0b9e87' : '#f43f5e', animation: connected ? 'pulse 2s infinite' : 'none' }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: connected ? 'var(--accent-dark)' : '#dc2626' }}>
                            {connected ? 'Live — Real-time sync active' : 'Offline mode'}
                        </span>
                    </div>
                </motion.div>

                {/* ── Kanban Board ─────────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start' }}>
                    {columns.map((col, ci) => (
                        <motion.div key={col.status}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.08 }}>

                            {/* Column header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '12px 16px', borderRadius: '12px 12px 0 0',
                                background: col.config.bg, border: `1px solid ${col.config.border}`,
                                borderBottom: 'none', marginBottom: '0'
                            }}>
                                <span style={{ fontSize: '1rem' }}>{col.config.icon}</span>
                                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: col.config.color }}>{col.config.label}</span>
                                <span style={{
                                    marginLeft: 'auto', width: 22, height: 22, borderRadius: '50%',
                                    background: col.config.color, color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                                }}>{col.items.length}</span>
                            </div>

                            {/* Cards column */}
                            <div style={{
                                minHeight: '200px', display: 'flex', flexDirection: 'column', gap: '10px',
                                padding: '10px 12px 12px',
                                background: 'rgba(0,0,0,0.02)',
                                border: `1px solid ${col.config.border}`,
                                borderTop: 'none', borderRadius: '0 0 12px 12px'
                            }}>
                                <AnimatePresence>
                                    {col.items.length === 0 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                            No prescriptions here
                                        </motion.div>
                                    )}

                                    {col.items.map(rx => {
                                        const isExpanded = expandedId === rx.id;
                                        const isVerifying = verifying === rx.id;
                                        return (
                                            <motion.div key={rx.id}
                                                layout
                                                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.94 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                                                className="card"
                                                style={{
                                                    padding: '14px 16px',
                                                    background: rx.mismatch ? 'rgba(244,63,94,0.04)' : 'white',
                                                    border: rx.mismatch ? '2px solid rgba(244,63,94,0.4)' : `1px solid var(--border)`,
                                                    borderLeft: rx.mismatch ? '3px solid #f43f5e' : `3px solid ${col.config.color}`,
                                                }}>

                                                {/* Card header — always visible */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                    <div style={{
                                                        padding: '3px 8px', borderRadius: '8px',
                                                        background: col.config.bg, flexShrink: 0
                                                    }}>
                                                        <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: col.config.color }}>#{rx.tokenNumber}</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flex: 1 }}>🕐 {rx.timestamp}</span>
                                                    {rx.mismatch && (
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#dc2626', background: 'rgba(244,63,94,0.1)', padding: '2px 6px', borderRadius: '6px' }}>
                                                            ⚠️ MISMATCH
                                                        </span>
                                                    )}
                                                    <button onClick={() => setExpandedId(isExpanded ? null : rx.id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }}>
                                                        <motion.svg animate={{ rotate: isExpanded ? 180 : 0 }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                        </motion.svg>
                                                    </button>
                                                </div>

                                                {/* Prescription preview (always visible) */}
                                                <p style={{
                                                    fontSize: '0.8125rem', color: 'var(--text-secondary)',
                                                    lineHeight: 1.5, overflow: 'hidden',
                                                    display: '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    whiteSpace: 'pre-line'
                                                }}>
                                                    {rx.prescriptionText}
                                                </p>

                                                {/* Expanded section */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                                                            style={{ overflow: 'hidden' }}>

                                                            {/* Verify / Identity reveal */}
                                                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                                                                {!rx.verified && !isVerifying ? (
                                                                    <div>
                                                                        <div style={{
                                                                            padding: '10px 12px', borderRadius: '8px', marginBottom: '10px',
                                                                            background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)'
                                                                        }}>
                                                                            <p style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                🔒 Patient identity is hidden (Anti-Scam Protection)
                                                                            </p>
                                                                        </div>
                                                                        <button onClick={() => startVerify(rx.id)}
                                                                            style={{
                                                                                width: '100%', padding: '9px', borderRadius: '8px',
                                                                                background: 'rgba(88,101,242,0.1)', border: '1.5px solid rgba(88,101,242,0.3)',
                                                                                color: '#4338ca', fontWeight: 700, fontSize: '0.8125rem',
                                                                                cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                                                                            }}>
                                                                            🔍 Verify Patient Identity
                                                                        </button>
                                                                    </div>
                                                                ) : isVerifying ? (
                                                                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                                                                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                                                            Ask the patient: <em>"What is your name?"</em>
                                                                        </p>
                                                                        <input
                                                                            value={nameInput}
                                                                            onChange={e => setNameInput(e.target.value)}
                                                                            onKeyDown={e => e.key === 'Enter' && confirmVerify(rx)}
                                                                            placeholder="Type name provided by patient..."
                                                                            autoFocus
                                                                            style={{
                                                                                width: '100%', padding: '9px 12px', borderRadius: '8px',
                                                                                border: '1.5px solid var(--border)', outline: 'none',
                                                                                fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
                                                                                marginBottom: '8px', boxSizing: 'border-box'
                                                                            }}
                                                                        />
                                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                                            <button onClick={() => confirmVerify(rx)}
                                                                                style={{
                                                                                    flex: 1, padding: '8px', borderRadius: '8px',
                                                                                    background: 'var(--accent)', color: 'white', border: 'none',
                                                                                    fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer',
                                                                                    fontFamily: 'Inter, sans-serif'
                                                                                }}>Confirm Match</button>
                                                                            <button onClick={() => setVerifying(null)}
                                                                                style={{
                                                                                    padding: '8px 12px', borderRadius: '8px',
                                                                                    background: 'transparent', color: 'var(--text-muted)',
                                                                                    border: '1px solid var(--border)', cursor: 'pointer',
                                                                                    fontFamily: 'Inter, sans-serif'
                                                                                }}>Cancel</button>
                                                                        </div>
                                                                    </motion.div>
                                                                ) : (
                                                                    /* Verified — show identity */
                                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                                        style={{
                                                                            padding: '12px', borderRadius: '8px',
                                                                            background: rx.mismatch ? 'rgba(244,63,94,0.06)' : 'rgba(11,158,135,0.06)',
                                                                            border: `1.5px solid ${rx.mismatch ? 'rgba(244,63,94,0.3)' : 'rgba(11,158,135,0.2)'}`
                                                                        }}>
                                                                        <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                                                                            {rx.mismatch
                                                                                ? <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>⛔ NAME MISMATCH — Do NOT dispense!</span>
                                                                                : <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-dark)' }}>✅ Identity Verified</span>
                                                                            }
                                                                        </div>
                                                                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rx.patientName}</p>
                                                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{rx.patientPhone}</p>
                                                                    </motion.div>
                                                                )}
                                                            </div>

                                                            {/* Status advance button */}
                                                            {col.config.next && (
                                                                <motion.button
                                                                    whileHover={{ y: -1 }}
                                                                    whileTap={{ scale: 0.97 }}
                                                                    onClick={() => advanceStatus(rx.id)}
                                                                    style={{
                                                                        width: '100%', padding: '9px', borderRadius: '8px',
                                                                        marginTop: '10px',
                                                                        background: STATUS_CONFIG[col.config.next].bg,
                                                                        border: `1.5px solid ${STATUS_CONFIG[col.config.next].border}`,
                                                                        color: STATUS_CONFIG[col.config.next].color,
                                                                        fontWeight: 700, fontSize: '0.8125rem',
                                                                        cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                                                                    }}>
                                                                    {col.config.nextLabel}
                                                                </motion.button>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
