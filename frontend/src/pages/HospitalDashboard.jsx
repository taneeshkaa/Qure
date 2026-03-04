import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getHospitalProfile,
    updateHospitalProfile,
    getHospitalDoctors,
    addHospitalDoctor,
    removeHospitalDoctor,
} from '../api/hospital';

// ─── Icons ───────────────────────────────────────────────────
const HospitalIcon = () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m7-11v6m-3-3h6" />
    </svg>
);
const DoctorIcon = () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const PlusIcon = () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const TrashIcon = () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const CheckIcon = () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
const XIcon = () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const EditIcon = () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const SPECIALTIES = [
    'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics',
    'Pediatrics', 'Dermatology', 'Oncology', 'Psychiatry',
    'Gynecology', 'Ophthalmology', 'ENT', 'Endocrinology', 'Gastroenterology',
];

// ─── Sub-components ──────────────────────────────────────────

function Toast({ message, type = 'error', onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            style={{
                position: 'fixed', bottom: '24px', right: '24px', zIndex: 9000,
                padding: '12px 18px', borderRadius: '12px', maxWidth: '340px',
                background: type === 'error'
                    ? 'rgba(244,63,94,0.12)' : 'rgba(16,185,129,0.1)',
                border: `1.5px solid ${type === 'error' ? 'rgba(244,63,94,0.35)' : 'rgba(16,185,129,0.3)'}`,
                color: type === 'error' ? 'var(--error)' : 'var(--accent)',
                fontSize: '0.8125rem', fontWeight: 500, fontFamily: 'Inter, sans-serif',
                display: 'flex', gap: '10px', alignItems: 'center',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
        >
            <span style={{ flex: 1 }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '2px', display: 'flex' }}>
                <XIcon />
            </button>
        </motion.div>
    );
}

function ConfirmModal({ doctorName, onConfirm, onCancel, loading }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 8000,
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
            }}
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.94, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.94, y: 12 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card)', borderRadius: '16px',
                    border: '1px solid var(--border)', padding: '28px',
                    maxWidth: '380px', width: '100%',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
                }}
            >
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Remove Doctor?</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '24px' }}>
                    This will remove <strong style={{ color: 'var(--text-primary)' }}>{doctorName}</strong> from your hospital. They won't appear in search results.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: '10px', borderRadius: '10px',
                        border: '1.5px solid var(--border)', background: 'transparent',
                        color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif',
                        fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                    }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading} style={{
                        flex: 1, padding: '10px', borderRadius: '10px',
                        border: 'none', background: 'var(--error)', color: '#fff',
                        fontFamily: 'Inter, sans-serif', fontWeight: 600,
                        fontSize: '0.875rem', cursor: loading ? 'wait' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                    }}>
                        {loading ? 'Removing…' : 'Remove'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function AddDoctorModal({ onAdd, onClose }) {
    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [experience, setExperience] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};
        if (!name.trim() || name.trim().length < 2) e.name = 'Doctor name is required (min 2 chars)';
        if (!specialty) e.specialty = 'Please select a specialty';
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        try {
            await onAdd({ full_name: name.trim(), specialization: specialty, experience: parseInt(experience) || 0 });
            onClose();
        } catch (err) {
            setErrors({ root: err.message || 'Failed to add doctor. Try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 8000,
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.94, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.94, y: 12 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card)', borderRadius: '16px',
                    border: '1px solid var(--border)', padding: '28px',
                    maxWidth: '420px', width: '100%',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <p style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>Add New Doctor</p>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}>
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: errors.name ? 'var(--error)' : 'var(--text-secondary)' }}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                            placeholder="Dr. Firstname Lastname"
                            style={{
                                padding: '0.75rem 1rem', borderRadius: '10px',
                                border: `1.5px solid ${errors.name ? 'var(--error)' : 'var(--border)'}`,
                                background: 'var(--bg-input)', color: 'var(--text-primary)',
                                fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', outline: 'none',
                            }}
                        />
                        {errors.name && <p style={{ fontSize: '0.75rem', color: 'var(--error)' }}>{errors.name}</p>}
                    </div>
                    {/* Specialty */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: errors.specialty ? 'var(--error)' : 'var(--text-secondary)' }}>Specialty</label>
                        <select
                            value={specialty}
                            onChange={e => { setSpecialty(e.target.value); setErrors(p => ({ ...p, specialty: '' })); }}
                            style={{
                                padding: '0.75rem 1rem', borderRadius: '10px',
                                border: `1.5px solid ${errors.specialty ? 'var(--error)' : 'var(--border)'}`,
                                background: 'var(--bg-input)', color: specialty ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer',
                            }}
                        >
                            <option value="" disabled>Select specialty…</option>
                            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.specialty && <p style={{ fontSize: '0.75rem', color: 'var(--error)' }}>{errors.specialty}</p>}
                    </div>
                    {/* Experience */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Years of Experience <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="70"
                            value={experience}
                            onChange={e => setExperience(e.target.value)}
                            placeholder="e.g. 5"
                            style={{
                                padding: '0.75rem 1rem', borderRadius: '10px',
                                border: '1.5px solid var(--border)',
                                background: 'var(--bg-input)', color: 'var(--text-primary)',
                                fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', outline: 'none',
                            }}
                        />
                    </div>
                    {errors.root && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--error)', padding: '10px 14px', borderRadius: '9px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)' }}>
                            {errors.root}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px', borderRadius: '10px',
                            background: 'var(--accent)', border: 'none',
                            color: '#fff', fontFamily: 'Inter, sans-serif',
                            fontWeight: 700, fontSize: '0.9375rem',
                            cursor: loading ? 'wait' : 'pointer',
                            opacity: loading ? 0.75 : 1,
                            marginTop: '4px',
                            transition: 'opacity 0.15s',
                        }}
                    >
                        {loading ? 'Adding…' : 'Add Doctor'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ─── Main Dashboard ──────────────────────────────────────────
export default function HospitalDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [profileLoading, setProfileLoading] = useState(true);
    const [doctorsLoading, setDoctorsLoading] = useState(true);
    const [profileError, setProfileError] = useState('');
    const [toast, setToast] = useState(null);

    // Profile edit state
    const [editProfile, setEditProfile] = useState({});
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);

    // Doctor modal/confirm state
    const [showAddDoc, setShowAddDoc] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(null); // { id, name }
    const [removingId, setRemovingId] = useState(null);

    const showToast = useCallback((msg, type = 'error') => setToast({ msg, type }), []);

    // ─── Auth Guard ──────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!token || user.role !== 'hospital') {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    // ─── Fetch Data ──────────────────────────────────────────
    useEffect(() => {
        setProfileLoading(true);
        getHospitalProfile()
            .then(res => {
                setProfile(res.data);
                setEditProfile({
                    hospital_name: res.data.hospital_name || '',
                    about: res.data.about || '',
                    address: res.data.address || '',
                    contact_person: res.data.contact_person || '',
                    phone_1: res.data.phone_1 || '',
                    phone_2: res.data.phone_2 || '',
                });
            })
            .catch(err => {
                if (err.status === 401) {
                    localStorage.clear();
                    navigate('/login', { replace: true });
                } else {
                    setProfileError(err.message || 'Failed to load profile');
                }
            })
            .finally(() => setProfileLoading(false));
    }, [navigate]);

    useEffect(() => {
        setDoctorsLoading(true);
        getHospitalDoctors()
            .then(res => setDoctors(res.data))
            .catch(err => {
                if (err.status !== 401) showToast('Unable to load doctors list');
            })
            .finally(() => setDoctorsLoading(false));
    }, [showToast]);

    // ─── Handlers ────────────────────────────────────────────
    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const handleProfileChange = (field, val) => {
        setEditProfile(p => ({ ...p, [field]: val }));
        setProfileSaved(false);
    };

    const handleSaveProfile = async () => {
        setProfileSaving(true);
        try {
            const res = await updateHospitalProfile(editProfile);
            setProfile(p => ({ ...p, ...res.data }));
            setProfileSaved(true);
            showToast('Profile updated successfully!', 'success');
            setTimeout(() => setProfileSaved(false), 3000);
        } catch (err) {
            showToast(err.message || 'Failed to save profile. Try again.');
        } finally {
            setProfileSaving(false);
        }
    };

    const handleAddDoctor = async (data) => {
        const res = await addHospitalDoctor(data);
        setDoctors(d => [...d, res.data]);
        showToast('Doctor added successfully!', 'success');
    };

    const handleConfirmRemove = async () => {
        if (!confirmRemove) return;
        setRemovingId(confirmRemove.id);
        try {
            await removeHospitalDoctor(confirmRemove.id);
            setDoctors(d => d.filter(doc => doc.doctor_id !== confirmRemove.id));
            showToast(`${confirmRemove.name} removed.`, 'success');
        } catch (err) {
            showToast(err.message || 'Failed to remove doctor');
        } finally {
            setRemovingId(null);
            setConfirmRemove(null);
        }
    };

    // ─── Styles ──────────────────────────────────────────────
    const inputStyle = (focused) => ({
        width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
        border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
        background: 'var(--bg-input)', color: 'var(--text-primary)',
        fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', outline: 'none',
        boxSizing: 'border-box', transition: 'border-color 0.15s',
        resize: 'vertical',
    });

    const labelStyle = {
        fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)',
        marginBottom: '6px', display: 'block',
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 10 }}>
            {/* ── Navbar ─────────────────────────────────────── */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
                backdropFilter: 'blur(20px)',
                padding: '0 24px', height: '60px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="logo-mark" style={{ width: 32, height: 32 }}>
                        <HospitalIcon />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                            {profile?.hospital_name || user.hospital_name || 'Hospital Dashboard'}
                        </p>
                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {profile?.email || user.email || ''}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    style={{
                        padding: '8px 18px', borderRadius: '9px',
                        border: '1.5px solid var(--border)', background: 'transparent',
                        color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif',
                        fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                        transition: 'border-color 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--error)'; e.currentTarget.style.color = 'var(--error)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                    Sign Out
                </button>
            </nav>

            {/* ── Main Content ───────────────────────────────── */}
            <div style={{ maxWidth: '920px', margin: '0 auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* ── Profile Error ─────────────────────────── */}
                {profileError && !profileLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(244,63,94,0.08)', border: '1.5px solid rgba(244,63,94,0.2)', color: 'var(--error)', fontSize: '0.875rem' }}>
                        ⚠ {profileError} — <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: 'var(--accent-light)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Retry</button>
                    </motion.div>
                )}

                {/* ── Stats Bar ─────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div style={{
                        display: 'inline-flex', gap: '16px', flexWrap: 'wrap',
                    }}>
                        {/* Total Doctors stat */}
                        <div className="card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '14px', minWidth: '180px' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '10px',
                                background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--accent)',
                            }}>
                                <DoctorIcon />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Doctors</p>
                                <p style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                                    {doctorsLoading ? '—' : doctors.length}
                                </p>
                            </div>
                        </div>
                        {/* Appointments placeholder */}
                        <div className="card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '14px', minWidth: '180px', opacity: 0.6 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Appointments</p>
                                <p style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>0</p>
                            </div>
                        </div>
                        {/* Patients placeholder */}
                        <div className="card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '14px', minWidth: '180px', opacity: 0.6 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Patients</p>
                                <p style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>0</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Doctor Roster ──────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Doctor Roster</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Manage your hospital's doctors</p>
                        </div>
                        <button
                            onClick={() => setShowAddDoc(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '9px 16px', borderRadius: '10px',
                                background: 'var(--accent)', border: 'none', color: '#fff',
                                fontFamily: 'Inter, sans-serif', fontWeight: 700,
                                fontSize: '0.8125rem', cursor: 'pointer',
                                transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            <PlusIcon /> Add Doctor
                        </button>
                    </div>

                    {doctorsLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ height: '66px', borderRadius: '12px', background: 'var(--bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                            ))}
                        </div>
                    ) : doctors.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                            <DoctorIcon />
                            <p style={{ marginTop: '12px', fontSize: '0.9375rem', fontWeight: 600 }}>No doctors yet</p>
                            <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Add your first doctor to get started</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <AnimatePresence>
                                {doctors.map((doc) => (
                                    <motion.div
                                        key={doc.doctor_id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '14px',
                                            padding: '14px 16px', borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--bg-elevated)',
                                            transition: 'border-color 0.15s',
                                        }}
                                    >
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%',
                                            background: 'var(--accent-bg)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--accent)', flexShrink: 0,
                                        }}>
                                            <DoctorIcon />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {doc.full_name}
                                            </p>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--accent-light)', fontWeight: 500 }}>
                                                {doc.specialization}
                                                {doc.experience > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {doc.experience} yr{doc.experience !== 1 ? 's' : ''}</span>}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setConfirmRemove({ id: doc.doctor_id, name: doc.full_name })}
                                            disabled={removingId === doc.doctor_id}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: 'var(--text-muted)', display: 'flex', padding: '6px',
                                                borderRadius: '8px', transition: 'color 0.1s, background 0.1s',
                                                flexShrink: 0,
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                                            title="Remove doctor"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>

                {/* ── Hospital Profile ──────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Hospital Profile</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Update your hospital's information visible to patients</p>
                    </div>

                    {profileLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[80, 120, 80, 80].map((h, i) => (
                                <div key={i} style={{ height: h, borderRadius: '10px', background: 'var(--bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Hospital Name */}
                            <div>
                                <label style={labelStyle}>Hospital Name</label>
                                <input
                                    type="text"
                                    value={editProfile.hospital_name || ''}
                                    onChange={e => handleProfileChange('hospital_name', e.target.value)}
                                    style={inputStyle(false)}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>
                            {/* About */}
                            <div>
                                <label style={labelStyle}>About <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                                <textarea
                                    value={editProfile.about || ''}
                                    onChange={e => handleProfileChange('about', e.target.value)}
                                    placeholder="Describe your hospital, specialties, achievements…"
                                    rows={3}
                                    style={{ ...inputStyle(false), resize: 'vertical' }}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>
                            {/* Address */}
                            <div>
                                <label style={labelStyle}>Address</label>
                                <input
                                    type="text"
                                    value={editProfile.address || ''}
                                    onChange={e => handleProfileChange('address', e.target.value)}
                                    placeholder="Full street address"
                                    style={inputStyle(false)}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>
                            {/* Contact + Phone grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div>
                                    <label style={labelStyle}>Contact Person</label>
                                    <input
                                        type="text"
                                        value={editProfile.contact_person || ''}
                                        onChange={e => handleProfileChange('contact_person', e.target.value)}
                                        placeholder="Name of contact"
                                        style={inputStyle(false)}
                                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Primary Phone</label>
                                    <input
                                        type="tel"
                                        value={editProfile.phone_1 || ''}
                                        onChange={e => handleProfileChange('phone_1', e.target.value)}
                                        placeholder="10-digit number"
                                        style={inputStyle(false)}
                                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                    />
                                </div>
                            </div>

                            {/* Save button */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={profileSaving}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 24px', borderRadius: '10px',
                                        background: profileSaved ? 'rgba(16,185,129,0.12)' : 'var(--accent)',
                                        border: profileSaved ? '1.5px solid rgba(16,185,129,0.35)' : 'none',
                                        color: profileSaved ? 'var(--accent)' : '#fff',
                                        fontFamily: 'Inter, sans-serif', fontWeight: 700,
                                        fontSize: '0.9rem', cursor: profileSaving ? 'wait' : 'pointer',
                                        opacity: profileSaving ? 0.75 : 1,
                                        transition: 'background 0.2s, border-color 0.2s, color 0.2s, opacity 0.15s',
                                    }}
                                >
                                    {profileSaved ? <><CheckIcon /> Saved!</> : profileSaving ? 'Saving…' : <><EditIcon /> Save Changes</>}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ── Modals ─────────────────────────────────────── */}
            <AnimatePresence>
                {showAddDoc && (
                    <AddDoctorModal
                        onAdd={handleAddDoctor}
                        onClose={() => setShowAddDoc(false)}
                    />
                )}
                {confirmRemove && (
                    <ConfirmModal
                        doctorName={confirmRemove.name}
                        onConfirm={handleConfirmRemove}
                        onCancel={() => setConfirmRemove(null)}
                        loading={!!removingId}
                    />
                )}
            </AnimatePresence>

            {/* ── Toast ──────────────────────────────────────── */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        key={toast.msg}
                        message={toast.msg}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
