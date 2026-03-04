import { motion } from 'framer-motion';

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
];

export default function IdentityToggle({ value, onChange }) {
    return (
        <div className="seg-control" role="tablist" aria-label="Account type">
            {OPTIONS.map((opt, idx) => {
                const active = value === opt.value;
                return (
                    <motion.button
                        key={opt.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(opt.value)}
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
