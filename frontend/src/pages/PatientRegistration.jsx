import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';

import { patientSchema } from '../schemas/schemas';
import useFormStore from '../store/formStore';
import FloatingLabelInput from '../components/FloatingLabelInput';
import TagChipInput from '../components/TagChipInput';

import StepIndicator from '../components/StepIndicator';
import PulseButton from '../components/PulseButton';
import { registerPatient } from '../api/registration';

// Backend accepts only ASCII hyphens — use '-' not '−'
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
// Backend enum: Male | Female | Other
const GENDERS = ['Male', 'Female', 'Other'];
const RELATIONS = ['Parent', 'Sibling', 'Spouse', 'Friend', 'Child', 'Other'];
const STEPS = ['Identity', 'Medical', 'Emergency'];

const slide = {
    enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
};

const ArrowLeft = () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const ShieldIcon = () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;

export default function PatientRegistration() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState('');
    const [allergies, setAllergies] = useState([]);
    const [medications, setMedications] = useState([]);
    const [noteLen, setNoteLen] = useState(0);

    const { patientData } = useFormStore();
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(patientSchema),
        defaultValues: patientData,
        mode: 'onTouched',
    });

    const goTo = (next) => { setDir(next > step ? 1 : -1); setStep(next); };

    const onSubmit = async (data) => {
        setLoading(true); setServerError('');
        try {
            // All fields already snake_case — just convert arrays to comma strings
            await registerPatient({
                ...data,
                allergies: allergies.join(', '),
                current_medications: medications.join(', '),
            });
            setSuccess(true);
            setTimeout(() => navigate('/patient/dashboard'), 800);
        } catch (err) {
            setServerError(err.message);
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
                        {/* ── STEP 0: Identity ── */}
                        {step === 0 && (
                            <>
                                <div style={{ marginBottom: '4px' }}>
                                    <p className="t-heading" style={{ fontSize: '1rem', marginBottom: '2px' }}>Your account</p>
                                    <p className="t-muted">Create your patient identity on QueueEase.</p>
                                </div>
                                <FloatingLabelInput label="Full Name" placeholder="Your full name" error={errors.full_name?.message} value={watch('full_name') || ''} {...register('full_name')} />
                                <FloatingLabelInput label="Email Address" type="email" placeholder="you@example.com" error={errors.email?.message} value={watch('email') || ''} {...register('email')} />
                                <FloatingLabelInput label="Phone Number" type="tel" placeholder="10-digit mobile number" error={errors.phone?.message} value={watch('phone') || ''} {...register('phone')} />
                                <FloatingLabelInput label="Age" type="number" placeholder="Your age" error={errors.age?.message} value={watch('age') || ''} {...register('age')} />
                                <FloatingLabelInput label="Address" placeholder="Your full address" error={errors.address?.message} value={watch('address') || ''} {...register('address')} />
                            </>
                        )}

                        {/* ── STEP 1: Medical ── */}
                        {step === 1 && (
                            <>
                                <div style={{ marginBottom: '4px' }}>
                                    <p className="t-heading" style={{ fontSize: '1rem', marginBottom: '2px' }}>Medical Profile</p>
                                    <p className="t-muted">Help doctors prepare before your visit.</p>
                                </div>

                                {/* Blood Group */}
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.01em', display: 'block', marginBottom: '8px' }}>
                                        Blood Group
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                        {BLOOD_GROUPS.map(bg => (
                                            <button
                                                key={bg}
                                                type="button"
                                                onClick={() => setValue('blood_group', bg)}
                                                className={`option-pill ${watch('blood_group') === bg ? 'active' : ''}`}
                                            >
                                                {bg}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.blood_group && <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '6px' }}>{errors.blood_group.message}</p>}
                                </div>

                                {/* Gender */}
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.01em', display: 'block', marginBottom: '8px' }}>
                                        Gender
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                        {GENDERS.map(g => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setValue('gender', g)}
                                                className={`option-pill ${watch('gender') === g ? 'active' : ''}`}
                                                style={{ textAlign: 'left', padding: '9px 14px' }}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.gender && <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '6px' }}>{errors.gender.message}</p>}
                                </div>

                                {/* Condition Notes */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>
                                        Condition Notes <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <textarea
                                            {...register('condition_notes')}
                                            maxLength={500}
                                            rows={3}
                                            onChange={e => setNoteLen(e.target.value.length)}
                                            placeholder="Pre-existing conditions, symptoms, notes for your doctor..."
                                            className="input-field"
                                            style={{ resize: 'none', height: 'auto', lineHeight: 1.6 }}
                                        />
                                        <span style={{ position: 'absolute', bottom: '10px', right: '12px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {noteLen}/500
                                        </span>
                                    </div>
                                </div>

                                <TagChipInput label="Known Allergies" value={allergies} onChange={setAllergies} placeholder="e.g. Penicillin, Dust mites..." />
                                <TagChipInput label="Current Medications" value={medications} onChange={setMedications} placeholder="e.g. Metformin, Aspirin..." />
                            </>
                        )}

                        {/* ── STEP 2: Emergency ── */}
                        {step === 2 && (
                            <>
                                <div style={{ marginBottom: '4px' }}>
                                    <p className="t-heading" style={{ fontSize: '1rem', marginBottom: '2px' }}>Emergency Contact</p>
                                    <p className="t-muted">Who should we call in case of emergency?</p>
                                </div>

                                <div
                                    className="card-elevated"
                                    style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                                        <span style={{ color: 'var(--accent-light)' }}><ShieldIcon /></span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                            Emergency Contact
                                        </span>
                                    </div>

                                    <FloatingLabelInput label="Contact Name" placeholder="Full name" error={errors.emergency_contact_name?.message} value={watch('emergency_contact_name') || ''} {...register('emergency_contact_name')} />

                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.01em', display: 'block', marginBottom: '8px' }}>
                                            Relation
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                            {RELATIONS.map(r => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setValue('emergency_relation', r)}
                                                    className={`option-pill ${watch('emergency_relation') === r ? 'active' : ''}`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <FloatingLabelInput label="Emergency Phone" type="tel" placeholder="10-digit mobile number" error={errors.emergency_contact_phone?.message} value={watch('emergency_contact_phone') || ''} {...register('emergency_contact_phone')} />
                                </div>

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
                    <PulseButton type="button" onClick={() => goTo(step + 1)}>Continue →</PulseButton>
                ) : (
                    <PulseButton type="submit" loading={loading} success={success} error={!!serverError}>
                        Create Account
                    </PulseButton>
                )}
            </div>
        </form>
    );
}
