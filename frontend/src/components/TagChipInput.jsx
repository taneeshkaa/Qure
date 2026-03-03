import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const XIcon = () => (
    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default function TagChipInput({ label, value = [], onChange, placeholder = 'Type and press Enter', error }) {
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    const addTag = () => {
        const t = input.trim();
        if (t && !value.includes(t)) onChange([...value, t]);
        setInput('');
    };

    const removeTag = (tag) => onChange(value.filter(t => t !== tag));

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addTag(); }
        if (e.key === 'Backspace' && !input && value.length > 0) removeTag(value[value.length - 1]);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {label && (
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: error ? 'var(--error)' : 'var(--text-secondary)', letterSpacing: '0.01em' }}>
                    {label}
                </label>
            )}
            <div
                onClick={() => inputRef.current?.focus()}
                className={`input-field ${error ? 'has-error' : ''}`}
                style={{
                    minHeight: '48px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'text',
                    padding: '8px 12px',
                    height: 'auto',
                }}
            >
                <AnimatePresence>
                    {value.map(tag => (
                        <motion.span
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className="chip"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={e => { e.stopPropagation(); removeTag(tag); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', padding: '1px' }}
                            >
                                <XIcon />
                            </button>
                        </motion.span>
                    ))}
                </AnimatePresence>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                    style={{
                        flex: 1,
                        minWidth: '100px',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        fontFamily: 'Inter, sans-serif',
                    }}
                />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Press Enter to add · Backspace to remove last</p>
        </div>
    );
}
