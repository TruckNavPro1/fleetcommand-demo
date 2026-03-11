import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import StatWidget from '../components/ui/StatWidget'
import { DispatchChart, FuelChart } from '../components/charts/Charts'
import { mockFleet } from '../data/mockData'
import { Package, Users, DollarSign, ShieldCheck, Plus, CheckCircle, Upload, Sparkles } from 'lucide-react'
import { supabase } from '../services/supabase'
import AddLoadModal from '../components/AddLoadModal'
import BulkUploadModal from '../components/BulkUploadModal'
import AIChatDrawer from '../components/AIChatDrawer'

const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

const drivers = [
    { name: 'Dave Kowalski', truck: 'TRK-001', status: 'active', route: 'Chicago → Dallas', hos: '7.5h' },
    { name: 'Mike Torres', truck: 'TRK-002', status: 'active', route: 'Houston → Denver', hos: '5.0h' },
    { name: 'Linda Shaw', truck: 'TRK-003', status: 'rest', route: 'On Break', hos: '11.0h' },
    { name: 'Carlos Rivera', truck: 'TRK-005', status: 'active', route: 'Atlanta → Miami', hos: '9.2h' },
    { name: 'Amy Chen', truck: 'TRK-006', status: 'idle', route: 'Awaiting Dispatch', hos: '2.0h' },
]

