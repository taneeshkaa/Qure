import { motion } from 'framer-motion';

export default function StepIndicator({ steps, currentStep }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
            {steps.map((step, idx) => {
                const done = idx < currentStep;
                const active = idx === currentStep;
                return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <motion.div
                                initial={false}
                                animate={{
                                    background: done ? 'var(--accent)' : active ? 'var(--accent)' : 'var(--bg-input)',
                                    borderColor: done || active ? 'var(--accent)' : 'var(--border)',
                                    scale: active ? 1.1 : 1,
                                }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    border: '1.5px solid',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    zIndex: 1,
                                }}
                            >
                                {done ? (
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span style={{
                                        fontSize: '0.6875rem',
                                        fontWeight: 700,
                                        color: active ? 'white' : 'var(--text-muted)',
                                    }}>{idx + 1}</span>
                                )}
                            </motion.div>
                            <span style={{
                                fontSize: '0.6875rem',
                                fontWeight: active ? 600 : 400,
                                color: active ? 'var(--accent-light)' : done ? 'var(--text-secondary)' : 'var(--text-muted)',
                                whiteSpace: 'nowrap',
                            }}>
                                {step}
                            </span>
                        </div>

                        {idx < steps.length - 1 && (
                            <div style={{ flex: 1, height: '1.5px', background: 'var(--border)', margin: '0 8px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                                <motion.div
                                    initial={false}
                                    animate={{ scaleX: done ? 1 : 0 }}
                                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                                    style={{ position: 'absolute', inset: 0, background: 'var(--accent)', transformOrigin: 'left' }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
