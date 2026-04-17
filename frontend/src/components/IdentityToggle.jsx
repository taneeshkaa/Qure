import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const OPTIONS = [
    {
        value: 'hospital',
        label: 'Healthcare Provider',
        icon: (
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m7-11v6m-3-3h6" />
            </svg>
        ),
    },
    {
        value: 'patient',
        label: 'Patient',
        icon: (
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
    {
        value: 'doctor',
        label: 'Doctor',
        icon: (
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
        // Doctor registration is a dedicated standalone page
        href: '/doctor/register',
    },
];

export default function IdentityToggle({ value, onChange }) {
    const navigate = useNavigate();

    return (
        <div className="seg-control" role="tablist" aria-label="Account type">
            {OPTIONS.map((opt) => {
                const active = value === opt.value;
                return (
                    <motion.button
                        key={opt.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => {
                            if (opt.href) {
                                // Doctor tab navigates to its own dedicated page
                                navigate(opt.href);
                            } else {
                                onChange(opt.value);
                            }
                        }}
                        whileTap={{ scale: 0.96 }}
                        className={`seg-btn ${active ? 'active' : ''}`}
                        layout
                    >
                        <motion.span
                            animate={{
                                color: active ? 'var(--accent)' : 'var(--text-muted)',
                                scale: active ? 1.1 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex' }}
                        >
                            {opt.icon}
                        </motion.span>
                        {opt.label}
                    </motion.button>
                );
            })}
        </div>
    );
}
