import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { hospitalSchema, doctorSchema } from '../schemas/schemas';
import useFormStore from '../store/formStore';
import FloatingLabelInput from '../components/FloatingLabelInput';
import SearchableSelect from '../components/SearchableSelect';
import MaskedPhoneInput from '../components/MaskedPhoneInput';
import StepIndicator from '../components/StepIndicator';
import PulseButton from '../components/PulseButton';
import { registerHospital } from '../api/registration';

const STATES = [
    { value: 'mh', label: 'Maharashtra' },
    { value: 'dl', label: 'Delhi' },
    { value: 'ka', label: 'Karnataka' },
    { value: 'tn', label: 'Tamil Nadu' },
    { value: 'gj', label: 'Gujarat' },
    { value: 'rj', label: 'Rajasthan' },
    { value: 'up', label: 'Uttar Pradesh' },
    { value: 'wb', label: 'West Bengal' },
];
const CITIES = {
    mh: [{ value: 'mum', label: 'Mumbai' }, { value: 'pune', label: 'Pune' }, { value: 'nag', label: 'Nagpur' }],
    dl: [{ value: 'ndl', label: 'New Delhi' }, { value: 'grg', label: 'Gurugram' }, { value: 'noi', label: 'Noida' }],
    ka: [{ value: 'blr', label: 'Bengaluru' }, { value: 'mys', label: 'Mysuru' }, { value: 'hub', label: 'Hubballi' }],
    tn: [{ value: 'chn', label: 'Chennai' }, { value: 'cbe', label: 'Coimbatore' }],
    gj: [{ value: 'ahm', label: 'Ahmedabad' }, { value: 'srt', label: 'Surat' }],
    rj: [{ value: 'jp', label: 'Jaipur' }, { value: 'jod', label: 'Jodhpur' }],
    up: [{ value: 'lko', label: 'Lucknow' }, { value: 'knp', label: 'Kanpur' }],
    wb: [{ value: 'kol', label: 'Kolkata' }, { value: 'dur', label: 'Durgapur' }],
};
const SPECIALTIES = [
    { value: 'general', label: 'General Medicine' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'psychiatry', label: 'Psychiatry' },
    { value: 'gynecology', label: 'Gynecology' },
    { value: 'ophthalmology', label: 'Ophthalmology' },
];
const STEPS = ['Location', 'Doctors', 'Account'];

const slide = {
    enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
};

const PlusIcon = () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ArrowLeft = () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;

