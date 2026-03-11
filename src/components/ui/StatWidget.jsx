import { useEffect, useState } from 'react'
import GlassCard from './GlassCard'

function useCountUp(target, duration = 1500) {
    const [val, setVal] = useState(0)
    useEffect(() => {
        if (target === 0) return
        let start = 0
        const step = target / (duration / 16)
        const timer = setInterval(() => {
            start += step
            if (start >= target) { setVal(target); clearInterval(timer) }
            else setVal(Math.floor(start))
        }, 16)
        return () => clearInterval(timer)
    }, [target])
    return val
}

export default function StatWidget({ label, value, sub, trend, icon: Icon, accent = 'blue', prefix = '', suffix = '' }) {
    const numericVal = typeof value === 'number' ? value : parseInt(value) || 0
    const displayVal = typeof value === 'number' ? useCountUp(numericVal) : value

    const accentColors = {
        blue: 'var(--accent-blue)',
        green: 'var(--accent-green)',
        amber: 'var(--accent-amber)',
        red: 'var(--accent-red)',
        purple: 'var(--accent-purple)',
    }

    return (
        <GlassCard className="stat-widget" style={{ '--widget-accent': accentColors[accent] }}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">
                {prefix}{typeof value === 'number' ? displayVal.toLocaleString() : value}{suffix}
            </div>
            {sub && (
                <div className="stat-sub">
                    {trend === 'up' && <span className="stat-trend-up">↑</span>}
                    {trend === 'down' && <span className="stat-trend-down">↓</span>}
                    <span>{sub}</span>
                </div>
            )}
            {Icon && (
                <div className="stat-icon-bg">
                    <Icon size={64} color={accentColors[accent]} />
                </div>
            )}
        </GlassCard>
    )
}
