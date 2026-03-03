import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChevronDown = () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);
const SearchIcon = () => (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
);
const CheckIcon = () => (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export default function SearchableSelect({ label, options = [], value, onChange, error, placeholder = 'Select...' }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef(null);

    const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
    const selected = options.find(o => o.value === value);

    useEffect(() => {
        const fn = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {label && (
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: error ? 'var(--error)' : 'var(--text-secondary)', letterSpacing: '0.01em' }}>
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setOpen(p => !p)}
                className={`input-field ${error ? 'has-error' : ''}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
                    textAlign: 'left',
                }}
            >
                <span>{selected ? selected.label : placeholder}</span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                >
                    <ChevronDown />
                </motion.span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            zIndex: 100,
                            width: '100%',
                            top: 'calc(100% + 4px)',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(88,101,242,0.1)',
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 12px',
                            borderBottom: '1px solid var(--border)',
                        }}>
                            <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}><SearchIcon /></span>
                            <input
                                autoFocus
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search..."
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '0.8125rem',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'Inter, sans-serif',
                                }}
                            />
                        </div>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {filtered.length === 0 ? (
                                <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '16px' }}>No results</p>
                            ) : filtered.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '9px 14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        fontSize: '0.8125rem',
                                        fontFamily: 'Inter, sans-serif',
                                        background: value === opt.value ? 'var(--accent-bg)' : 'transparent',
                                        color: value === opt.value ? 'var(--accent-light)' : 'var(--text-secondary)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background 0.1s',
                                    }}
                                    onMouseEnter={e => { if (value !== opt.value) e.target.style.background = 'rgba(255,255,255,0.04)'; }}
                                    onMouseLeave={e => { if (value !== opt.value) e.target.style.background = 'transparent'; }}
                                >
                                    {opt.label}
                                    {value === opt.value && <CheckIcon />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <p style={{ fontSize: '0.75rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                    {error}
                </p>
            )}
        </div>
    );
}
