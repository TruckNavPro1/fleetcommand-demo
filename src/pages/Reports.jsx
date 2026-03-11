import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import { FileText, Download, BarChart3, Truck, DollarSign, Users, CheckCircle } from 'lucide-react'

const reportTypes = [
    { id: 'mileage', icon: Truck, label: 'Mileage Report', desc: 'Miles per driver & vehicle by date range', color: '#3b8ef3' },
    { id: 'fuel', icon: BarChart3, label: 'Fuel Cost Report', desc: 'Fuel spend, MPG, and gallons by truck', color: '#22d3a8' },
    { id: 'revenue', icon: DollarSign, label: 'Revenue Report', desc: 'Load revenue, per-mile rate, broker', color: '#f59e0b' },
    { id: 'driver', icon: Users, label: 'Driver Performance', desc: 'HOS compliance, safety events, on-time', color: '#a855f7' },
    { id: 'ifta', icon: FileText, label: 'IFTA Quarterly', desc: 'Miles/fuel by state for tax filing', color: '#ef4444' },
    { id: 'maintenance', icon: CheckCircle, label: 'Maintenance Summary', desc: 'Work orders, parts cost, downtime', color: '#ec4899' },
]

const recentReports = [
    { name: 'Mileage Report — Feb 2026', generated: 'Mar 1, 2026', size: '1.2 MB', format: 'PDF' },
    { name: 'Fuel Cost Report — Feb 2026', generated: 'Mar 1, 2026', size: '0.8 MB', format: 'PDF' },
    { name: 'IFTA Q4 2025 Filing', generated: 'Jan 15, 2026', size: '2.1 MB', format: 'XLSX' },
    { name: 'Driver Performance — Q4 2025', generated: 'Jan 10, 2026', size: '1.5 MB', format: 'PDF' },
    { name: 'Maintenance Summary — Jan 2026', generated: 'Feb 3, 2026', size: '0.9 MB', format: 'PDF' },
]

const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

export default function Reports() {
    const [selected, setSelected] = useState(null)
    const [dateFrom, setDateFrom] = useState('2026-02-01')
    const [dateTo, setDateTo] = useState('2026-02-28')
    const [generating, setGenerating] = useState(false)
    const [generated, setGenerated] = useState(false)

    const handleGenerate = () => {
        if (!selected) return
        setGenerating(true)
        setGenerated(false)
        setTimeout(() => { setGenerating(false); setGenerated(true) }, 1800)
    }

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Reports</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Generate and download fleet reports for any date range</p>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Report builder */}
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📊 Generate Report</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                        {reportTypes.map(rt => (
                            <motion.button key={rt.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={() => { setSelected(rt.id); setGenerated(false) }}
                                style={{
                                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                                    border: `1px solid ${selected === rt.id ? rt.color + '60' : 'rgba(255,255,255,0.08)'}`,
                                    background: selected === rt.id ? rt.color + '12' : 'rgba(255,255,255,0.03)',
                                    transition: 'all 0.15s',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <rt.icon size={16} color={rt.color} />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: selected === rt.id ? rt.color : 'var(--text-primary)' }}>{rt.label}</span>
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{rt.desc}</div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Date range */}
                    <GlassCard style={{ padding: '16px 18px', marginBottom: 12 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-secondary)' }}>Date Range</div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                            <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>→</span>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                        </div>
                    </GlassCard>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={handleGenerate} disabled={!selected || generating}
                        style={{
                            width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: selected ? 'pointer' : 'default',
                            background: selected ? 'linear-gradient(135deg, #3b8ef3, #a855f7)' : 'rgba(255,255,255,0.06)',
                            color: selected ? 'white' : 'var(--text-tertiary)', fontWeight: 700, fontSize: 14,
                            opacity: generating ? 0.7 : 1, transition: 'all 0.2s',
                        }}>
                        {generating ? '⏳ Generating...' : generated ? '✅ Download Ready — Click to Save' : '📄 Generate Report'}
                    </motion.button>
                    {!selected && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8 }}>Select a report type above</div>}
                </div>

                {/* Recent reports */}
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🗂️ Recent Reports</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {recentReports.map((r, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                                <GlassCard style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: r.format === 'XLSX' ? 'rgba(34,211,168,0.15)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FileText size={16} color={r.format === 'XLSX' ? '#22d3a8' : '#ef4444'} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{r.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{r.format} · {r.size} · {r.generated}</div>
                                    </div>
                                    <button style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                        <Download size={14} />
                                    </button>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
