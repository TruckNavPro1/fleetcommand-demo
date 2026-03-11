import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import StatWidget from '../components/ui/StatWidget'
import { ShieldCheck, AlertTriangle, CheckCircle, Clock, FileText, Calendar } from 'lucide-react'

const complianceItems = [
    { id: 1, category: 'Driver', name: 'Dave Kowalski — CDL Renewal', due: 'Dec 14, 2027', daysLeft: 648, status: 'compliant', note: 'Valid until 2027' },
    { id: 2, category: 'Driver', name: 'Mike Torres — Medical Certificate', due: 'Aug 31, 2026', daysLeft: 178, status: 'compliant', note: 'Next exam due Aug 2026' },
    { id: 3, category: 'Vehicle', name: 'TRK-001 — Annual DOT Inspection', due: 'Apr 10, 2026', daysLeft: 35, status: 'warning', note: 'Schedule with FMCSA-cert shop' },
    { id: 4, category: 'Vehicle', name: 'TRK-004 — Annual DOT Inspection', due: 'Mar 15, 2026', daysLeft: 9, status: 'critical', note: 'URGENT — book immediately' },
    { id: 5, category: 'Vehicle', name: 'TRK-002 — Brake Certification', due: 'Jun 1, 2026', daysLeft: 87, status: 'compliant', note: 'Scheduled WO-1043 for Mar 14' },
    { id: 6, category: 'Tax', name: 'IFTA Q1 2026 Filing', due: 'Apr 30, 2026', daysLeft: 55, status: 'pending', note: 'Fuel records ready' },
    { id: 7, category: 'Tax', name: '2290 HVUT — Heavy Use Tax', due: 'Aug 31, 2026', daysLeft: 178, status: 'compliant', note: 'Filed Jan 2026' },
    { id: 8, category: 'Operating', name: 'MC Authority Renewal', due: 'Sep 1, 2026', daysLeft: 179, status: 'compliant', note: 'MC#884291 active' },
    { id: 9, category: 'Driver', name: 'Linda Shaw — HazMat Endorsement', due: 'Mar 14, 2027', daysLeft: 373, status: 'compliant', note: 'Renewed Jan 2025' },
    { id: 10, category: 'Operating', name: 'Cargo Insurance ($1M)', due: 'Jun 30, 2026', daysLeft: 116, status: 'compliant', note: 'Progressive Commercial' },
    { id: 11, category: 'Driver', name: 'Tom Bradley — MVR Check', due: 'Mar 12, 2026', daysLeft: 6, status: 'critical', note: 'Annual check overdue' },
    { id: 12, category: 'Vehicle', name: 'ELD Device Certification (all trucks)', due: 'Dec 1, 2026', daysLeft: 270, status: 'compliant', note: 'Samsara ELD certified' },
]

const STATUS_STYLE = {
    compliant: { color: '#22d3a8', bg: 'rgba(34,211,168,0.08)', border: 'rgba(34,211,168,0.2)', label: 'Compliant', Icon: CheckCircle },
    warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Due Soon', Icon: Clock },
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'Urgent', Icon: AlertTriangle },
    pending: { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', label: 'Pending', Icon: Clock },
}

const CAT_COLORS = { Driver: '#3b8ef3', Vehicle: '#f59e0b', Tax: '#a855f7', Operating: '#22d3a8' }
const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

export default function Compliance() {
    const counts = {
        compliant: complianceItems.filter(c => c.status === 'compliant').length,
        warning: complianceItems.filter(c => c.status === 'warning').length,
        critical: complianceItems.filter(c => c.status === 'critical').length,
        pending: complianceItems.filter(c => c.status === 'pending').length,
    }

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Compliance</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>DOT, FMCSA, IFTA, licensing and insurance tracking</p>
            </div>

            <div className="stat-grid" style={{ marginBottom: 20 }}>
                <StatWidget label="Compliant" value={counts.compliant} sub="No action needed" icon={CheckCircle} accent="green" />
                <StatWidget label="Due Soon" value={counts.warning} sub="Within 60 days" icon={Clock} accent="amber" />
                <StatWidget label="Urgent" value={counts.critical} sub="Action required" icon={AlertTriangle} accent="red" />
                <StatWidget label="Pending" value={counts.pending} sub="In progress" icon={ShieldCheck} accent="purple" />
            </div>

            {/* Critical alerts */}
            {complianceItems.filter(c => c.status === 'critical').map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 10 }}>
                    <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.note} · Due {item.due} · {item.daysLeft} days left</div>
                    </div>
                </div>
            ))}

            {/* Full table */}
            <GlassCard style={{ padding: 0, overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Category</th><th>Item</th><th>Due Date</th><th>Days Left</th><th>Status</th><th>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {complianceItems.map((item, i) => {
                            const s = STATUS_STYLE[item.status]
                            const catColor = CAT_COLORS[item.category] || '#6366f1'
                            return (
                                <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                                    <td>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: catColor, background: catColor + '18', padding: '2px 8px', borderRadius: 8 }}>{item.category}</span>
                                    </td>
                                    <td style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</td>
                                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.due}</td>
                                    <td>
                                        <span style={{ fontWeight: 800, color: item.daysLeft < 14 ? '#ef4444' : item.daysLeft < 60 ? '#f59e0b' : '#22d3a8' }}>
                                            {item.daysLeft}d
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <s.Icon size={12} color={s.color} />
                                            <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 11, color: 'var(--text-tertiary)', maxWidth: 200 }}>{item.note}</td>
                                </motion.tr>
                            )
                        })}
                    </tbody>
                </table>
            </GlassCard>
        </motion.div>
    )
}
