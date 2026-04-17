import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Clock, User, Pill, ActivitySquare, Shield, CreditCard, HelpCircle, LogOut as LogOutIcon } from 'lucide-react';
import api from '../../api/axios';
import SparkleCanvas from '../../components/SparkleCanvas';
import {
    getPatientTimeline,
    getHealthProfile,
    updateHealthProfile,
    getMedicationReminders,
    createMedicationReminder,
    patchMedicationReminder,
} from '../../api/patient';
import { useDashboardData } from '../../hooks/useDashboardData';
import LiveStatusCard from '../../components/dashboard/LiveStatusCard';
import StatsRow from '../../components/dashboard/StatsRow';
import Recommendations from '../../components/dashboard/Recommendations';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import NearbyHospitals from '../../components/dashboard/NearbyHospitals';
import VisitChart from '../../components/dashboard/VisitChart';
import ResumeCard from '../../components/dashboard/ResumeCard';

/* ─────────────────────────────────────────────
   Animated counter
───────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', duration = 1.4 }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const isNum = typeof target === 'number';
        if (!isNum) return;
        let start = null;
        const step = (ts) => {
            if (!start) start = ts;
            const prog = Math.min((ts - start) / (duration * 1000), 1);
            const ease = 1 - Math.pow(1 - prog, 3);
            setDisplay(Math.round(ease * target));
            if (prog < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration]);
    return typeof target === 'number' ? <>{display}{suffix}</> : <>{target}</>;
}

/* ─────────────────────────────────────────────
   Floating orb background
───────────────────────────────────────────── */
function FloatingOrbs() {
    const orbs = [
        { size: 340, x: '-8%', y: '-12%', color: 'rgba(11,158,135,0.10)', delay: 0 },
        { size: 260, x: '78%', y: '5%', color: 'rgba(52,217,190,0.08)', delay: 1.2 },
        { size: 200, x: '55%', y: '60%', color: 'rgba(11,158,135,0.07)', delay: 2.4 },
        { size: 180, x: '-5%', y: '65%', color: 'rgba(88,226,200,0.06)', delay: 0.8 },
    ];
    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
            {orbs.map((o, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: o.size,
                        height: o.size,
                        left: o.x,
                        top: o.y,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
                    }}
                    animate={{ scale: [1, 1.12, 1], x: [0, 14, 0], y: [0, -10, 0] }}
                    transition={{ duration: 8 + i * 1.5, delay: o.delay, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Nav
───────────────────────────────────────────── */
const NAV_ITEMS = [
    { label: 'Dashboard', to: '/patient/dashboard', icon: '◈' },
    { label: 'Appointments', to: '/patient/appointments', icon: '◷' },
    { label: 'Hospitals', to: '/hospitals', icon: '✦' },
    { label: 'Doctors', to: '/doctors', icon: '✿' },
];

function PatientNav({ active = '', patientName = '' }) {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const avatarInitials = patientName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() || '')
        .join('') || '?';

    return (
        <motion.header
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: scrolled ? 'rgba(240,250,248,0.85)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(214,238,234,0.7)' : '1px solid transparent',
                padding: '0 40px', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
            }}
        >
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <div className="logo-mark" style={{ width: 34, height: 34, borderRadius: '10px' }}>
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" />
                    </svg>
                </div>
                <span style={{ fontSize: '1.0625rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>QueueEase</span>
            </Link>

            {/* Nav links */}
            <nav style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px' }}>
                {NAV_ITEMS.map(item => {
                    const isActive = active === item.to;
                    return (
                        <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ background: isActive ? undefined : 'rgba(11,158,135,0.06)' }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '6px 14px', borderRadius: '8px',
                                    background: isActive ? 'var(--accent)' : 'transparent',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    fontSize: '0.8125rem', fontWeight: isActive ? 700 : 500,
                                    transition: 'all 0.15s', cursor: 'pointer',
                                }}
                            >
                                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{item.icon}</span>
                                {item.label}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Avatar */}
            <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#0b9e87,#34d9be)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: 800, color: 'white',
                    boxShadow: '0 2px 10px rgba(11,158,135,0.35)',
                }}>{avatarInitials}</div>
                <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{patientName || 'Patient'}</p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>My Account</p>
                </div>
            </motion.div>
        </motion.header>
    );
}

export { PatientNav };

/* ─────────────────────────────────────────────
   Quick search chips
───────────────────────────────────────────── */
const QUICK_SEARCHES = [
    { label: 'Heart checkup', icon: '❤️' },
    { label: 'Headache & migraine', icon: '🧠' },
    { label: 'Back pain', icon: '🦴' },
    { label: 'Skin rash', icon: '🩺' },
    { label: 'Stomach acidity', icon: '🫁' },
    { label: 'Knee pain', icon: '🦵' },
    { label: 'Fever & cold', icon: '🌡️' },
    { label: 'Eye checkup', icon: '👁️' },
    { label: 'Anxiety & stress', icon: '🧘' },
    { label: 'Child vaccination', icon: '💉' },
    { label: 'Cancer screening', icon: '🔬' },
    { label: 'Kidney stone', icon: '🫀' },
];

/* ─────────────────────────────────────────────
   Stats
───────────────────────────────────────────── */
const STATS = [
    { icon: '🏥', value: 11, suffix: '+', label: 'Hospitals', color: '#0b9e87' },
    { icon: '👨‍⚕️', value: 7, suffix: '+', label: 'Doctors', color: '#5865f2' },
    { icon: '⚡', value: '<5 min', suffix: '', label: 'Avg. booking', color: '#f59e0b' },
    { icon: '⭐', value: 4.9, suffix: '', label: 'Avg. rating', color: '#ec4899' },
];

/* ─────────────────────────────────────────────
   Action cards
───────────────────────────────────────────── */
const ACTIONS = [
    {
        icon: '🔍',
        title: 'Find a Doctor',
        desc: 'Browse 7+ verified specialists by name, symptom, or specialty — with live token availability.',
        to: '/doctors',
        gradient: 'linear-gradient(135deg,#0b9e87 0%,#34d9be 100%)',
        glow: 'rgba(11,158,135,0.22)',
        tag: 'Most popular',
    },
    {
        icon: '🏥',
        title: 'Explore Hospitals',
        desc: 'Discover top-rated hospitals near you. Filter by city, services, and availability.',
        to: '/hospitals',
        gradient: 'linear-gradient(135deg,#5865f2 0%,#8b95ff 100%)',
        glow: 'rgba(88,101,242,0.20)',
        tag: '',
    },
    {
        icon: '📅',
        title: 'My Appointments',
        desc: 'Track your upcoming tokens, get reminders, and view your consultation history.',
        to: '/patient/appointments',
        gradient: 'linear-gradient(135deg,#f59e0b 0%,#fcd34d 100%)',
        glow: 'rgba(245,158,11,0.18)',
        tag: '',
    },
];

/* ─────────────────────────────────────────────
   Trust strip
───────────────────────────────────────────── */
const TRUST = [
    { label: 'NABH Accredited', icon: '🏅' },
    { label: 'ISO 27001 Secure', icon: '🔒' },
    { label: 'Verified Doctors', icon: '✅' },
    { label: '24/7 Support', icon: '🕐' },
];

const formatSlotTime = (slot) => {
    const [hours, minutes] = String(slot || '').split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return slot || 'Time TBD';
    }

    const dt = new Date();
    dt.setHours(hours, minutes, 0, 0);
    return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const formatAppointmentDate = (dateValue, slot) => {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
        return slot ? formatSlotTime(slot) : 'Date TBD';
    }

    const dateText = parsed.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return slot ? `${dateText}, ${formatSlotTime(slot)}` : dateText;
};

