import React from 'react';
import GlassCard from './ui/GlassCard';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You could log the error to Sentry or another service here
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <GlassCard style={{ padding: '30px', maxWidth: 400, textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444' }}>
                            <AlertTriangle size={32} />
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: 'white' }}>Something went wrong.</h2>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                            We encountered an unexpected error rendering this section. Our team has been notified.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--accent-blue)', color: 'white', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' }}
                        >
                            <RefreshCw size={16} /> Reload Application
                        </button>
                    </GlassCard>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