export default function HospitalRegistration() {
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState('');
    const [doctors, setDoctors] = useState([{ id: 1, name: '', specialty: '' }]);
    const [doctorErrors, setDoctorErrors] = useState({});
    const navigate = useNavigate();

    const { hospitalData } = useFormStore();
    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm({
        resolver: zodResolver(hospitalSchema),
        defaultValues: hospitalData,
        mode: 'onTouched',
    });

    const selectedState = watch('state');

    const goTo = (next) => { setDir(next > step ? 1 : -1); setStep(next); };

    const addDoctor = () => setDoctors(d => [...d, { id: Date.now(), name: '', specialty: '' }]);
    const removeDoctor = (id) => setDoctors(d => d.filter(doc => doc.id !== id));
    const updateDoctor = (id, field, val) => setDoctors(d => d.map(doc => doc.id === id ? { ...doc, [field]: val } : doc));

    const validateDoctors = () => {
        const errs = {};
        doctors.forEach(doc => {
            const res = doctorSchema.safeParse(doc);
            if (!res.success) errs[doc.id] = res.error.flatten().fieldErrors;
        });
        setDoctorErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = async () => {
        if (step === 0) {
            const isValid = await trigger(['state', 'city', 'hospitalName', 'address']);
            if (!isValid) return;
        }
        if (step === 1 && !validateDoctors()) return;
        goTo(step + 1);
    };

    const onSubmit = async (data) => {
        if (!validateDoctors()) return;
        setLoading(true); setServerError('');
        try {
            const payload = {
                state: data.state,
                city: data.city,
                hospital_name: data.hospitalName,
                address: data.address,
                owner_name: data.ownerName,
                contact_person: data.contactPerson,
                phone_1: data.primaryPhone.replace(/\D/g, ''),
                phone_2: data.secondaryPhone ? data.secondaryPhone.replace(/\D/g, '') : undefined,
                email: data.email,
                password: data.password,
                chemist_staff_password: data.password,
                license_number: data.licenseNumber,
                chemist_shop_name: data.chemistShopName,
                doctors: doctors.map(doc => ({
                    full_name: doc.name,
                    specialization: doc.specialty,
                    experience: 0
                }))
            };

            const res = await registerHospital(payload);
            // Store session
            if (res.token) {
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify({
                    role: 'hospital',
                    hospital_id: res.data?.hospital_id,
                    hospital_name: res.data?.hospital_name,
                    email: res.data?.email,
                }));
            }
            setSuccess(true);
            setTimeout(() => navigate('/hospital/dashboard'), 1200);
        } catch (err) {
            setServerError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <StepIndicator steps={STEPS} currentStep={step} />

            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <AnimatePresence custom={dir} mode="wait">
                    <motion.div
                        key={step}
                        custom={dir}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                    >
                        {step === 0 && (
                            <>
                                <div style={{ marginBottom: '4px' }}>
                                    <p className="t-heading" style={{ fontSize: '1rem', marginBottom: '2px' }}>Where is your hospital?</p>
                                    <p className="t-muted">We'll connect patients from your region.</p>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <SearchableSelect
                                        label="State"
                                        options={STATES}
                                        value={watch('state')}
                                        onChange={v => { setValue('state', v); setValue('city', ''); }}
                                        error={errors.state?.message}
                                        placeholder="Select state..."
                                    />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <SearchableSelect
                                        label="City"
                                        options={selectedState ? (CITIES[selectedState] || []) : []}
                                        value={watch('city')}
                                        onChange={v => setValue('city', v)}
                                        error={errors.city?.message}
                                        placeholder={selectedState ? 'Select city...' : 'Choose state first'}
                                    />
                                </div>
                                <FloatingLabelInput
                                    label="Hospital Name"
                                    placeholder="e.g. Apollo Hospitals"
                                    error={errors.hospitalName?.message}
                                    value={watch('hospitalName') || ''}
                                    {...register('hospitalName')}
                                />
                                <FloatingLabelInput
                                    label="Full Address"
                                    placeholder="Street address, area..."
                                    error={errors.address?.message}
                                    value={watch('address') || ''}
                                    {...register('address')}
                                />
                            </>
                        )}

                        {step === 1 && (
                            <>
                                <div style={{ marginBottom: '4px' }}>
                                    <p className="t-heading" style={{ fontSize: '1rem', marginBottom: '2px' }}>Doctor Roster</p>
                                    <p className="t-muted">Add all doctors who will use QueueEase.</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '2px' }}>
                                    <AnimatePresence>
                                        {doctors.map((doc, idx) => (
                                            <motion.div
                                                key={doc.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                                transition={{ duration: 0.2 }}
                                                className="card-elevated"
                                                style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                                        Doctor {idx + 1}
                                                    </span>
                                                    {doctors.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDoctor(doc.id)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px', borderRadius: '6px', transition: 'color 0.1s' }}
                                                            onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    )}
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                    <FloatingLabelInput
                                                        label="Full Name"
                                                        placeholder="Dr. Firstname Last"
                                                        value={doc.name}
                                                        onChange={e => updateDoctor(doc.id, 'name', e.target.value)}
                                                        error={doctorErrors[doc.id]?.name?.[0]}
                                                    />
                                                    <div style={{ position: 'relative' }}>
                                                        <SearchableSelect
                                                            label="Specialty"
                                                            options={SPECIALTIES}
                                                            value={doc.specialty}
                                                            onChange={v => updateDoctor(doc.id, 'specialty', v)}
                                                            error={doctorErrors[doc.id]?.specialty?.[0]}
                                                            placeholder="Select..."
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                                <button
                                    type="button"
                                    onClick={addDoctor}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        padding: '10px', borderRadius: '10px',
                                        border: '1.5px dashed var(--border)',
                                        background: 'transparent',
                                        color: 'var(--accent-light)',
                                        fontSize: '0.8125rem', fontWeight: 600,
                                        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                        transition: 'border-color 0.15s, background 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-bg)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <PlusIcon /> Add Another Doctor
                                </button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div style={{ marginBottom: '4px' }}>
                                    <p className="t-heading" style={{ fontSize: '1rem', marginBottom: '2px' }}>Account Details</p>
                                    <p className="t-muted">Set up admin access for your hospital.</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <FloatingLabelInput label="Owner Name" placeholder="Full name" error={errors.ownerName?.message} value={watch('ownerName') || ''} {...register('ownerName')} />
                                    <FloatingLabelInput label="Contact Person" placeholder="Point of contact" error={errors.contactPerson?.message} value={watch('contactPerson') || ''} {...register('contactPerson')} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <FloatingLabelInput label="License Number" placeholder="e.g. HOS-12345" error={errors.licenseNumber?.message} value={watch('licenseNumber') || ''} {...register('licenseNumber')} />
                                    <FloatingLabelInput label="Chemist Shop Name" placeholder="e.g. Apollo Pharmacy" error={errors.chemistShopName?.message} value={watch('chemistShopName') || ''} {...register('chemistShopName')} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <MaskedPhoneInput label="Primary Phone" error={errors.primaryPhone?.message} value={watch('primaryPhone') || ''} {...register('primaryPhone')} />
                                    <MaskedPhoneInput label="Secondary Phone" optional dim={!watch('secondaryPhone')} error={errors.secondaryPhone?.message} value={watch('secondaryPhone') || ''} {...register('secondaryPhone')} />
                                </div>
                                <FloatingLabelInput label="Email Address" type="email" placeholder="admin@hospital.com" error={errors.email?.message} value={watch('email') || ''} {...register('email')} />
                                <FloatingLabelInput label="Password" type="password" placeholder="Min 8 characters" hint="Use a strong password — this is your admin account." error={errors.password?.message} value={watch('password') || ''} {...register('password')} />
                                {serverError && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        style={{ padding: '10px 14px', borderRadius: '9px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', fontSize: '0.8125rem', color: 'var(--error)' }}
                                    >
                                        {serverError}
                                    </motion.div>
                                )}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Nav buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                {step > 0 && (
                    <button type="button" onClick={() => goTo(step - 1)} className="btn-ghost" style={{ flexShrink: 0 }}>
                        <ArrowLeft /> Back
                    </button>
                )}
                {step < 2 ? (
                    <PulseButton type="button" onClick={handleNext}>Continue →</PulseButton>
                ) : (
                    <PulseButton type="submit" loading={loading} success={success} error={!!serverError}>
                        Register Hospital
                    </PulseButton>
                )}
            </div>
        </form>
    );
}
