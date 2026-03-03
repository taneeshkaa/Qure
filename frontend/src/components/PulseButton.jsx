import { motion } from 'framer-motion';

const Loader = () => (
    <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
);
const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export default function PulseButton({ children, loading, success, error: hasError, disabled, style = {}, ...props }) {
    let bg = 'var(--accent)';
    let color = 'white';

    if (success) { bg = 'var(--success)'; }
    if (hasError) { bg = 'rgba(244,63,94,0.15)'; color = 'var(--error)'; }
    if (disabled || loading) { bg = 'var(--bg-elevated)'; color = 'var(--text-muted)'; }

    return (
        <motion.button
            whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
            className={`btn-primary ${loading ? 'pulse-ring' : ''}`}
            disabled={loading || disabled}
            style={{ background: bg, color, ...style }}
            {...props}
        >
            {loading && <Loader />}
            {success && <CheckIcon />}
            {loading ? 'Processing...' : success ? 'Done!' : children}
        </motion.button>
    );
}
