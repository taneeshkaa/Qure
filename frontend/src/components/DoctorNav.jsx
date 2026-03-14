import { Link } from 'react-router-dom';

export default function DoctorNav({ active = '' }) {
    return (
        <div style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border)',
            padding: '0 32px', height: '60px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <div className="logo-mark" style={{ width: 32, height: 32, borderRadius: '9px' }}>
                    <svg width="17" height="17" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6H9l3-7 3 7h-2v6z" />
                    </svg>
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>QueueEase</span>
                <span style={{
                    fontSize: '0.7rem', fontWeight: 700, color: 'white',
                    background: '#5865f2', borderRadius: '6px', padding: '2px 7px', letterSpacing: '0.06em'
                }}>DOCTOR</span>
            </Link>

            <nav style={{ display: 'flex', gap: '4px' }}>
                {[
                    { label: '🩺 My Queue', to: '/doctor/dashboard' },
                    { label: '📋 Consultation', to: '/doctor/consultation' },
                ].map(item => (
                    <Link key={item.to} to={item.to} style={{
                        fontSize: '0.8125rem',
                        fontWeight: active === item.to ? 600 : 500,
                        color: active === item.to ? 'var(--accent)' : 'var(--text-secondary)',
                        textDecoration: 'none',
                        padding: '6px 12px', borderRadius: '8px',
                        background: active === item.to ? 'var(--accent-bg)' : 'transparent',
                        transition: 'all 0.15s'
                    }}
                        onMouseEnter={e => { if (active !== item.to) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                        onMouseLeave={e => { if (active !== item.to) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                    >{item.label}</Link>
                ))}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'rgba(88,101,242,0.1)',
                    border: '2px solid rgba(88,101,242,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8125rem', fontWeight: 700, color: '#5865f2'
                }}>D</div>
                <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>Doctor</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Consultation Mode</p>
                </div>
            </div>
        </div>
    );
}