const formatAppointmentStatus = (status) => {
    const raw = String(status || '').toLowerCase();
    if (raw === 'booked') return 'Booked';
    if (raw === 'confirmed') return 'Confirmed';
    if (raw === 'completed') return 'Completed';
    if (raw === 'cancelled') return 'Cancelled';
    return raw ? `${raw[0].toUpperCase()}${raw.slice(1)}` : 'Pending';
};

const getStatusColors = (statusLabel) => {
    if (statusLabel === 'Booked' || statusLabel === 'Confirmed') {
        return { background: 'rgba(16,185,129,0.12)', color: '#0b9e87' };
    }
    if (statusLabel === 'Completed') {
        return { background: 'rgba(14,165,233,0.12)', color: '#0284c7' };
    }
    if (statusLabel === 'Cancelled') {
        return { background: 'rgba(239,68,68,0.12)', color: '#dc2626' };
    }
    return { background: 'rgba(245,158,11,0.12)', color: '#d97706' };
};

const formatWaitTime = (minutes) => {
    const value = Number(minutes);
    if (Number.isNaN(value) || value <= 0) return 'Now';
    if (value < 60) return `${value} mins`;

    const hours = Math.floor(value / 60);
    const remainingMinutes = value % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/* ─────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────── */
export default function PatientDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarHovered, setSidebarHovered] = useState(false);

    const SIDEBAR_ITEMS = useMemo(() => [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'timeline', label: 'Timeline', icon: Clock },
        { id: 'profile', label: 'Health Profile', icon: User },
        { id: 'medications', label: 'Medications', icon: Pill },
        { id: 'reports', label: 'Lab Reports', icon: ActivitySquare },
        { id: 'billing', label: 'Billing', icon: CreditCard },
        { id: 'insurance', label: 'Insurance', icon: Shield },
        { id: 'support', label: 'Support', icon: HelpCircle },
    ], []);

    const dashboard = useDashboardData({ statusPollMs: 30_000 });
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setFocused] = useState(false);
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(true);
    const [appointmentsError, setAppointmentsError] = useState('');

    const [timeline, setTimeline] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(true);
    const [timelineError, setTimelineError] = useState('');

    const [healthProfile, setHealthProfile] = useState(null);
    const [healthProfileLoading, setHealthProfileLoading] = useState(true);
    const [healthProfileError, setHealthProfileError] = useState('');
    const [healthEdit, setHealthEdit] = useState(false);
    const [healthDraft, setHealthDraft] = useState({ bloodGroup: '', allergies: '', chronicConditions: '' });
    const [healthSaving, setHealthSaving] = useState(false);

    const [reminders, setReminders] = useState([]);
    const [remindersLoading, setRemindersLoading] = useState(true);
    const [remindersError, setRemindersError] = useState('');
    const [addReminderOpen, setAddReminderOpen] = useState(false);
    const [addReminderDraft, setAddReminderDraft] = useState({
        medicineName: '',
        dosage: '',
        frequencyType: 'DAILY',
        time1: '09:00',
        time2: '21:00',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
    });
    const [addReminderSaving, setAddReminderSaving] = useState(false);

    const fetchPatientProfile = useCallback(async () => {
        setProfileLoading(true);
        setProfileError('');

        try {
            const response = await api.get('/patient/profile');
            setProfile(response?.data || null);
        } catch (error) {
            setProfileError(error.message || 'Unable to load your profile right now.');
            setProfile(null);
        } finally {
            setProfileLoading(false);
        }
    }, []);

    const prettyApiError = useCallback((msg) => {
        const text = String(msg || '');
        if (!text) return 'Something went wrong.';
        if (text.startsWith('Cannot find /api/')) {
            return 'Backend endpoint not reachable. Restart the backend server so it loads the latest routes.';
        }
        if (text.includes('Network Error')) {
            return 'Cannot reach the backend. Make sure the backend is running on port 5000.';
        }
        return text;
    }, []);

    const fetchTimeline = useCallback(async () => {
        setTimelineLoading(true);
        setTimelineError('');
        try {
            const response = await getPatientTimeline();
            setTimeline(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            setTimelineError(prettyApiError(error.message) || 'Unable to load your medical timeline right now.');
            setTimeline([]);
        } finally {
            setTimelineLoading(false);
        }
    }, [prettyApiError]);

    const fetchHealthProfile = useCallback(async () => {
        setHealthProfileLoading(true);
        setHealthProfileError('');
        try {
            const response = await getHealthProfile();
            const data = response?.data || null;
            setHealthProfile(data);
            setHealthDraft({
                bloodGroup: data?.bloodGroup || '',
                allergies: Array.isArray(data?.allergies) ? data.allergies.join(', ') : '',
                chronicConditions: Array.isArray(data?.chronicConditions) ? data.chronicConditions.join(', ') : '',
            });
        } catch (error) {
            setHealthProfileError(prettyApiError(error.message) || 'Unable to load your health profile right now.');
            // allow UI to still be editable with defaults
            setHealthProfile((prev) => prev || { bloodGroup: profile?.blood_group || '', allergies: [], chronicConditions: [] });
        } finally {
            setHealthProfileLoading(false);
        }
    }, [prettyApiError, profile?.blood_group]);

    const fetchReminders = useCallback(async () => {
        setRemindersLoading(true);
        setRemindersError('');
        try {
            const response = await getMedicationReminders();
            setReminders(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            setRemindersError(prettyApiError(error.message) || 'Unable to load medication reminders right now.');
            setReminders([]);
        } finally {
            setRemindersLoading(false);
        }
    }, [prettyApiError]);

    const submitSearch = useCallback(() => {
        const q = searchQuery.trim();
        if (!q) return;
        navigate(`/patient/search?q=${encodeURIComponent(q)}`);
    }, [navigate, searchQuery]);

    const fetchAppointments = useCallback(async () => {
        setAppointmentsLoading(true);
        setAppointmentsError('');

        try {
            const response = await api.get('/appointments/my');
            const appointmentList = Array.isArray(response?.data) ? response.data : [];
            setAppointments(appointmentList);
        } catch (error) {
            setAppointmentsError(error.message || 'Unable to load appointments right now.');
            setAppointments([]);
        } finally {
            setAppointmentsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatientProfile();
    }, [fetchPatientProfile]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    useEffect(() => {
        fetchTimeline();
        fetchHealthProfile();
        fetchReminders();
    }, [fetchTimeline, fetchHealthProfile, fetchReminders]);

    useEffect(() => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;
        if (Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
        }
    }, []);

    const firstName = useMemo(() => {
        const name = profile?.first_name || profile?.full_name || '';
        return name.trim().split(/\s+/)[0] || '';
    }, [profile]);

    const welcomeHeading = firstName ? `Welcome back, ${firstName}!` : 'Welcome back!';
    const welcomeText = useMemo(() => welcomeHeading.split(' '), [welcomeHeading]);

    const upcomingAppointments = useMemo(
        () => {
            const now = new Date();

            return appointments
            .filter((apt) => {
                const status = String(apt.status || '').toLowerCase();
                if (!['booked', 'confirmed'].includes(status)) return false;

                const datePart = String(apt.date || '').split('T')[0];
                const slotPart = String(apt.slot || '00:00');
                const appointmentDateTime = new Date(`${datePart}T${slotPart}:00`);

                if (Number.isNaN(appointmentDateTime.getTime())) return false;
                return appointmentDateTime > now;
            })
            .map(apt => ({
                id: apt.id,
                doctor: apt.doctor || 'Doctor not available',
                date: formatAppointmentDate(apt.date, apt.slot),
                status: formatAppointmentStatus(apt.status),
                type: apt.specialty || 'General',
            }));
        },
        [appointments]
    );

    const completedVisits = useMemo(
        () => appointments.filter(apt => String(apt.status || '').toLowerCase() === 'completed').length,
        [appointments]
    );

    const quickStats = useMemo(
        () => [
            { label: 'Upcoming Appts', value: appointments.length },
            { label: 'Pending Reports', value: 0 },
            { label: 'Favorite Doctors', value: 0 },
            { label: 'Total Visits', value: completedVisits },
        ],
        [appointments.length, completedVisits]
    );

    // Medication reminder tick (client-side notifications)
    useEffect(() => {
        const parseFrequency = (freqRaw) => {
            const raw = String(freqRaw || '');
            const [type, timesRaw] = raw.split('@');
            const times = (timesRaw || '')
                .split(',')
                .map(t => t.trim())
                .filter(Boolean);
            return { type: (type || '').trim(), times };
        };

        const shouldNotifyNow = (rem, now) => {
            if (!rem?.active) return false;
            const start = rem.startDate ? new Date(rem.startDate) : null;
            const end = rem.endDate ? new Date(rem.endDate) : null;
            if (start && now < start) return false;
            if (end && now > end) return false;

            const { type, times } = parseFrequency(rem.frequency);
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const key = `${hh}:${mm}`;
            if (type === 'DAILY') return times.includes(key);
            if (type === 'TWICE_DAILY') return times.includes(key);
            return false;
        };

        const sentKey = (remId, now) => `${remId}:${now.toISOString().slice(0, 16)}`; // per-minute key

        const id = setInterval(() => {
            if (typeof window === 'undefined' || !('Notification' in window)) return;
            if (Notification.permission !== 'granted') return;
            const now = new Date();
            reminders
                .filter(r => r?.active)
                .forEach((rem) => {
                    if (!shouldNotifyNow(rem, now)) return;
                    const key = sentKey(rem.id, now);
                    if (sessionStorage.getItem(key)) return;
                    sessionStorage.setItem(key, '1');
                    new Notification('Medication reminder', {
                        body: `${rem.medicineName} — ${rem.dosage}`,
                    });
                });
        }, 60_000);
        return () => clearInterval(id);
    }, [reminders]);

    const quickActions = [
        { icon: '📅', label: 'Book Appt', desc: 'Find doctors/slots', link: '/patient/search' },
        { icon: '📁', label: 'Upload Record', desc: 'Add files', link: '#' },
        { icon: '📄', label: 'History', desc: 'Past visits', link: '#' },
        { icon: '💊', label: 'Medicines', desc: 'Order now', link: '#' },
    ];

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, color: 'var(--text-primary)' }}>
            <FloatingOrbs />
            <div style={{ position: 'relative', zIndex: 2 }}>
                <PatientNav active='/patient/dashboard' patientName={profile?.full_name || ''} />

                <div style={{ display: 'flex', gap: '32px', maxWidth: '1300px', margin: '0 auto', padding: '32px 24px 80px', alignItems: 'flex-start', paddingLeft: '96px' }}>
                    {/* EXPANDING SIDEBAR (FIXED TO LEFT EDGE) */}
                    <motion.nav
                        onHoverStart={() => setSidebarHovered(true)}
                        onHoverEnd={() => setSidebarHovered(false)}
                        animate={{ width: isSidebarHovered ? 240 : 80 }}
                        style={{
                            position: 'fixed', top: '100px', left: '16px', zIndex: 60,
                            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(214,238,234,0.8)', borderRadius: '24px',
                            padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '12px',
                            overflow: 'hidden', flexShrink: 0, boxShadow: '0 12px 40px rgba(11,158,135,0.05)',
                            height: 'calc(100vh - 120px)'
                        }}
                    >
                        {SIDEBAR_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <motion.div
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    whileHover={{ 
                                        x: isActive ? 0 : 4,
                                        background: isActive ? 'var(--accent)' : 'rgba(11,158,135,0.08)'
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '16px', padding: '14px',
                                        borderRadius: '16px', cursor: 'pointer',
                                        background: isActive ? 'var(--accent)' : 'transparent',
                                        color: isActive ? '#fff' : 'var(--text-secondary)',
                                        transition: 'all 0.2s ease', whiteSpace: 'nowrap'
                                    }}
                                >
                                    <Icon size={24} style={{ flexShrink: 0 }} />
                                    <span style={{ fontWeight: 800, fontSize: '0.9375rem', opacity: isSidebarHovered ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: isSidebarHovered ? 'auto' : 'none' }}>
                                        {item.label}
                                    </span>
                                </motion.div>
                            );
                        })}
                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'center', opacity: isSidebarHovered ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}>
                                ACCOUNT
                            </div>
                            <motion.div
                                whileHover={{ x: 4, background: 'rgba(244,63,94,0.08)' }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', borderRadius: '16px', cursor: 'pointer',
                                    color: 'var(--error)', transition: 'all 0.2s ease', whiteSpace: 'nowrap'
                                }}
                            >
                                {/* Placeholder for Logout */}
                                <LogOutIcon size={24} style={{ flexShrink: 0 }} />
                                <span style={{ fontWeight: 800, fontSize: '0.9375rem', opacity: isSidebarHovered ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: isSidebarHovered ? 'auto' : 'none' }}>
                                    Log out
                                </span>
                            </motion.div>
                        </div>
                    </motion.nav>

                    {/* MAIN CONTENT AREA WITH DUAL MARGIN SO SIDEBAR DOESNT OVERLAP */}
                    <div style={{ flex: 1, minWidth: 0, marginLeft: isSidebarHovered ? '160px' : '0', transition: 'margin-left 0.3s ease-out' }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            
                            {/* Header & Badges */}
                        <header style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                                <div>
                                    {profileLoading ? (
                                        <div
                                            style={{
                                                width: '320px',
                                                maxWidth: '100%',
                                                height: '48px',
                                                borderRadius: '14px',
                                                background: 'rgba(11,158,135,0.12)',
                                                marginBottom: '8px',
                                            }}
                                        />
                                    ) : (
                                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {welcomeText.map((word, i) => (
                                                <motion.span
                                                    key={i}
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                                >
                                                    {word}
                                                </motion.span>
                                            ))}
                                        </h1>
                                    )}
                                    <motion.p 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                                        style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', marginTop: '10px', marginBottom: 0 }}
                                    >
                                        Here is what's happening with your health today.
                                    </motion.p>
                                    {profileError && (
                                        <p style={{ marginTop: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                            {profileError}
                                        </p>
                                    )}
                                </div>
                                <motion.div 
                                    style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}
                                >
                                    {appointmentsLoading
                                        ? [0, 1, 2, 3].map((idx) => (
                                            <motion.div
                                                key={`loading-${idx}`}
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                style={{
                                                    padding: '16px 24px',
                                                    background: 'rgba(255,255,255,0.75)',
                                                    backdropFilter: 'blur(16px)',
                                                    border: '1px solid rgba(214,238,234,0.8)',
                                                    borderRadius: '20px',
                                                    textAlign: 'center',
                                                    boxShadow: '0 8px 32px rgba(11,158,135,0.05)',
                                                    minWidth: '130px',
                                                }}
                                            >
                                                <div style={{ width: '56px', height: '28px', borderRadius: '10px', margin: '0 auto 8px', background: 'rgba(11,158,135,0.12)' }} />
                                                <div style={{ width: '88px', height: '10px', borderRadius: '999px', margin: '0 auto', background: 'rgba(11,158,135,0.1)' }} />
                                            </motion.div>
                                        ))
                                        : quickStats.map((stat, i) => (
                                            <motion.div 
                                                key={stat.label}
                                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                                style={{ 
                                                    padding: '16px 24px', 
                                                    background: 'rgba(255,255,255,0.75)', 
                                                    backdropFilter: 'blur(16px)',
                                                    border: '1px solid rgba(214,238,234,0.8)',
                                                    borderRadius: '20px',
                                                    textAlign: 'center',
                                                    boxShadow: '0 8px 32px rgba(11,158,135,0.05)',
                                                    minWidth: '130px'
                                                }}
                                            >
                                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '4px' }}>
                                                    <AnimatedCounter target={stat.value} />
                                                </div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {stat.label}
                                                </div>
                                            </motion.div>
                                        ))}
                                </motion.div>
                            </div>
                            {appointmentsError && (
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '-8px' }}>
                                    {appointmentsError}
                                </p>
                            )}
                        </header>

                        {/* Search Bar */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            style={{
                                position: 'relative', marginBottom: '48px',
                                background: 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(16px)',
                                borderRadius: '20px',
                                border: '1px solid rgba(214,238,234,0.9)',
                                padding: '6px 18px',
                                boxShadow: isFocused ? '0 0 0 4px rgba(11,158,135,0.15)' : '0 8px 32px rgba(0,0,0,0.06)',
                                transition: 'box-shadow 0.3s, border-color 0.3s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <svg width='24' height='24' fill='none' stroke='var(--accent)' viewBox='0 0 24 24' strokeWidth='2' style={{ flexShrink: 0 }}>
                                    <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                                </svg>
                                <input 
                                    type='text' 
                                    placeholder='Search for doctors, specialties, or hospitals...' 
                                    style={{
                                        flex: 1, padding: '16px 16px', border: 'none', outline: 'none',
                                        background: 'transparent', fontSize: '1.0625rem', color: 'var(--text-primary)',
                                        fontFamily: 'inherit'
                                    }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') submitSearch();
                                    }}
                                />
                                <button
                                    onClick={submitSearch}
                                    style={{
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #0b9e87, #34d9be)',
                                        color: 'white',
                                        borderRadius: '14px',
                                        padding: '10px 14px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        boxShadow: '0 8px 24px rgba(11,158,135,0.18)',
                                    }}
                                >
                                    Search
                                </button>
                            </div>
                        </motion.div>

                        {/* 2-Column Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'overview' ? 'minmax(0, 1.8fr) minmax(0, 1.2fr)' : '1fr', gap: '40px' }}>
                            
                            {/* Left Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                {activeTab === 'overview' && (
                                    <>
                                        <div id="live-status" style={{ scrollMarginTop: '90px' }}>
                                            <LiveStatusCard
                                                loading={dashboard.status.loading}
                                                error={dashboard.status.error}
                                                data={dashboard.status.data}
                                                polledAt={dashboard.status.fetchedAt}
                                                nextRefreshSec={dashboard.nextRefreshSec}
                                            />
                                        </div>

                                        {/* Upcoming Appointments */}
                                        <motion.section whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true, amount: 0.1 }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Upcoming Appointments</h2>
                                    {appointmentsLoading ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {[0, 1].map((idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        padding: '20px 24px',
                                                        borderRadius: '20px',
                                                        background: 'rgba(255,255,255,0.8)',
                                                        backdropFilter: 'blur(16px)',
                                                        border: '1px solid rgba(214,238,234,0.7)',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                                    }}
                                                >
                                                    <div style={{ width: '210px', maxWidth: '100%', height: '16px', borderRadius: '999px', background: 'rgba(11,158,135,0.14)', marginBottom: '10px' }} />
                                                    <div style={{ width: '280px', maxWidth: '100%', height: '12px', borderRadius: '999px', background: 'rgba(11,158,135,0.1)' }} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : appointmentsError ? (
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                            {appointmentsError}
                                        </p>
                                    ) : upcomingAppointments.length === 0 ? (
                                        <div
                                            style={{
                                                padding: '24px',
                                                borderRadius: '20px',
                                                background: 'rgba(255,255,255,0.8)',
                                                backdropFilter: 'blur(16px)',
                                                border: '1px solid rgba(214,238,234,0.7)',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                                No upcoming appointments
                                            </p>
                                            <Link to='/patient/search' style={{ textDecoration: 'none' }}>
                                                <button
                                                    style={{
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        padding: '10px 20px',
                                                        background: 'linear-gradient(135deg, #0b9e87, #34d9be)',
                                                        color: '#fff',
                                                        fontSize: '0.8125rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Book Appointment
                                                </button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {upcomingAppointments.map((appt, i) => {
                                                const statusColors = getStatusColors(appt.status);
                                                return (
                                                    <motion.div
                                                        key={appt.id}
                                                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                                        style={{
                                                            padding: '20px 24px', borderRadius: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
                                                            background: 'rgba(255,255,255,0.8)',
                                                            backdropFilter: 'blur(16px)',
                                                            border: '1px solid rgba(214,238,234,0.7)',
                                                            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                                        }}
                                                    >
                                                        <div>
                                                            <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, marginBottom: '6px' }}>{appt.doctor}</h4>
                                                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{appt.type} • {appt.date}</p>
                                                        </div>
                                                        <span style={{
                                                            padding: '6px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                                            background: statusColors.background,
                                                            color: statusColors.color,
                                                        }}>
                                                            {appt.status}
                                                        </span>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.section>
                                </>
                                )}

                                {/* Medical Timeline */}
                                {activeTab === 'timeline' && (
                                    <>
                                <motion.section id="timeline" style={{ scrollMarginTop: '90px' }} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true, amount: 0.1 }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Medical Timeline</h2>
                                    {timelineLoading ? (
                                        <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(214,238,234,0.7)' }}>
                                            <div style={{ width: '220px', height: '14px', borderRadius: '999px', background: 'rgba(11,158,135,0.14)', marginBottom: '10px' }} />
                                            <div style={{ width: '320px', height: '10px', borderRadius: '999px', background: 'rgba(11,158,135,0.10)' }} />
                                        </div>
                                    ) : timelineError ? (
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{timelineError}</p>
                                    ) : timeline.length === 0 ? (
                                        <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(214,238,234,0.7)', textAlign: 'center' }}>
                                            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>No past visits yet.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                            {timeline.map((v, i) => {
                                                const dateObj = new Date(v.date);
                                                const dateLabel = Number.isNaN(dateObj.getTime())
                                                    ? '—'
                                                    : dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                                                return (
                                                    <motion.div
                                                        key={v.id}
                                                        initial={{ opacity: 0, y: 16 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true, amount: 0.2 }}
                                                        transition={{ delay: i * 0.04 }}
                                                        style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: '110px 1fr',
                                                            gap: '14px',
                                                            alignItems: 'stretch',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingTop: '6px' }}>
                                                            <div style={{ fontSize: '0.8125rem', fontWeight: 900, color: 'var(--text-primary)' }}>{dateLabel}</div>
                                                            <div style={{ width: '2px', flex: 1, marginTop: '10px', background: 'linear-gradient(180deg, rgba(11,158,135,0.35), rgba(11,158,135,0.05))', borderRadius: '999px' }} />
                                                        </div>

                                                        <div
                                                            style={{
                                                                padding: '18px 20px',
                                                                borderRadius: '20px',
                                                                background: 'rgba(255,255,255,0.8)',
                                                                backdropFilter: 'blur(16px)',
                                                                border: '1px solid rgba(214,238,234,0.7)',
                                                                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                                                                <div>
                                                                    <h4 style={{ fontSize: '1.0rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '6px' }}>{v.doctor?.name || 'Doctor'}</h4>
                                                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                                        {v.doctor?.specialty || '—'} • {v.hospital?.name || '—'}
                                                                    </p>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                                    <button
                                                                        onClick={() => {
                                                                            const qs = new URLSearchParams();
                                                                            if (v.hospital?.id) qs.set('hospitalId', String(v.hospital.id));
                                                                            qs.set('doctorId', String(v.doctor?.id || ''));
                                                                            navigate(`/patient/book/${v.doctor?.id}?${qs.toString()}`);
                                                                        }}
                                                                        style={{ borderRadius: '10px', padding: '8px 12px', background: 'rgba(11,158,135,0.10)', border: '1px solid rgba(11,158,135,0.22)', color: 'var(--accent-dark)', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}
                                                                    >
                                                                        Rebook Same Doctor
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            const qs = new URLSearchParams();
                                                                            if (v.hospital?.id) qs.set('hospitalId', String(v.hospital.id));
                                                                            qs.set('doctorId', String(v.doctor?.id || ''));
                                                                            qs.set('followUp', '1');
                                                                            navigate(`/patient/book/${v.doctor?.id}?${qs.toString()}`);
                                                                        }}
                                                                        style={{ borderRadius: '10px', padding: '8px 12px', background: 'rgba(88,101,242,0.10)', border: '1px solid rgba(88,101,242,0.22)', color: '#3843c8', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}
                                                                    >
                                                                        Book Follow-up
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {v.diagnosis && (
                                                                <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.18)' }}>
                                                                    <p style={{ fontSize: '0.6875rem', fontWeight: 900, letterSpacing: '0.08em', color: '#0369a1', marginBottom: '6px' }}>DIAGNOSIS</p>
                                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{v.diagnosis}</p>
                                                                </div>
                                                            )}

                                                            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                                                    {v.prescription ? 'Prescription available' : 'No prescription'}
                                                                </div>
                                                                {v.prescription && (
                                                                    <button
                                                                        onClick={() => {
                                                                            // For now, show content inline via alert-like UI in future; keep minimal: open a modal route later.
                                                                            const text = v.prescription?.content || '';
                                                                            if (!text) return;
                                                                            window.alert(text);
                                                                        }}
                                                                        style={{
                                                                            border: 'none',
                                                                            borderRadius: '10px',
                                                                            padding: '8px 12px',
                                                                            background: 'linear-gradient(135deg, #0b9e87, #34d9be)',
                                                                            color: '#fff',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: 900,
                                                                            cursor: 'pointer',
                                                                            fontFamily: 'inherit',
                                                                            whiteSpace: 'nowrap',
                                                                        }}
                                                                    >
                                                                        View Prescription
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.section>

                                <ActivityFeed
                                    loading={dashboard.activity.loading}
                                    error={dashboard.activity.error}
                                    data={dashboard.activity.data}
                                />
                                </>
                                )}

                                {/* Health Profile (Prominent) */}
                                {activeTab === 'profile' && (
                                <motion.section id="health-profile" style={{ scrollMarginTop: '90px' }} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true, amount: 0.1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Health Profile</h2>
                                        {!healthProfileLoading && (
                                            <button
                                                onClick={() => setHealthEdit(v => !v)}
                                                style={{
                                                    border: '1px solid rgba(11,158,135,0.25)',
                                                    background: 'rgba(11,158,135,0.08)',
                                                    color: 'var(--accent-dark)',
                                                    padding: '8px 12px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.8125rem',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                    fontFamily: 'inherit',
                                                }}
                                            >
                                                {healthEdit ? 'Close' : 'Edit'}
                                            </button>
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            padding: '22px',
                                            borderRadius: '22px',
                                            background: 'rgba(255,255,255,0.82)',
                                            backdropFilter: 'blur(18px)',
                                            border: '1px solid rgba(214,238,234,0.8)',
                                            boxShadow: '0 12px 40px rgba(11,158,135,0.08)',
                                        }}
                                    >
                                        {healthProfileLoading ? (
                                            <div style={{ height: '72px', borderRadius: '16px', background: 'rgba(11,158,135,0.10)' }} />
                                        ) : (
                                            <>
                                                {healthProfileError && (
                                                    <div style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', color: '#92400e', fontSize: '0.8125rem', fontWeight: 700 }}>
                                                        {healthProfileError}
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
                                                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>BLOOD GROUP</span>
                                                    <span style={{ marginLeft: 'auto', fontSize: '0.9375rem', fontWeight: 900, color: 'var(--accent)' }}>
                                                        {healthProfile?.bloodGroup || profile?.blood_group || '—'}
                                                    </span>
                                                </div>

                                                {!healthEdit ? (
                                                    <>
                                                        <div style={{ marginBottom: '12px' }}>
                                                            <p style={{ fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>ALLERGIES</p>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                {(healthProfile?.allergies || []).length === 0 ? (
                                                                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>None</span>
                                                                ) : (healthProfile.allergies || []).map((a) => (
                                                                    <span key={a} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(20,184,166,0.10)', border: '1px solid rgba(20,184,166,0.25)', color: '#0f766e', fontSize: '0.75rem', fontWeight: 800 }}>
                                                                        {a}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p style={{ fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>CHRONIC CONDITIONS</p>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                {(healthProfile?.chronicConditions || []).length === 0 ? (
                                                                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>None</span>
                                                                ) : (healthProfile.chronicConditions || []).map((c) => (
                                                                    <span key={c} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(11,158,135,0.10)', border: '1px solid rgba(11,158,135,0.22)', color: 'var(--accent-dark)', fontSize: '0.75rem', fontWeight: 800 }}>
                                                                        {c}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                                                            Blood group
                                                            <input value={healthDraft.bloodGroup} onChange={(e) => setHealthDraft(d => ({ ...d, bloodGroup: e.target.value }))} placeholder="e.g. O+" style={{ marginTop: '6px', width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit' }} />
                                                        </label>
                                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                                                            Allergies (comma-separated)
                                                            <input value={healthDraft.allergies} onChange={(e) => setHealthDraft(d => ({ ...d, allergies: e.target.value }))} placeholder="e.g. Penicillin, Peanuts" style={{ marginTop: '6px', width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit' }} />
                                                        </label>
                                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                                                            Chronic conditions (comma-separated)
                                                            <input value={healthDraft.chronicConditions} onChange={(e) => setHealthDraft(d => ({ ...d, chronicConditions: e.target.value }))} placeholder="e.g. Diabetes, Asthma" style={{ marginTop: '6px', width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit' }} />
                                                        </label>
                                                        <button
                                                            disabled={healthSaving}
                                                            onClick={async () => {
                                                                setHealthSaving(true);
                                                                try {
                                                                    const payload = {
                                                                        bloodGroup: healthDraft.bloodGroup,
                                                                        allergies: healthDraft.allergies.split(',').map(s => s.trim()).filter(Boolean),
                                                                        chronicConditions: healthDraft.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
                                                                    };
                                                                    const resp = await updateHealthProfile(payload);
                                                                    setHealthProfile(resp?.data || null);
                                                                    setHealthEdit(false);
                                                                    setHealthProfileError('');
                                                                } catch (e) {
                                                                    setHealthProfileError(prettyApiError(e.message) || 'Failed to save health profile.');
                                                                } finally {
                                                                    setHealthSaving(false);
                                                                }
                                                            }}
                                                            style={{
                                                                marginTop: '4px',
                                                                border: 'none',
                                                                borderRadius: '12px',
                                                                padding: '12px 14px',
                                                                background: healthSaving ? 'rgba(11,158,135,0.7)' : 'linear-gradient(135deg, #0b9e87, #34d9be)',
                                                                color: '#fff',
                                                                fontSize: '0.875rem',
                                                                fontWeight: 900,
                                                                cursor: healthSaving ? 'not-allowed' : 'pointer',
                                                                fontFamily: 'inherit',
                                                            }}
                                                        >
                                                            {healthSaving ? 'Saving...' : 'Save'}
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </motion.section>
                                )}

                                {/* Quick Actions */}
                                {activeTab === 'overview' && (
                                <motion.section whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true, amount: 0.1 }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Quick Actions</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                        {quickActions.map((action, i) => (
                                            <Link key={i} to={action.link} style={{ textDecoration: 'none' }}>
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                                    whileHover={{ y: -6, borderColor: 'rgba(11,158,135,0.4)', boxShadow: '0 16px 40px rgba(11,158,135,0.15)' }}
                                                    style={{ 
                                                        padding: '24px 20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                                                        background: 'rgba(255,255,255,0.8)', 
                                                        backdropFilter: 'blur(16px)',
                                                        border: '1px solid rgba(214,238,234,0.7)',
                                                        transition: 'box-shadow 0.3s, border-color 0.3s'
                                                    }}
                                                >
                                                    <motion.div 
                                                        whileHover={{ scale: 1.15 }} transition={{ type: 'spring', stiffness: 400 }}
                                                        style={{ 
                                                            width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 8px 24px rgba(11,158,135,0.2)',
                                                            background: 'linear-gradient(135deg, #0b9e87, #34d9be)' 
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '1.5rem', color: 'white', userSelect: 'none' }}>{action.icon}</span>
                                                    </motion.div>
                                                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>{action.label}</div>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{action.desc}</div>
                                                </motion.div>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.section>
                                )}

                                {/* Medication Reminders */}
                                {activeTab === 'medications' && (
                                <motion.section id="medications" style={{ scrollMarginTop: '90px' }} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true, amount: 0.1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Medication Reminders</h2>
                                        <button
                                            onClick={() => setAddReminderOpen(v => !v)}
                                            style={{
                                                border: '1px solid rgba(11,158,135,0.25)',
                                                background: 'rgba(11,158,135,0.08)',
                                                color: 'var(--accent-dark)',
                                                padding: '8px 12px',
                                                borderRadius: '10px',
                                                fontSize: '0.8125rem',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                fontFamily: 'inherit',
                                            }}
                                        >
                                            {addReminderOpen ? 'Close' : '+ Add'}
                                        </button>
                                    </div>

                                    <div style={{ padding: '22px', borderRadius: '22px', background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(18px)', border: '1px solid rgba(214,238,234,0.8)' }}>
                                        {addReminderOpen && (
                                            <div style={{ marginBottom: '16px', padding: '14px', borderRadius: '16px', background: 'rgba(11,158,135,0.06)', border: '1px solid rgba(11,158,135,0.12)' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                    <input value={addReminderDraft.medicineName} onChange={(e) => setAddReminderDraft(d => ({ ...d, medicineName: e.target.value }))} placeholder="Medicine name" style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit' }} />
                                                    <input value={addReminderDraft.dosage} onChange={(e) => setAddReminderDraft(d => ({ ...d, dosage: e.target.value }))} placeholder="Dosage (e.g. 1 tablet)" style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit' }} />
                                                    <select value={addReminderDraft.frequencyType} onChange={(e) => setAddReminderDraft(d => ({ ...d, frequencyType: e.target.value }))} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit' }}>
                                                        <option value="DAILY">Once daily</option>
                                                        <option value="TWICE_DAILY">Twice daily</option>
                                                    </select>
                                                    <input type="date" value={addReminderDraft.startDate} onChange={(e) => setAddReminderDraft(d => ({ ...d, startDate: e.target.value }))} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit' }} />
                                                    <input type="time" value={addReminderDraft.time1} onChange={(e) => setAddReminderDraft(d => ({ ...d, time1: e.target.value }))} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit' }} />
                                                    {addReminderDraft.frequencyType === 'TWICE_DAILY' ? (
                                                        <input type="time" value={addReminderDraft.time2} onChange={(e) => setAddReminderDraft(d => ({ ...d, time2: e.target.value }))} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit' }} />
                                                    ) : (
                                                        <input type="date" value={addReminderDraft.endDate} onChange={(e) => setAddReminderDraft(d => ({ ...d, endDate: e.target.value }))} placeholder="End date (optional)" style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit' }} />
                                                    )}
                                                </div>
                                                <button
                                                    disabled={addReminderSaving}
                                                    onClick={async () => {
                                                        setAddReminderSaving(true);
                                                        try {
                                                            const times = addReminderDraft.frequencyType === 'TWICE_DAILY'
                                                                ? [addReminderDraft.time1, addReminderDraft.time2]
                                                                : [addReminderDraft.time1];
                                                            const payload = {
                                                                medicineName: addReminderDraft.medicineName,
                                                                dosage: addReminderDraft.dosage,
                                                                frequency: `${addReminderDraft.frequencyType}@${times.join(',')}`,
                                                                startDate: addReminderDraft.startDate,
                                                                endDate: addReminderDraft.frequencyType === 'TWICE_DAILY' ? (addReminderDraft.endDate || null) : (addReminderDraft.endDate || null),
                                                            };
                                                            await createMedicationReminder(payload);
                                                            await fetchReminders();
                                                            setAddReminderOpen(false);
                                                            setAddReminderDraft((d) => ({ ...d, medicineName: '', dosage: '' }));
                                                        } catch (e) {
                                                            setRemindersError(e.message || 'Failed to add reminder.');
                                                        } finally {
                                                            setAddReminderSaving(false);
                                                        }
                                                    }}
                                                    style={{
                                                        marginTop: '12px',
                                                        width: '100%',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        padding: '12px 14px',
                                                        background: addReminderSaving ? 'rgba(11,158,135,0.7)' : 'linear-gradient(135deg, #0b9e87, #34d9be)',
                                                        color: '#fff',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 900,
                                                        cursor: addReminderSaving ? 'not-allowed' : 'pointer',
                                                        fontFamily: 'inherit',
                                                    }}
                                                >
                                                    {addReminderSaving ? 'Adding...' : 'Add reminder'}
                                                </button>
                                            </div>
                                        )}

                                        {remindersLoading ? (
                                            <div style={{ height: '72px', borderRadius: '16px', background: 'rgba(11,158,135,0.10)' }} />
                                        ) : (
                                            <>
                                                {remindersError && (
                                                    <div style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', color: '#92400e', fontSize: '0.8125rem', fontWeight: 700 }}>
                                                        {remindersError}
                                                    </div>
                                                )}
                                                {reminders.filter(r => r.active).length === 0 ? (
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No active reminders yet.</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {reminders.filter(r => r.active).map((r) => (
                                                    <div key={r.id} style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(214,238,234,0.7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                                        <div>
                                                            <p style={{ fontSize: '0.9375rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>{r.medicineName}</p>
                                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                                {r.dosage} • {String(r.frequency || '').replace('_', ' ').replace('@', ' @ ')}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await patchMedicationReminder(r.id, { active: false });
                                                                    await fetchReminders();
                                                                } catch (e) {
                                                                    setRemindersError(e.message || 'Failed to update reminder.');
                                                                }
                                                            }}
                                                            style={{
                                                                border: '1px solid rgba(0,0,0,0.10)',
                                                                background: 'rgba(0,0,0,0.04)',
                                                                color: 'var(--text-muted)',
                                                                padding: '8px 12px',
                                                                borderRadius: '10px',
                                                                fontSize: '0.8125rem',
                                                                fontWeight: 900,
                                                                cursor: 'pointer',
                                                                fontFamily: 'inherit',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            Mark inactive
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </motion.section>
                                )}
                            </div>

                            {/* Right Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                {activeTab === 'overview' && (
                                    <>
                                <ResumeCard
                                    loading={dashboard.lastAction.loading}
                                    error={dashboard.lastAction.error}
                                    data={dashboard.lastAction.data}
                                />

                                <div id="stats" style={{ scrollMarginTop: '90px' }}>
                                    <StatsRow
                                        loading={dashboard.stats.loading}
                                        error={dashboard.stats.error}
                                        data={dashboard.stats.data}
                                    />
                                </div>

                                <Recommendations
                                    loading={dashboard.recommendations.loading}
                                    error={dashboard.recommendations.error}
                                    data={dashboard.recommendations.data}
                                />
                                </>
                                )}
                            </div>

                        </div>

                        {activeTab === 'overview' && (
                        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '24px' }}>
                            <NearbyHospitals
                                loading={dashboard.hospitals.loading}
                                error={dashboard.hospitals.error}
                                data={dashboard.hospitals.data}
                            />
                            <VisitChart
                                loading={dashboard.analytics.loading}
                                error={dashboard.analytics.error}
                                data={dashboard.analytics.data}
                            />
                        </div>
                        )}
                    </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
