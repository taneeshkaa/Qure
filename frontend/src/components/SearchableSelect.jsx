import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    // Position state for the portal-rendered dropdown
    const [dropRect, setDropRect] = useState({ top: 0, left: 0, width: 0 });

    const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
    const selected = options.find(o => o.value === value);

    // Recalculate position whenever dropdown opens or window resizes
    useEffect(() => {
        if (!open || !triggerRef.current) return;
        const measure = () => {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (rect) {
                setDropRect({
                    top: rect.bottom + window.scrollY + 5,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                });
            }
        };
        measure();
        window.addEventListener('resize', measure);
        window.addEventListener('scroll', measure, true);
        return () => {
            window.removeEventListener('resize', measure);
            window.removeEventListener('scroll', measure, true);
        };
    }, [open]);

    // Close on outside click
    useEffect(() => {
        const fn = (e) => {
            if (
                !triggerRef.current?.contains(e.target) &&
                !dropdownRef.current?.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    return (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {label && (
                <label style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: error ? 'var(--error)' : 'var(--text-secondary)',
                    letterSpacing: '0.01em',
                }}>
                    {label}
                </label>
            )}

            {/* Trigger button — measured via ref for portal positioning */}
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen(p => !p)}
                className={`input-field ${error ? 'has-error' : ''}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
                    textAlign: 'left',
                    cursor: 'pointer',
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selected ? selected.label : placeholder}
                </span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}
                >
                    <ChevronDown />
                </motion.span>
            </button>

            {/* Dropdown rendered into a portal so it escapes any overflow:hidden ancestor */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {open && (
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: -5, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.98 }}
                            transition={{ duration: 0.14, ease: 'easeOut' }}
                            style={{
                                position: 'absolute',
                                zIndex: 9999,
                                top: dropRect.top,
                                left: dropRect.left,
                                width: dropRect.width,
                                background: 'rgba(255, 255, 255, 0.98)',
                                border: '1px solid rgba(11, 158, 135, 0.22)',
                                borderRadius: '14px',
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(11, 120, 100, 0.15), 0 2px 8px rgba(11, 120, 100, 0.08)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                            }}
                        >
                            {/* Search bar */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 12px',
                                borderBottom: '1px solid rgba(11, 158, 135, 0.1)',
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

                            {/* List */}
                            <div style={{
                                maxHeight: '200px',
                                overflowY: 'auto',
                                /* Thin custom scrollbar */
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(11,158,135,0.25) transparent',
                            }}>
                                {filtered.length === 0 ? (
                                    <p style={{
                                        textAlign: 'center',
                                        fontSize: '0.8125rem',
                                        color: 'var(--text-muted)',
                                        padding: '16px 12px',
                                    }}>No results</p>
                                ) : filtered.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '10px 12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            fontSize: '0.8125rem',
                                            fontFamily: 'Inter, sans-serif',
                                            background: value === opt.value ? 'rgba(11, 158, 135, 0.08)' : 'transparent',
                                            color: value === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'background 0.12s',
                                        }}
                                        onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.background = 'rgba(11, 158, 135, 0.05)'; }}
                                        onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {opt.label}
                                        </span>
                                        {value === opt.value && (
                                            <span style={{ color: 'var(--accent)', flexShrink: 0, marginLeft: '8px' }}>
                                                <CheckIcon />
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {error && (
                <p style={{ fontSize: '0.75rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                    {error}
                </p>
            )}
        </div>
    );
}
