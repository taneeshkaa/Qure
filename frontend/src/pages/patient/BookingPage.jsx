import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SparkleCanvas from '../../components/SparkleCanvas';
import { PatientNav } from './PatientDashboard';
import { getDoctorById, getHospitalById } from '../../data/mockData';
import { generateSlots } from '../../data/searchData';
import { bookAppointment } from '../../api/search';

function StarRating({ rating, size = 12 }) {
    return <div style={{ display: 'flex', gap: '2px' }}>{[1, 2, 3, 4, 5].map(i => <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f59e0b' : '#d1fae5'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}</div>;
}

export default function BookingPage() {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const doc = getDoctorById(doctorId);
    const hospital = doc ? getHospitalById(doc.hospitalId) : null;
    const slotDays = useMemo(() => doc ? generateSlots(doctorId) : [], [doctorId, doc]);

    const [selectedSlot, setSelectedSlot] = useState(null);
    const [condition, setCondition] = useState('');
    const [conditionError, setConditionError] = useState(false);
    const [selectedDay, setSelectedDay] = useState(0);
    const [isBooking, setIsBooking] = useState(false);
    const [slotError, setSlotError] = useState('');
    const [bookError, setBookError] = useState('');

    if (!doc) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '2.5rem' }}>👨‍⚕️</p>
                <h2 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Doctor not found</h2>
                <Link to="/doctors"><button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Browse Doctors</button></Link>
            </div>
        );
    }

    const currentDay = slotDays[selectedDay];

    const handleBook = async () => {
        if (!condition.trim()) {
            setConditionError(true);
            document.getElementById('condition-box').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (!selectedSlot) {
            setSlotError('Please select a time slot.');
            return;
        }
        setSlotError('');
        setConditionError(false);
        setBookError('');
        setIsBooking(true);

        try {
            // Read patient session if available
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            const res = await bookAppointment({
                doctor_id: parseInt(doc.id, 10) || doc.id,
                patient_id: user.id ?? null,
                appointment_date: selectedSlot.isoDate ?? selectedSlot.date,
                slot_time: selectedSlot.time,
                condition_notes: condition.trim(),
            });

            // Navigate to token card with server-returned data
            const appt = res.data?.appointment ?? {};
            navigate('/patient/token', {
                state: {
                    token: appt.token_number ?? Math.floor(Math.random() * 40) + 1,
                    appointmentId: appt.id,
                    doctor: doc,
                    hospital: hospital?.name,
                    slot: selectedSlot,
                    condition: condition.trim(),
                }
            });
        } catch (err) {
            setBookError(err.message || 'Booking failed. Please try again.');
            setIsBooking(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2, background: '#f8fffe' }}>
            <SparkleCanvas />
            <PatientNav active="/patient/dashboard" />

            <div style={{ maxWidth: '880px', margin: '0 auto', padding: '36px 24px 80px' }}>

                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <Link to="/patient/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
                    <span>·</span>
                    <Link to={`/doctors/${doc.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dr. {doc.name.split(' ').slice(-1)[0]}</Link>
                    <span>·</span>
                    <span style={{ color: 'var(--text-primary)' }}>Book Appointment</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: '24px' }}>

                    {/* ── LEFT: Main booking form ───────────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Doctor summary */}
                        <motion.div className="card" style={{ padding: '20px' }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-bg)', border: '2px solid rgba(11,158,135,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 800, color: 'var(--accent-dark)', flexShrink: 0 }}>
                                    {doc.name.split(' ').slice(1).map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>{doc.name}</h2>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 500 }}>{doc.specialty} · {doc.designation}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>🏥 {doc.hospital}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                                        <StarRating rating={doc.rating} />
                                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{doc.rating}</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.reviewCount} reviews</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* ── Condition textbox ─────────────────────── */}
                        <motion.div className="card" id="condition-box" style={{ padding: '24px', border: conditionError ? '2px solid rgba(239,68,68,0.5)' : '1.5px solid var(--border)', transition: 'border-color 0.3s' }}
                            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Describe your condition <span style={{ color: '#ef4444' }}>*</span></h3>
                                {conditionError && (
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, background: 'rgba(239,68,68,0.08)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        ⚠️ Required
                                    </motion.span>
                                )}
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
                                This helps the doctor prepare for your visit. Be as detailed as possible — duration, severity, related symptoms, etc.
                            </p>
                            <motion.textarea
                                animate={conditionError ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                value={condition}
                                onChange={e => { setCondition(e.target.value); if (e.target.value.trim()) setConditionError(false); }}
                                placeholder="e.g. I've been having recurring chest pain for 3 days, especially after physical activity. Also experiencing slight shortness of breath..."
                                style={{ width: '100%', height: '120px', border: `1.5px solid ${conditionError ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`, borderRadius: '10px', padding: '12px 14px', fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', resize: 'vertical', outline: 'none', transition: 'border-color 0.2s', lineHeight: 1.6, boxSizing: 'border-box' }}
                                onFocus={e => { if (!conditionError) e.target.style.borderColor = 'var(--accent)'; }}
                                onBlur={e => { if (!conditionError) e.target.style.borderColor = 'var(--border)'; }}
                            />
                            <p style={{ fontSize: '0.75rem', color: condition.length > 20 ? 'var(--accent-dark)' : 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>{condition.length} characters</p>
                        </motion.div>

                        {/* ── Slot grid ─────────────────────────────── */}
                        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Choose a date & time</h3>

                            {/* Day tabs */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
                                {slotDays.map((day, i) => (
                                    <button key={day.isoDate} onClick={() => { setSelectedDay(i); setSelectedSlot(null); setSlotError(''); }} style={{ padding: '8px 14px', borderRadius: '10px', border: `1.5px solid ${selectedDay === i ? 'var(--accent)' : 'var(--border)'}`, background: selectedDay === i ? 'var(--accent)' : 'white', color: selectedDay === i ? 'white' : 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0 }}>
                                        {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : day.date}
                                    </button>
                                ))}
                            </div>

                            {/* Slot pills */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                {currentDay?.slots.map(slot => {
                                    const isSelected = selectedSlot?.id === slot.id;
                                    return (
                                        <motion.button key={slot.id} whileHover={!slot.booked ? { y: -2 } : {}} whileTap={!slot.booked ? { scale: 0.96 } : {}}
                                            disabled={slot.booked}
                                            onClick={() => { if (!slot.booked) { setSelectedSlot(slot); setSlotError(''); } }}
                                            style={{ padding: '10px 8px', borderRadius: '9px', border: `1.5px solid ${slot.booked ? 'rgba(0,0,0,0.08)' : isSelected ? 'var(--accent)' : 'var(--border)'}`, background: slot.booked ? '#f5f5f5' : isSelected ? 'var(--accent)' : 'white', color: slot.booked ? '#bbb' : isSelected ? 'white' : 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600, cursor: slot.booked ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: slot.booked ? 'line-through' : 'none', transition: 'all 0.15s', position: 'relative' }}>
                                            {slot.time}
                                            {slot.booked && <span style={{ display: 'block', fontSize: '0.625rem', color: '#ccc', fontWeight: 400, textDecoration: 'none' }}>Booked</span>}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {slotError && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '10px', fontWeight: 500 }}>⚠️ {slotError}</p>}

                            {/* Legend */}
                            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 10, height: 10, borderRadius: '3px', background: 'var(--accent)' }} /> Selected</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 10, height: 10, borderRadius: '3px', background: '#f0f0f0', border: '1px solid #ddd' }} /> Booked</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 10, height: 10, borderRadius: '3px', background: 'white', border: '1.5px solid var(--border)' }} /> Available</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* ── RIGHT: summary + book btn ─────────────── */}
                    <div style={{ position: 'sticky', top: '80px', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Booking summary */}
                        <motion.div className="card" style={{ padding: '20px' }} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>Booking summary</h3>
                            {[
                                { label: 'Doctor', value: doc.name },
                                { label: 'Specialty', value: doc.specialty },
                                { label: 'Hospital', value: doc.hospital },
                                { label: 'Date', value: selectedSlot ? selectedSlot.date : '—' },
                                { label: 'Time', value: selectedSlot ? selectedSlot.time : '—' },
                            ].map(row => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{row.label}</span>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: row.value === '—' ? 'var(--text-muted)' : 'var(--text-primary)', maxWidth: '160px', textAlign: 'right' }}>{row.value}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Consultation fee</span>
                                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>₹{doc.fee}</span>
                            </div>
                        </motion.div>

                        {/* Checklist */}
                        <motion.div style={{ padding: '16px', borderRadius: '12px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.2)' }} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '10px' }}>Before you confirm</p>
                            {[
                                { done: condition.trim().length > 0, label: 'Describe your condition' },
                                { done: !!selectedSlot, label: 'Select a time slot' },
                            ].map(c => (
                                <div key={c.label} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: c.done ? 'var(--accent)' : 'rgba(11,158,135,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {c.done && <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><path d="M9 12l2 2 4-4" /><path fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span style={{ fontSize: '0.8125rem', color: c.done ? 'var(--accent-dark)' : 'var(--text-muted)', fontWeight: c.done ? 600 : 400, textDecoration: c.done ? 'line-through' : 'none' }}>{c.label}</span>
                                </div>
                            ))}
                        </motion.div>

                        {/* Book button */}
                        <motion.button
                            whileHover={!isBooking ? { scale: 1.02, y: -2 } : {}}
                            whileTap={!isBooking ? { scale: 0.98 } : {}}
                            onClick={handleBook}
                            disabled={isBooking}
                            style={{ padding: '14px', background: isBooking ? 'rgba(11,158,135,0.6)' : 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: isBooking ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(11,158,135,0.35)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {isBooking ? (
                                <>
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                    Generating token...
                                </>
                            ) : '🎫 Confirm Booking →'}
                        </motion.button>
                        {bookError && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                style={{ fontSize: '0.8125rem', color: '#dc2626', fontWeight: 500, textAlign: 'center', padding: '8px 12px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', margin: '0' }}>
                                ⚠️ {bookError}
                            </motion.p>
                        )}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>You'll receive a digital token immediately</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
