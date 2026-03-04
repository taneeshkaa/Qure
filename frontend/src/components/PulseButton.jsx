import { motion } from 'framer-motion';

const Loader = () => (
    <svg className="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
);

const CheckIcon = () => (
    <motion.svg
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </motion.svg>
);

export default function PulseButton({ children, loading, success, error: hasError, disabled, style = {}, ...props }) {
    let bg = undefined; // will use CSS gradient from btn-primary
    let color = 'white';

    if (success) {
        bg = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
    }
    if (hasError) {
        bg = 'rgba(244,63,94,0.1)';
        color = 'var(--error)';
    }
    if (disabled || loading) {
        bg = 'rgba(214, 238, 234, 0.7)';
        color = 'var(--text-muted)';
    }

    return (
        <motion.button
            whileTap={!disabled && !loading ? { scale: 0.975 } : {}}
            className={`btn-primary ${loading ? 'pulse-ring' : ''}`}
            disabled={loading || disabled}
            style={{
                ...(bg ? { background: bg } : {}),
                color,
                ...style,
            }}
            {...props}
        >
            {loading && <Loader />}
            {success && <CheckIcon />}
            {loading ? 'Processing…' : success ? 'Done!' : children}
        </motion.button>
    );
}