export default function OfficeDashboard() {
    const [loads, setLoads] = useState([])
    const [isAddLoadOpen, setIsAddLoadOpen] = useState(false)
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
    const [isAIChatOpen, setIsAIChatOpen] = useState(false)

    const fetchLoads = async () => {
        const { data, error } = await supabase
            .from('loads')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setLoads(data)
        }
    }

    useEffect(() => {
        fetchLoads()
    }, [])

    const formatDate = (dateStr) => {
        if (!dateStr) return 'TBD'
        return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    }

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <AddLoadModal
                isOpen={isAddLoadOpen}
                onClose={() => setIsAddLoadOpen(false)}
                onAddSuccess={fetchLoads}
            />
            <BulkUploadModal
                isOpen={isBulkUploadOpen}
                onClose={() => setIsBulkUploadOpen(false)}
                onUploadSuccess={fetchLoads}
            />
            <AIChatDrawer
                isOpen={isAIChatOpen}
                onClose={() => setIsAIChatOpen(false)}
            />
            {/* Stats */}
            <div className="stat-grid" style={{ marginBottom: 24 }}>
                <StatWidget label="Active Loads" value={3} sub="All on schedule" icon={Package} accent="blue" />
                <StatWidget label="Revenue Today (Est.)" value={18400} prefix="$" sub="+12% vs last Fri" trend="up" icon={DollarSign} accent="green" />
                <StatWidget label="Drivers Available" value={1} sub="Amy Chen ready" icon={Users} accent="amber" />
                <StatWidget label="Compliance Score" value={96} suffix="%" sub="DOT Regulation" icon={ShieldCheck} accent="purple" />
            </div>

            {/* Dispatch Board */}
            <GlassCard style={{ padding: '20px 24px', marginBottom: 24 }}>
                <div className="section-header" style={{ marginBottom: 20 }}>
                    <span className="section-title">Live Dispatch Board</span>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="quick-btn" style={{ padding: '7px 14px', background: 'rgba(168,85,247,0.1)', color: 'var(--accent-purple)', border: '1px solid rgba(168,85,247,0.2)' }} onClick={() => setIsAIChatOpen(true)}>
                            <Sparkles size={13} /> Ask AI
                        </button>
                        <button className="quick-btn" style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setIsBulkUploadOpen(true)}>
                            <Upload size={13} /> Import CSV
                        </button>
                        <button className="quick-btn" style={{ padding: '7px 14px' }} onClick={() => setIsAddLoadOpen(true)}>
                            <Plus size={13} /> New Load
                        </button>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                    {loads.length === 0 && (
                        <div style={{ padding: 20, color: 'var(--text-secondary)', fontSize: 13 }}>No active loads. Click 'New Load' to add one.</div>
                    )}
                    {loads.map(l => (
                        <div key={l.id} className="glass-card dispatch-card" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span style={{ fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-display)' }}>{l.id}</span>
                                <span className={`badge ${l.status === 'In Transit' ? 'badge-green' : l.status === 'Completed' ? 'badge-purple' : 'badge-blue'}`}>
                                    {l.status === 'In Transit' && <span className="badge-dot pulse" />}
                                    {l.status}
                                </span>
                            </div>
                            <div className="dispatch-route">
                                <div className="route-dot" style={{ background: 'var(--accent-blue)' }} />
                                <span style={{ fontSize: 12, flex: 1, color: 'var(--text-secondary)' }}>{l.origin}</span>
                            </div>
                            <div style={{ width: 1, height: 10, background: 'var(--glass-border)', marginLeft: 4, marginBottom: 4 }} />
                            <div className="dispatch-route" style={{ marginBottom: 12 }}>
                                <div className="route-dot" style={{ background: 'var(--accent-green)' }} />
                                <span style={{ fontSize: 12, flex: 1, color: 'var(--text-secondary)' }}>{l.destination}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-tertiary)' }}>
                                <span>⚖ {l.weight}</span>
                                <span>📏 {l.miles} mi</span>
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 10, paddingTop: 10, fontSize: 11, display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                <span>Pickup: {formatDate(l.pickup_time)}</span>
                                <span>Del: {formatDate(l.delivery_time)}</span>
                            </div>
                        </div>
                    ))}

                    {/* Unassigned Placeholder */}
                    <div onClick={() => setIsAddLoadOpen(true)} className="glass-card" style={{ padding: 16, border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 160, gap: 10, cursor: 'pointer' }}>
                        <Plus size={24} color="var(--text-tertiary)" />
                        <span style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 500 }}>Assign New Load</span>
                    </div>
                </div>
            </GlassCard>

            {/* Drivers + Analytics */}
            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Driver Roster */}
                <GlassCard style={{ padding: '20px 24px', overflowX: 'auto' }}>
                    <div className="section-header">
                        <span className="section-title">Driver Roster</span>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr><th>Driver</th><th>Truck</th><th>Status</th><th>Route</th><th>HOS Left</th></tr>
                        </thead>
                        <tbody>
                            {drivers.map(d => (
                                <tr key={d.name}>
                                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{d.truck}</td>
                                    <td>
                                        <span className={`badge badge-${d.status === 'active' ? 'green' : d.status === 'rest' ? 'amber' : 'purple'}`}>
                                            <span className="badge-dot" />
                                            {d.status}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.route}</td>
                                    <td style={{ fontWeight: 600 }}>{d.hos}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </GlassCard>

                {/* Payroll & Compliance */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <GlassCard style={{ padding: '20px 24px', flex: 1 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Payroll Summary (This Week)</h3>
                        {[
                            { label: 'Gross Driver Pay', val: '$14,320', accent: 'var(--accent-green)' },
                            { label: 'Fuel Reimbursements', val: '$3,284', accent: 'var(--accent-blue)' },
                            { label: 'Total Operating Cost', val: '$28,940', accent: 'var(--accent-amber)' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: item.accent, fontFamily: 'var(--font-display)' }}>{item.val}</span>
                            </div>
                        ))}
                    </GlassCard>

                    <GlassCard style={{ padding: '20px 24px' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>DOT Compliance</h3>
                        {[
                            { label: 'HOS Violations (MTD)', val: 0, good: true },
                            { label: 'Overweight Citations', val: 0, good: true },
                            { label: 'Pending Inspections', val: 2, good: false },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', color: item.good ? 'var(--accent-green)' : 'var(--accent-amber)' }}>{item.val}</span>
                                    {item.good && <CheckCircle size={14} color="var(--accent-green)" />}
                                </div>
                            </div>
                        ))}
                    </GlassCard>
                </div>
            </div>

            <div className="grid-2">
                <DispatchChart />
                <FuelChart />
            </div>
        </motion.div>
    )
}
