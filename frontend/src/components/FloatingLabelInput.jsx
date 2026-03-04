import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingLabelInput = forwardRef(function FloatingLabelInput(
    { label, error, type = 'text', className = '', hint, ...props },
    ref
) {
    const [focused, setFocused] = useState(false);
    const prevError = error;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {label && (
                <motion.label
                    animate={{
                        color: error
                            ? 'var(--error)'
                            : focused
                                ? 'var(--accent)'
                                : 'var(--text-secondary)',
                    }}
                    transition={{ duration: 0.15 }}
                    style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.01em',
                    }}
                >
                    {label}
                </motion.label>
            )}

            <motion.input
                ref={ref}
                type={type}
                /* Shake on error */
                animate={error ? { x: [0, -7, 7, -5, 5, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.42, ease: 'easeInOut' }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`input-field ${error ? 'has-error' : ''} ${className}`}
                {...props}
            />

            <AnimatePresence mode="wait">
                {error && (
                    <motion.p
                        key={error}
                        initial={{ opacity: 0, y: -5, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -3, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{
                            fontSize: '0.75rem',
                            color: 'var(--error)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            overflow: 'hidden',
                        }}
                    >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {hint && !error && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</p>
            )}
        </div>
    );
});

export default FloatingLabelInput;
