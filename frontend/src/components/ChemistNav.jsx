import { Link } from 'react-router-dom';

export default function ChemistNav({ active = '' }) {
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
                    background: '#f59e0b', borderRadius: '6px', padding: '2px 7px', letterSpacing: '0.06em'
                }}>CHEMIST</span>
            </Link>

            <nav style={{ display: 'flex', gap: '4px' }}>
                {[
                    { label: '💊 Prescription Queue', to: '/chemist/dashboard' },
                ].map(item => (
                    <Link key={item.to} to={item.to} style={{
                        fontSize: '0.8125rem',
                        fontWeight: active === item.to ? 600 : 500,
                        color: active === item.to ? '#f59e0b' : 'var(--text-secondary)',
                        textDecoration: 'none',
                        padding: '6px 12px', borderRadius: '8px',
                        background: active === item.to ? 'rgba(245,158,11,0.08)' : 'transparent',
                        transition: 'all 0.15s'
                    }}>{item.label}</Link>
                ))}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'rgba(245,158,11,0.1)',
                    border: '2px solid rgba(245,158,11,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8125rem', fontWeight: 700, color: '#f59e0b'
                }}>C</div>
                <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>Chemist</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pharmacy Mode</p>
                </div>
            </div>
        </div>
    );
}
