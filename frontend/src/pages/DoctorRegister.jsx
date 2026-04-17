import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import StepIndicator from '../components/StepIndicator';
import FloatingLabelInput from '../components/FloatingLabelInput';
import PulseButton from '../components/PulseButton';
import { fetchStates, fetchCities, fetchHospitalsByCity, fetchUnregisteredDoctors, registerDoctor } from '../api/registration';

const STEPS = ['State', 'City', 'Hospital', 'Find Me', 'Credentials'];

const slide = {
    enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0, filter: 'blur(4px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (d) => ({ x: d > 0 ? -40 : 40, opacity: 0, filter: 'blur(4px)' }),
};

const EyeIcon = ({ open }) => open ? (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
) : (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

const ArrowLeft = () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const SearchIcon = () => (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export default function DoctorRegister() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);

    // Step data
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedHospital, setSelectedHospital] = useState(null); // { id, hospital_name, address }
    const [selectedDoctor, setSelectedDoctor] = useState(null);   // { id, full_name, specialization }

    // Lists
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [doctors, setDoctors] = useState([]);

    // Search
    const [stateSearch, setStateSearch] = useState('');
    const [hospitalSearch, setHospitalSearch] = useState('');

    // Credentials form
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Status
    const [loading, setLoading] = useState(false);
    const [fetchingList, setFetchingList] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const goTo = (next) => { setDir(next > step ? 1 : -1); setStep(next); setError(''); };

    // ── Fetch states on mount ──────────────────────────────────
    useEffect(() => {
        setFetchingList(true);
        fetchStates()
            .then(res => setStates(res.data || []))
            .catch(() => setStates([]))
            .finally(() => setFetchingList(false));
    }, []);

    // ── Fetch cities when state selected ──────────────────────
    useEffect(() => {
        if (!selectedState) return;
        setFetchingList(true);
        setCities([]); setSelectedCity(''); setSelectedHospital(null); setSelectedDoctor(null);
        fetchCities(selectedState)
            .then(res => setCities(res.data || []))
            .catch(() => setCities([]))
            .finally(() => setFetchingList(false));
    }, [selectedState]);

    // ── Fetch hospitals when city selected ────────────────────
    useEffect(() => {
        if (!selectedCity) return;
        setFetchingList(true);
        setHospitals([]); setSelectedHospital(null); setSelectedDoctor(null);
        fetchHospitalsByCity(selectedCity)
            .then(res => setHospitals(res.data || []))
            .catch(() => setHospitals([]))
            .finally(() => setFetchingList(false));
    }, [selectedCity]);

    // ── Fetch unregistered doctors when hospital selected ──────
    useEffect(() => {
        if (!selectedHospital) return;
        setFetchingList(true);
        setDoctors([]); setSelectedDoctor(null);
        fetchUnregisteredDoctors(selectedHospital.id)
            .then(res => setDoctors(res.data?.doctors || []))
            .catch(() => setDoctors([]))
            .finally(() => setFetchingList(false));
    }, [selectedHospital]);

    // ── Validation per step ────────────────────────────────────
    const canProceed = () => {
        if (step === 0) return !!selectedState;
        if (step === 1) return !!selectedCity;
        if (step === 2) return !!selectedHospital;
        if (step === 3) return !!selectedDoctor;
        return true;
    };

    // ── Submit ─────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError('');

        // Client-side validation
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length !== 10) { setError('Please enter a valid 10-digit phone number.'); return; }
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address.'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (!/\d/.test(password)) { setError('Password must contain at least one number.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

        setLoading(true);
        try {
            const res = await registerDoctor({
                doctorId: selectedDoctor.id,
                phone: cleanPhone,
                email: email.trim().toLowerCase(),
                password,
            });

            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify({
                id: res.data.doctor_id,
                full_name: res.data.full_name,
                specialization: res.data.specialization,
                hospital_id: res.data.hospital_id,
                hospital_name: res.data.hospital_name,
                email: res.data.email,
                role: 'DOCTOR',
            }));

            setSuccess(true);
            setTimeout(() => navigate('/doctor/dashboard'), 1200);
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Password strength hints ────────────────────────────────
    const pwChecks = {
        length: password.length >= 8,
        number: /\d/.test(password),
    };

    // ── Filtered lists ─────────────────────────────────────────
    const filteredStates = stateSearch
        ? states.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()))
        : states;

    const filteredHospitals = hospitalSearch
        ? hospitals.filter(h => h.hospital_name?.toLowerCase().includes(hospitalSearch.toLowerCase()))
        : hospitals;

    return (
        <div style={{
            position: 'relative', zIndex: 10, minHeight: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '32px 24px',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', maxWidth: '520px' }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', justifyContent: 'center' }}>
                    <div className="logo-mark">
                        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" />
                        </svg>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.035em', color: 'var(--text-primary)' }}>
                        QueueEase
                    </span>
                </div>

                {/* Glass card */}
                <div style={{
                    background: 'rgba(255,255,255,0.86)',
                    border: '1px solid rgba(255,255,255,0.7)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    boxShadow: '0 4px 32px rgba(11,120,100,0.1), 0 24px 64px rgba(11,120,100,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
                }}>
                    {/* Header */}
                    <div style={{ padding: '28px 28px 0' }}>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Doctor Portal
                        </p>
                        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.035em', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            Create your account
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '22px' }}>
                            Find your name in your hospital's doctor roster to get started.
                        </p>
                        <StepIndicator steps={STEPS} currentStep={step} />
                    </div>

                    {/* Form body */}
                    <div style={{ padding: '24px 28px', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
                        <AnimatePresence custom={dir} mode="wait">
                            <motion.div
                                key={step}
                                custom={dir}
                                variants={slide}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                                style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}
                            >
                                {/* ── STEP 0: State ── */}
                                {step === 0 && (
                                    <>
                                        <div style={{ marginBottom: '4px' }}>
                                            <p className="t-heading" style={{ fontSize: '1rem', marginBottom: '2px' }}>Which state are you in?</p>
                                            <p className="t-muted">We'll find hospitals in your area.</p>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                                                <SearchIcon />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search state..."
                                                value={stateSearch}
                                                onChange={e => setStateSearch(e.target.value)}
                                                className="input-field"
                                                style={{ paddingLeft: '36px' }}
                                            />
                                        </div>
                                        {fetchingList ? (
                                            <p className="t-muted" style={{ textAlign: 'center', padding: '24px' }}>Loading states...</p>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                                                {filteredStates.map(s => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => { setSelectedState(s); setStateSearch(''); }}
                                                        className={`option-pill ${selectedState === s ? 'active' : ''}`}
                                                        style={{ textAlign: 'left' }}
                                                    >
                                                        {selectedState === s && <span style={{ color: 'var(--accent)', marginRight: '6px', display: 'inline-flex' }}><CheckIcon /></span>}
                                                        {s}
                                                    </button>
                                                ))}
                                                {filteredStates.length === 0 && (
                                                    <p className="t-muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '16px' }}>No states found</p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ── STEP 1: City ── */}
                                {step === 1 && (
                                    <>
                                        <div style={{ marginBottom: '4px' }}>
                                            <p className="t-heading" style={{ fontSize: '1rem', marginBottom: '2px' }}>Which city?</p>
                                            <p className="t-muted">Cities with registered hospitals in {selectedState}.</p>
                                        </div>
                                        {fetchingList ? (
                                            <p className="t-muted" style={{ textAlign: 'center', padding: '24px' }}>Loading cities...</p>
                                        ) : cities.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No cities with registered hospitals found in {selectedState}.</p>
                                                <p className="t-muted" style={{ marginTop: '6px' }}>Ask your hospital to register on QueueEase first.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                                                {cities.map(c => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => setSelectedCity(c)}
                                                        className={`option-pill ${selectedCity === c ? 'active' : ''}`}
                                                        style={{ textAlign: 'left', padding: '10px 14px' }}
                                                    >
                                                        {selectedCity === c && <span style={{ color: 'var(--accent)', marginRight: '6px', display: 'inline-flex' }}><CheckIcon /></span>}
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ── STEP 2: Hospital ── */}
                                {step === 2 && (
                                    <>
                                        <div style={{ marginBottom: '4px' }}>
                                            <p className="t-heading" style={{ fontSize: '1rem', marginBottom: '2px' }}>Find your hospital</p>
                                            <p className="t-muted">Select the hospital you practice at.</p>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                                                <SearchIcon />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search hospital name..."
                                                value={hospitalSearch}
                                                onChange={e => setHospitalSearch(e.target.value)}
                                                className="input-field"
                                                style={{ paddingLeft: '36px' }}
                                            />
                                        </div>
                                        {fetchingList ? (
                                            <p className="t-muted" style={{ textAlign: 'center', padding: '24px' }}>Loading hospitals...</p>
                                        ) : filteredHospitals.length === 0 ? (
                                            <p className="t-muted" style={{ textAlign: 'center', padding: '24px' }}>No hospitals found in {selectedCity}.</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                                                {filteredHospitals.map(h => {
                                                    const active = selectedHospital?.id === h.id;
                                                    return (
                                                        <button
                                                            key={h.id}
                                                            type="button"
                                                            onClick={() => { setSelectedHospital(h); setHospitalSearch(''); }}
                                                            style={{
                                                                textAlign: 'left', padding: '14px 16px',
                                                                borderRadius: '12px', border: `1.5px solid ${active ? 'var(--accent)' : 'rgba(11,158,135,0.18)'}`,
                                                                background: active ? 'rgba(11,158,135,0.06)' : 'rgba(255,255,255,0.65)',
                                                                cursor: 'pointer', transition: 'all 0.18s',
                                                                backdropFilter: 'blur(8px)',
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                <div>
                                                                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                                                                        {h.hospital_name}
                                                                    </p>
                                                                    {h.location && (
                                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                            {h.location.city_name}, {h.location.state_name}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {active && (
                                                                    <span style={{ color: 'var(--accent)', flexShrink: 0, marginLeft: '8px' }}><CheckIcon /></span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ── STEP 3: Select Doctor ── */}
                                {step === 3 && (
                                    <>
                                        <div style={{ marginBottom: '4px' }}>
                                            <p className="t-heading" style={{ fontSize: '1rem', marginBottom: '2px' }}>Find your name</p>
                                            <p className="t-muted">Select your name from {selectedHospital?.hospital_name}'s roster.</p>
                                        </div>
                                        {fetchingList ? (
                                            <p className="t-muted" style={{ textAlign: 'center', padding: '24px' }}>Loading doctors...</p>
                                        ) : doctors.length === 0 ? (
                                            <div style={{
                                                padding: '24px', borderRadius: '14px',
                                                background: 'rgba(11,158,135,0.05)', border: '1.5px solid rgba(11,158,135,0.14)',
                                                textAlign: 'center',
                                            }}>
                                                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                                                </svg>
                                                <p style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '6px' }}>
                                                    Your name is not listed yet
                                                </p>
                                                <p className="t-muted" style={{ fontSize: '0.8125rem' }}>
                                                    Contact your hospital admin to add you to the system first. All doctors must be registered by the hospital before they can create an account.
                                                </p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                                                {doctors.map(d => {
                                                    const active = selectedDoctor?.id === d.id;
                                                    return (
                                                        <button
                                                            key={d.id}
                                                            type="button"
                                                            onClick={() => setSelectedDoctor(d)}
                                                            style={{
                                                                textAlign: 'left', padding: '14px 16px',
                                                                borderRadius: '12px', border: `1.5px solid ${active ? 'var(--accent)' : 'rgba(11,158,135,0.18)'}`,
                                                                background: active ? 'rgba(11,158,135,0.06)' : 'rgba(255,255,255,0.65)',
                                                                cursor: 'pointer', transition: 'all 0.18s',
                                                                backdropFilter: 'blur(8px)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                            }}
                                                        >
                                                            <div>
                                                                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                                                                    {d.full_name}
                                                                </p>
                                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                    {d.specialization} · ₹{d.consultation_fee}
                                                                </p>
                                                            </div>
                                                            {active && (
                                                                <span style={{ color: 'var(--accent)', flexShrink: 0 }}><CheckIcon /></span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ── STEP 4: Credentials ── */}
                                {step === 4 && (
                                    <>
                                        <div style={{ marginBottom: '4px' }}>
                                            <p className="t-heading" style={{ fontSize: '1rem', marginBottom: '2px' }}>Set up your account</p>
                                            <p className="t-muted">Create login credentials for <strong>{selectedDoctor?.full_name}</strong>.</p>
                                        </div>

                                        {/* Phone */}
                                        <div style={{ position: 'relative' }}>
                                            <div style={{
                                                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                                                fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)',
                                                borderRight: '1px solid rgba(11,158,135,0.2)', paddingRight: '8px', zIndex: 1,
                                            }}>
                                                +91
                                            </div>
                                            <input
                                                type="tel"
                                                placeholder="10-digit mobile number"
                                                value={phone}
                                                onChange={e => { setPhone(e.target.value); setError(''); }}
                                                className="input-field"
                                                style={{ paddingLeft: '52px' }}
                                                maxLength={10}
                                            />
                                        </div>

                                        {/* Email */}
                                        <FloatingLabelInput
                                            label="Email Address"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); setError(''); }}
                                        />

                                        {/* Password */}
                                        <div style={{ position: 'relative' }}>
                                            <FloatingLabelInput
                                                label="Password"
                                                type={showPass ? 'text' : 'password'}
                                                placeholder="Min 8 characters, 1 number"
                                                value={password}
                                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass(v => !v)}
                                                style={{
                                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                                    display: 'flex', alignItems: 'center', padding: '4px',
                                                }}
                                            >
                                                <EyeIcon open={showPass} />
                                            </button>
                                        </div>

                                        {/* Password strength */}
                                        {password && (
                                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                {[
                                                    { check: pwChecks.length, label: '8+ characters' },
                                                    { check: pwChecks.number, label: 'Contains a number' },
                                                ].map(({ check, label }) => (
                                                    <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: check ? 'var(--accent)' : 'var(--text-muted)' }}>
                                                        {check ? <CheckIcon /> : <span style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>○</span>}
                                                        {label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Confirm Password */}
                                        <div style={{ position: 'relative' }}>
                                            <FloatingLabelInput
                                                label="Confirm Password"
                                                type={showConfirm ? 'text' : 'password'}
                                                placeholder="Re-enter password"
                                                value={confirmPassword}
                                                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(v => !v)}
                                                style={{
                                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                                    display: 'flex', alignItems: 'center', padding: '4px',
                                                }}
                                            >
                                                <EyeIcon open={showConfirm} />
                                            </button>
                                        </div>

                                        {/* Error */}
                                        <AnimatePresence mode="wait">
                                            {error && (
                                                <motion.div
                                                    key={error}
                                                    initial={{ opacity: 0, y: -6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    style={{
                                                        padding: '10px 14px', borderRadius: '10px',
                                                        background: 'rgba(244,63,94,0.07)', border: '1.5px solid rgba(244,63,94,0.22)',
                                                        fontSize: '0.8125rem', color: 'var(--error)',
                                                        display: 'flex', gap: '8px', alignItems: 'center',
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                                                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                                    </svg>
                                                    {error}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Nav buttons */}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            {step > 0 && (
                                <button type="button" onClick={() => goTo(step - 1)} className="btn-ghost" style={{ flexShrink: 0 }}>
                                    <ArrowLeft /> Back
                                </button>
                            )}
                            {step < 4 ? (
                                <PulseButton
                                    type="button"
                                    onClick={() => { if (canProceed()) goTo(step + 1); else setError('Please make a selection to continue.'); }}
                                    disabled={!canProceed()}
                                >
                                    Continue →
                                </PulseButton>
                            ) : (
                                <PulseButton type="button" onClick={handleSubmit} loading={loading} success={success}>
                                    Create Account
                                </PulseButton>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '14px 28px', borderTop: '1px solid rgba(11,158,135,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Already have an account?</span>
                        <Link to="/login" style={{ color: 'var(--accent)', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none' }}>
                            Sign in →
                        </Link>
                    </div>
                </div>

                <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Protected by QueueEase · HIPAA-aligned
                </p>
            </motion.div>
        </div>
    );
}
