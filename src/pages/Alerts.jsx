/**
 * Alerts — all roles, shows critical + warning + info alerts
 * Live data comes from FleetContext (Samsara safety events + DVIRs).
 * Falls back to static mock alerts when no API token is configured.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import { useFleetData } from '../context/FleetContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { AlertTriangle, CheckCircle, Info, Zap, X, Bell } from 'lucide-react'

const allAlerts = [
    { id: 1, severity: 'critical', icon: '🔴', category: 'Safety', title: 'Engine Fault — TRK-004', body: 'Code P0300: Random/Multiple Cylinder Misfire. Vehicle pulled from service. Ray Johnson dispatched.', time: '2m ago', role: 'all' },
    { id: 2, severity: 'critical', icon: '⚠️', category: 'HOS', title: 'HOS Violation Risk — Dave Kowalski', body: 'Dave has 14 min of drive time remaining. Must stop before Joplin, MO weigh station.', time: '8m ago', role: 'driver' },
    { id: 3, severity: 'warning', icon: '⛽', category: 'Fuel', title: 'Low Fuel — TRK-003', body: 'Linda Shaw at 18% fuel. Nearest truck stop: Flying J Exit 44 · 12 mi ahead.', time: '15m ago', role: 'all' },
    { id: 4, severity: 'warning', icon: '🔧', category: 'Maintenance', title: 'Brake Inspection Overdue — TRK-002', body: 'TRK-002 is 800 miles past scheduled brake service. Schedule with mechanic before next dispatch.', time: '32m ago', role: 'all' },
    { id: 5, severity: 'warning', icon: '🌩️', category: 'Weather', title: 'Severe Weather — I-30 Corridor', body: 'NWS: Tornado watch Dallas–Texarkana until 20:00. Reduce speed, monitor radio.', time: '44m ago', role: 'driver' },
    { id: 6, severity: 'info', icon: '📦', category: 'Dispatch', title: 'Load LD-9831 Ready for Pickup', body: 'Pickup window opens at 09:00 tomorrow. Shipper: Carter Logistics, Gate 4, Dallas.', time: '1h ago', role: 'driver' },
    { id: 7, severity: 'info', icon: '📋', category: 'Compliance', title: 'DOT Inspection Due — TRK-005', body: 'Annual DOT inspection due in 12 days. Schedule with Ray Johnson to ensure compliance.', time: '2h ago', role: 'all' },
    { id: 8, severity: 'info', icon: '✅', category: 'System', title: 'Samsara Sync Complete', body: 'All 6 vehicles GPS telemetry updated. Next sync in 30 seconds.', time: '3h ago', role: 'all' },
    { id: 9, severity: 'critical', icon: '🚨', category: 'Safety', title: 'Hard Braking Event — TRK-001', body: 'Dave Kowalski: 1.2G deceleration event logged at I-44 MM 248. Review dashcam.', time: '4h ago', role: 'all' },
    { id: 10, severity: 'info', icon: '💰', category: 'Finance', title: 'Fuel Card Limit Reached — TRK-003', body: 'Linda Shaw fuel card reached $500 limit. Contact dispatch to reset before refuel.', time: '5h ago', role: 'driver' },
]

const SEV = {
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', Icon: AlertTriangle },
    warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', Icon: Zap },
    info: { color: '#3b8ef3', bg: 'rgba(59,142,243,0.08)', border: 'rgba(59,142,243,0.2)', Icon: Info },
}

const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

export default function Alerts() {
    const { alerts: liveAlerts, loading } = useFleetData()
    const [dismissed, setDismissed] = useState([])
    const [filter, setFilter] = useState('all')

    // Merge live alerts with enriched mock fallback (live takes priority)
    const source = liveAlerts.length > 0 ? liveAlerts : allAlerts

    const filters = ['all', 'critical', 'warning', 'info']
    const visible = source
        .filter(a => !dismissed.includes(a.id))
        .filter(a => filter === 'all' || a.severity === filter)

    const counts = {
        critical: source.filter(a => a.severity === 'critical' && !dismissed.includes(a.id)).length,
        warning: source.filter(a => a.severity === 'warning' && !dismissed.includes(a.id)).length,
        info: source.filter(a => a.severity === 'info' && !dismissed.includes(a.id)).length,
    }

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <Bell size={22} color="var(--accent-amber)" />
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>Alerts</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Fleet-wide notifications and safety events</p>
                </div>
                {dismissed.length > 0 && (
                    <button onClick={() => setDismissed([])} style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>
                        Restore {dismissed.length} dismissed
                    </button>
                )}
            </div>

            {/* Summary pills */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                    { label: 'All', key: 'all', count: visible.length, color: 'var(--text-secondary)' },
                    { label: 'Critical', key: 'critical', count: counts.critical, color: '#ef4444' },
                    { label: 'Warning', key: 'warning', count: counts.warning, color: '#f59e0b' },
                    { label: 'Info', key: 'info', count: counts.info, color: '#3b8ef3' },
                ].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)} style={{
                        display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px',
                        borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s',
                        border: `1px solid ${filter === f.key ? f.color + '80' : 'rgba(255,255,255,0.08)'}`,
                        background: filter === f.key ? f.color + '15' : 'rgba(255,255,255,0.03)',
                        color: filter === f.key ? f.color : 'var(--text-secondary)',
                        fontWeight: filter === f.key ? 700 : 500, fontSize: 13,
                    }}>
                        {f.label}
                        <span style={{ fontSize: 11, fontWeight: 800, background: f.color + '25', color: f.color, padding: '1px 6px', borderRadius: 10 }}>{f.count}</span>
                    </button>
                ))}
            </div>

            {/* Alert cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AnimatePresence>
                    {visible.map(alert => {
                        const sev = alert.severity || alert.type || 'info'
                        const s = SEV[sev] || SEV.info
                        const category = alert.category || (sev === 'critical' ? 'Safety' : sev === 'warning' ? 'Warning' : 'Info')
                        return (
                            <motion.div key={alert.id}
                                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0, margin: 0, padding: 0, overflow: 'hidden' }}
                                transition={{ duration: 0.22 }}
                            >
                                <GlassCard style={{ padding: '16px 20px', border: `1px solid ${s.border}`, background: s.bg, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <s.Icon size={16} color={s.color} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700 }}>{alert.title}</span>
                                            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', color: s.color, background: s.color + '20', padding: '2px 7px', borderRadius: 4 }}>
                                                {category.toUpperCase()}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>{alert.body}</p>
                                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{alert.time}</span>
                                    </div>
                                    <button onClick={() => setDismissed(d => [...d, alert.id])}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4, flexShrink: 0, borderRadius: 6 }}>
                                        <X size={14} />
                                    </button>
                                </GlassCard>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
                {visible.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <CheckCircle size={40} color="var(--accent-green)" style={{ marginBottom: 12 }} />
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>All clear!</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No active alerts for this category.</div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
