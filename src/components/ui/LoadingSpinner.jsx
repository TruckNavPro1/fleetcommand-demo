/**
 * LoadingSpinner — Glass-styled animated spinner for async sections
 */
export default function LoadingSpinner({ size = 32, label = 'Loading...' }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 12, padding: '40px 20px',
        }}>
            <div style={{
                width: size, height: size, borderRadius: '50%',
                border: '2.5px solid rgba(59,142,243,0.15)',
                borderTopColor: 'var(--accent-blue)',
                animation: 'spin 0.75s linear infinite',
            }} />
            {label && (
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                    {label}
                </span>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
