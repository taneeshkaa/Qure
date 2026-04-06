import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SparkleCanvas from '../../components/SparkleCanvas';
import { PatientNav } from './PatientDashboard';
import { getDoctorById, getHospitalById } from '../../data/mockData';
import { generateSlots } from '../../data/searchData';
import { bookAppointment, getDoctorBySlugAPI } from '../../api/search';

function StarRating({ rating, size = 12 }) {
    return <div style={{ display: 'flex', gap: '2px' }}>{[1, 2, 3, 4, 5].map(i => <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f59e0b' : '#d1fae5'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}</div>;
}

export default function BookingPage() {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    
    // Doctor data state - fetches from API, falls back to mock data
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    
    const hospital = doc ? getHospitalById(doc.hospitalId) : null;
    const slotDays = useMemo(() => doc ? generateSlots(doctorId) : [], [doctorId, doc]);

    // Fetch doctor on component mount
    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                setLoading(true);
                setFetchError(null);
                
                // Try to fetch from API using slug
                console.log(`🔍 Attempting to fetch doctor with slug/ID: ${doctorId}`);
                
                const response = await getDoctorBySlugAPI(doctorId);
                console.log(`✅ Successfully fetched doctor from API:`, response.data);
                
                // Transform API response to match booking page structure
                const apiDoc = response.data;
                if (apiDoc) {
                    // Add hospitalId and name fields for compatibility with booking logic
                    const transformedDoc = {
                        ...apiDoc,
                        id: apiDoc.slug || apiDoc.id,
                        numeric_id: apiDoc.id,
                        name: apiDoc.full_name,
                        hospital: apiDoc.hospital?.hospital_name,
                        hospitalId: apiDoc.hospital?.id,
                        hospitalName: apiDoc.hospital?.hospital_name,
                        specialty: apiDoc.specialization,
                        designation: apiDoc.specialization,
                        fee: apiDoc.consultation_fee || 500,
                    };
                    setDoc(transformedDoc);
                    setLoading(false);
                    return;
                }
            } catch (apiErr) {
                console.warn(`⚠️ API fetch failed: ${apiErr.message}. Trying mock data...`);
                setFetchError(apiErr.message);
            }
            
            // Fallback to mock data if API fails
            try {
                console.log(`📚 Falling back to mock data for: ${doctorId}`);
                const mockDoc = getDoctorById(doctorId);
                if (mockDoc) {
                    console.log(`✅ Found doctor in mock data:`, mockDoc);
                    setDoc(mockDoc);
                } else {
                    console.log(`❌ Doctor not found in mock data either`);
                    setFetchError(`Doctor with id "${doctorId}" not found (API: unavailable, Mock: not found)`);
                }
            } catch (mockErr) {
                console.error(`❌ Mock data fetch error:`, mockErr.message);
                setFetchError(`Failed to load doctor data: ${mockErr.message}`);
            }
            
            setLoading(false);
        };
        
        if (doctorId) {
            fetchDoctor();
        }
    }, [doctorId]);

    // Multi-step form state
    const [currentStep, setCurrentStep] = useState(1); // 1=Condition, 2=Slot, 3=Payment, 4=Confirm
    
    // Form field states
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [condition, setCondition] = useState('');
    const [conditionError, setConditionError] = useState(false);
    const [selectedDay, setSelectedDay] = useState(0);
    const [isBooking, setIsBooking] = useState(false);
    const [slotError, setSlotError] = useState('');
    const [bookError, setBookError] = useState('');
    
    // Payment selection state (Default: CASH for rural-friendly)
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    // Track if user has explicitly confirmed payment method (not just default)
    const [paymentMethodConfirmed, setPaymentMethodConfirmed] = useState(true);

    // Show loading state while fetching doctor data
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '2.5rem', animation: 'spin 1s linear infinite' }}>⏳</div>
                <h2 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Loading doctor information...</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>Fetching details for {doctorId}</p>
            </div>
        );
    }

    // Show error state if doctor is not found
    console.log(`📋 Render check: doc=${!!doc}, loading=${loading}, fetchError=${fetchError}`);
    if (!doc) {
        console.error(`❌ Doctor rendering failed. Reason:`, {
            loading,
            fetchError,
            doctorId,
            attemptedMockData: getDoctorById(doctorId),
        });
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '2.5rem' }}>👨‍⚕️</p>
                <h2 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Doctor not found</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
                    {fetchError || `Unable to load doctor "${doctorId}". Please check the link and try again.`}
                </p>
                <Link to="/doctors"><button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Browse Doctors</button></Link>
            </div>
        );
    }

    const currentDay = slotDays[selectedDay];

    /**
     * Convert 12-hour time format (e.g., "09:00 AM") to 24-hour format (e.g., "09:00")
     */
    const convertTo24HourFormat = (time12h) => {
        if (!time12h || typeof time12h !== 'string') {
            throw new Error('Invalid time format');
        }

        const parts = time12h.trim().split(' ');
        if (parts.length !== 2) {
            throw new Error(`Time must be in format "HH:MM AM/PM", got "${time12h}"`);
        }

        const [time, period] = parts;
        const [hoursStr, minutesStr] = time.split(':');
        
        if (!hoursStr || !minutesStr) {
            throw new Error(`Invalid time format "${time}", expected HH:MM`);
        }

        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 12 || minutes < 0 || minutes > 59) {
            throw new Error(`Invalid time values: hours=${hoursStr}, minutes=${minutesStr}`);
        }

        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        console.log(`⏰ Time conversion: "${time12h}" → "${formatted}"`);
        return formatted;
    };

    // Step validation functions
    const canProceedToStep2 = () => condition.trim().length >= 5;
    const canProceedToStep3 = () => selectedSlot !== null;
    const canProceedToStep4 = () => paymentMethodConfirmed && (paymentMethod === 'UPI' || paymentMethod === 'CASH');

    // Handle step navigation
    const handleNextStep = () => {
        if (currentStep === 1 && !canProceedToStep2()) {
            setConditionError(true);
            document.getElementById('condition-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (currentStep === 2 && !canProceedToStep3()) {
            setSlotError('Please select a time slot.');
            return;
        }
        if (currentStep === 3 && !paymentMethodConfirmed) {
            setBookError('Please select a payment method.');
            return;
        }
        setBookError('');
        setConditionError(false);
        setSlotError('');
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setBookError('');
        setCurrentStep(prev => Math.max(1, prev - 1));
    };

    // Final booking submission
    const handleBook = async () => {
        if (!condition.trim()) {
            setConditionError(true);
            return;
        }
        if (!selectedSlot) {
            setSlotError('Please select a time slot.');
            return;
        }
        if (!paymentMethodConfirmed) {
            setBookError('Please select a payment method.');
            return;
        }

        setSlotError('');
        setConditionError(false);
        setBookError('');
        setIsBooking(true);

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (!doc) {
                throw new Error('❌ Doctor information is not loaded. Please refresh the page and try again.');
            }

            if (!doc.numeric_id) {
                console.error('❌ Doctor object missing numeric_id:', doc);
                throw new Error('❌ Doctor numeric ID is missing. Please refresh the page and try again.');
            }

            if (typeof doc.numeric_id !== 'number' || doc.numeric_id <= 0) {
                console.error('❌ Doctor numeric_id is invalid:', { numeric_id: doc.numeric_id, type: typeof doc.numeric_id });
                throw new Error(`❌ Doctor numeric ID is invalid: expected positive integer, got ${doc.numeric_id}`);
            }

            if (!selectedSlot || !selectedSlot.isoDate || !selectedSlot.time) {
                throw new Error('❌ Selected slot is invalid. Please select a time slot again.');
            }

            if (condition.trim().length < 5) {
                throw new Error('❌ Problem description must be at least 5 characters.');
            }

            console.log('📋 Booking form validation passed');
            console.log('👤 User data:', { id: user.id, role: user.role, email: user.email });
            console.log('👨‍⚕️ Doctor data:', { id: doc.id, numeric_id: doc.numeric_id, name: doc.name });
            console.log('🗓️ Selected slot:', selectedSlot);
            console.log('💳 Payment method:', paymentMethod);

            let time24h;
            try {
                time24h = convertTo24HourFormat(selectedSlot.time);
            } catch (timeErr) {
                throw new Error(`❌ Time format error: ${timeErr.message}`);
            }

            // Build request body with payment fields
            const bookingData = {
                doctor_id: doc.numeric_id,
                patient_id: user.id ? parseInt(user.id, 10) : 1,
                date: selectedSlot.isoDate,
                slot: time24h,
                problem_description: condition.trim(),
                paymentMethod: paymentMethod, // 'UPI' or 'CASH'
                paymentStatus: paymentMethod === 'CASH' ? 'PENDING' : 'PENDING', // Both default to PENDING for now
            };

            // Validate converted data types before sending
            if (typeof bookingData.doctor_id !== 'number' || bookingData.doctor_id <= 0) {
                throw new Error(`❌ Invalid doctor_id: expected positive number, got ${bookingData.doctor_id}`);
            }
            if (typeof bookingData.patient_id !== 'number' || bookingData.patient_id <= 0) {
                throw new Error(`❌ Invalid patient_id: expected positive number, got ${bookingData.patient_id}`);
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingData.date)) {
                throw new Error(`❌ Invalid date format: expected YYYY-MM-DD, got ${bookingData.date}`);
            }
            if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(bookingData.slot)) {
                throw new Error(`❌ Invalid time format: expected HH:MM, got ${bookingData.slot}`);
            }

            console.log('📤 FULL Booking request payload:', JSON.stringify(bookingData, null, 2));
            console.log('📋 Request field types:', {
                doctor_id: typeof bookingData.doctor_id,
                patient_id: typeof bookingData.patient_id,
                date: typeof bookingData.date,
                slot: typeof bookingData.slot,
                problem_description: typeof bookingData.problem_description,
                paymentMethod: typeof bookingData.paymentMethod,
                paymentStatus: typeof bookingData.paymentStatus,
            });

            const res = await bookAppointment(bookingData);

            console.log('✅ Booking successful! Response:', res);

            const appt = res.data?.appointment ?? {};
            navigate('/patient/token', {
                state: {
                    token: appt.token_number ?? Math.floor(Math.random() * 40) + 1,
                    appointmentId: appt.id,
                    doctor: doc,
                    hospital: hospital?.name,
                    slot: selectedSlot,
                    condition: condition.trim(),
                    paymentMethod: paymentMethod,
                }
            });
        } catch (err) {
            console.error('❌ Booking error:', err.message);
            console.error('Full error object:', err);
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

                {/* Step Indicator */}
                <motion.div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '8px' }}>
                    {[1, 2, 3, 4].map((step, idx) => (
                        <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <motion.div
                                animate={{ scale: currentStep === step ? 1.1 : 1 }}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: currentStep >= step ? 'var(--accent)' : 'var(--accent-bg)',
                                    border: `2px solid ${currentStep >= step ? 'var(--accent)' : 'rgba(11,158,135,0.2)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: currentStep >= step ? 'white' : 'var(--text-muted)',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    transition: 'all 0.3s',
                                    flexShrink: 0,
                                }}
                            >
                                {currentStep > step ? '✓' : step}
                            </motion.div>
                            {idx < 3 && (
                                <div style={{
                                    flex: 1,
                                    height: '2px',
                                    background: currentStep > step ? 'var(--accent)' : 'var(--border)',
                                    transition: 'background 0.3s',
                                    marginLeft: '8px',
                                }} />
                            )}
                        </div>
                    ))}
                </motion.div>

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

                        {/* ===== STEP 1: Condition ===== */}
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }}>
                                    <motion.div className="card" id="condition-box" style={{ padding: '24px', border: conditionError ? '2px solid rgba(239,68,68,0.5)' : '1.5px solid var(--border)', transition: 'border-color 0.3s' }}>
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
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ===== STEP 2: Date & Time ===== */}
                        <AnimatePresence mode="wait">
                            {currentStep === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }}>
                                    <motion.div className="card" style={{ padding: '24px' }}>
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
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ===== STEP 3: Payment Method ===== */}
                        <AnimatePresence mode="wait">
                            {currentStep === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }}>
                                    <motion.div className="card" style={{ padding: '24px' }}>
                                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Choose payment method <span style={{ color: '#ef4444' }}>*</span></h3>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                            {/* Pay Now - UPI */}
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => { setPaymentMethod('UPI'); setPaymentMethodConfirmed(true); }}
                                                style={{
                                                    padding: '20px 16px',
                                                    borderRadius: '12px',
                                                    border: `2px solid ${paymentMethod === 'UPI' ? 'var(--accent)' : 'var(--border)'}`,
                                                    background: paymentMethod === 'UPI' ? 'rgba(11,158,135,0.08)' : 'white',
                                                    cursor: 'pointer',
                                                    fontFamily: 'Inter, sans-serif',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                }}
                                            >
                                                <div style={{ fontSize: '2rem' }}>📱</div>
                                                <div>
                                                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Pay Now</h4>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Via UPI / Card</p>
                                                </div>
                                                {paymentMethod === 'UPI' && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: 16, height: 16, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, marginTop: '4px' }}>
                                                        ✓
                                                    </motion.div>
                                                )}
                                            </motion.button>

                                            {/* Pay at Hospital - CASH */}
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => { setPaymentMethod('CASH'); setPaymentMethodConfirmed(true); }}
                                                style={{
                                                    padding: '20px 16px',
                                                    borderRadius: '12px',
                                                    border: `2px solid ${paymentMethod === 'CASH' ? 'var(--accent)' : 'var(--border)'}`,
                                                    background: paymentMethod === 'CASH' ? 'rgba(11,158,135,0.08)' : 'white',
                                                    cursor: 'pointer',
                                                    fontFamily: 'Inter, sans-serif',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                }}
                                            >
                                                <div style={{ fontSize: '2rem' }}>🏥</div>
                                                <div>
                                                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Pay at Hospital</h4>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Cash on arrival</p>
                                                </div>
                                                {paymentMethod === 'CASH' && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: 16, height: 16, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, marginTop: '4px' }}>
                                                        ✓
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        </div>

                                        {paymentMethod === 'UPI' && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '20px', padding: '16px', background: 'var(--accent-bg)', border: '1px solid rgba(11,158,135,0.2)', borderRadius: '10px' }}>
                                                <p style={{ fontSize: '0.8125rem', color: 'var(--accent-dark)', fontWeight: 600, marginBottom: '12px' }}>QR Code for UPI Payment</p>
                                                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                    [UPI QR Code will appear here - Mock placeholder]
                                                </div>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>Scan to complete payment</p>
                                            </motion.div>
                                        )}

                                        {paymentMethod === 'CASH' && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '20px', padding: '14px 16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px' }}>
                                                <p style={{ fontSize: '0.8125rem', color: '#22c55e', fontWeight: 600, margin: 0 }}>✓ Payment will be collected at the hospital during your visit.</p>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ===== STEP 4: Review & Confirm ===== */}
                        <AnimatePresence mode="wait">
                            {currentStep === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }}>
                                    <motion.div className="card" style={{ padding: '24px' }}>
                                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Review your booking</h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                            <div style={{ paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>CONDITION</p>
                                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{condition.trim()}</p>
                                            </div>
                                            <div style={{ paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>DATE & TIME</p>
                                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>{selectedSlot?.date} at {selectedSlot?.time}</p>
                                            </div>
                                            <div style={{ paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>PAYMENT</p>
                                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                                                    {paymentMethod === 'UPI' ? '📱 Pay Now via UPI / Card' : '🏥 Pay at Hospital (Cash on arrival)'}
                                                </p>
                                            </div>
                                        </div>

                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '20px', padding: '14px 16px', background: 'rgba(11,158,135,0.05)', border: '1px solid rgba(11,158,135,0.15)', borderRadius: '10px' }}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>✓ Upon confirmation, you'll receive a digital token number immediately</p>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                { label: 'Payment', value: paymentMethod === 'UPI' ? '📱 Online' : '🏥 At Hospital' },
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
                            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '10px' }}>Progress</p>
                            {[
                                { done: condition.trim().length >= 5, label: 'Describe your condition' },
                                { done: !!selectedSlot, label: 'Select a time slot' },
                                { done: paymentMethodConfirmed, label: 'Choose payment method' },
                            ].map(c => (
                                <div key={c.label} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: c.done ? 'var(--accent)' : 'rgba(11,158,135,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {c.done && <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><path d="M9 12l2 2 4-4" /><path fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span style={{ fontSize: '0.8125rem', color: c.done ? 'var(--accent-dark)' : 'var(--text-muted)', fontWeight: c.done ? 600 : 400, textDecoration: c.done ? 'line-through' : 'none' }}>{c.label}</span>
                                </div>
                            ))}
                        </motion.div>

                        {/* Navigation Buttons */}
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            {currentStep > 1 && (
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={handlePrevStep}
                                    style={{ padding: '12px', background: 'white', color: 'var(--accent)', border: '1.5px solid var(--accent)', borderRadius: '12px', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                                >
                                    ← Back
                                </motion.button>
                            )}

                            {currentStep < 4 ? (
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleNextStep}
                                    style={{ padding: '14px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(11,158,135,0.35)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    Next: {currentStep === 1 ? 'Select Slot' : currentStep === 2 ? 'Payment' : 'Review'} →
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={!isBooking && doc?.numeric_id ? { scale: 1.02, y: -2 } : {}}
                                    whileTap={!isBooking && doc?.numeric_id ? { scale: 0.98 } : {}}
                                    onClick={handleBook}
                                    disabled={isBooking || !doc?.numeric_id}
                                    style={{ padding: '14px', background: (isBooking || !doc?.numeric_id) ? 'rgba(11,158,135,0.6)' : 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: (isBooking || !doc?.numeric_id) ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(11,158,135,0.35)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    {isBooking ? (
                                        <>
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                            Generating token...
                                        </>
                                    ) : !doc?.numeric_id ? (
                                        <>
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(11,158,135,0.8)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                            Loading doctor info...
                                        </>
                                    ) : '🎫 Confirm Booking →'}
                                </motion.button>
                            )}
                        </div>

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
