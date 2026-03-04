import { motion } from 'framer-motion';

export default function StepIndicator({ steps, currentStep }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', width: '100%' }}>
            {steps.map((step, idx) => {
                const done = idx < currentStep;
                const active = idx === currentStep;
                return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
                        {/* Step node */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: active ? 1.15 : 1,
                                    boxShadow: active
                                        ? '0 0 0 4px rgba(11,158,135,0.18), 0 4px 14px rgba(11,158,135,0.25)'
                                        : done
                                            ? '0 0 0 3px rgba(11,158,135,0.12)'
                                            : '0 0 0 0px transparent',
                                }}
                                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    background: done || active
                                        ? 'linear-gradient(135deg, #0b9e87 0%, #12c9ae 100%)'
                                        : 'rgba(255,255,255,0.72)',
                                    border: done || active
                                        ? 'none'
                                        : '1.5px solid rgba(11,158,135,0.22)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    zIndex: 1,
                                    backdropFilter: 'blur(8px)',
                                }}
                            >
                                {done ? (
                                    <motion.svg
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.3 }}
                                        width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </motion.svg>
                                ) : (
                                    <span style={{
                                        fontSize: '0.6875rem',
                                        fontWeight: 700,
                                        color: active ? 'white' : 'var(--text-muted)',
                                    }}>{idx + 1}</span>
                                )}
                            </motion.div>

                            <motion.span
                                animate={{
                                    color: active ? 'var(--accent)' : done ? 'var(--text-secondary)' : 'var(--text-muted)',
                                    fontWeight: active ? 700 : 400,
                                }}
                                style={{
                                    fontSize: '0.6875rem',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {step}
                            </motion.span>
                        </div>

                        {/* Connecting line */}
                        {idx < steps.length - 1 && (
                            <div className="step-line-bg">
                                <motion.div
                                    initial={false}
                                    animate={{ scaleX: done ? 1 : 0 }}
                                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(90deg, #0b9e87 0%, #34d9be 100%)',
                                        transformOrigin: 'left',
                                        borderRadius: '2px',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
