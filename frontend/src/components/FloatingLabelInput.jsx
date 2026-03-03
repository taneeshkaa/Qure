import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';

const FloatingLabelInput = forwardRef(function FloatingLabelInput(
    { label, error, type = 'text', className = '', hint, ...props },
    ref
) {
    const [focused, setFocused] = useState(false);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {label && (
                <label
                    style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: error ? 'var(--error)' : focused ? 'var(--accent-light)' : 'var(--text-secondary)',
                        letterSpacing: '0.01em',
                        transition: 'color 0.15s',
                    }}
                >
                    {label}
                </label>
            )}
            <motion.input
                ref={ref}
                type={type}
                animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.35 }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`input-field ${error ? 'has-error' : ''} ${className}`}
                {...props}
            />
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: '0.75rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                    {error}
                </motion.p>
            )}
            {hint && !error && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</p>
            )}
        </div>
    );
});

export default FloatingLabelInput;
