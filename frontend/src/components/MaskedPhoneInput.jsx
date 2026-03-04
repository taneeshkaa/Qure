import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

const MaskedPhoneInput = forwardRef(function MaskedPhoneInput(
    { label, error, optional = false, dim = false, onChange, onBlur, name, value },
    ref
) {
    const [focused, setFocused] = useState(false);

    /* Format digits → XXX-XXX-XXXX for display */
    const formatDisplay = (raw) => {
        const d = (raw || '').replace(/\D/g, '').slice(0, 10);
        if (d.length > 6) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
        if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`;
        return d;
    };

    const handleChange = (e) => {
        /* Strip to raw digits, store raw in RHF */
        const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
        e.target.value = raw;
        onChange?.(e);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', opacity: dim ? 0.45 : 1, transition: 'opacity 0.2s', minWidth: 0 }}>
            {label && (
                <label style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: error ? 'var(--error)' : focused ? 'var(--accent-light)' : 'var(--text-secondary)',
                    letterSpacing: '0.01em', transition: 'color 0.15s',
                }}>
                    {label}
                    {optional && <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '4px' }}>(optional)</span>}
                </label>
            )}
            <motion.div
                animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.35 }}
                className={error ? 'has-error' : ''}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '10px',
                    border: `1.5px solid ${error ? 'var(--error)' : focused ? 'var(--accent)' : 'var(--border)'}`,
                    background: 'var(--bg-input)',
                    boxShadow: focused ? (error ? '0 0 0 3px rgba(244,63,94,0.12)' : '0 0 0 3px var(--accent-glow)') : 'none',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
            >
                <span style={{
                    padding: '0 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--accent-light)',
                    borderRight: '1.5px solid var(--border)',
                    alignSelf: 'stretch',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    background: 'var(--bg-elevated)',
                }}>
                    +91
                </span>
                <input
                    ref={ref}
                    name={name}
                    type="tel"
                    placeholder="XXX-XXX-XXXX"
                    value={formatDisplay(value)}
                    onFocus={() => setFocused(true)}
                    onBlur={(e) => { setFocused(false); onBlur?.(e); }}
                    onChange={handleChange}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        fontFamily: 'Inter, sans-serif',
                    }}
                />
            </motion.div>
            {error && (
                <p style={{ fontSize: '0.75rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                    {error}
                </p>
            )}
        </div>
    );
});

export default MaskedPhoneInput;
