import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import StatWidget from '../components/ui/StatWidget'
import PhotoCapture from '../components/ui/PhotoCapture'
import { MaintenanceChart } from '../components/charts/Charts'
import { vehicleHealth } from '../data/mockData'
import { Wrench, AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react'
import LogRepairModal from '../components/LogRepairModal'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

const healthColor = h => h >= 80 ? 'var(--accent-green)' : h >= 60 ? 'var(--accent-amber)' : 'var(--accent-red)'
const systemBadge = s => s === 'Good' ? 'badge-green' : s === 'FAULT' ? 'badge-red' : s === 'Low' ? 'badge-red' : 'badge-amber'

export default function MechanicDashboard() {
    const { user } = useAuth()
    const [repairModalOpen, setRepairModalOpen] = useState(false)
    const [workOrders, setWorkOrders] = useState([])
    const [loadingWO, setLoadingWO] = useState(true)

    const fetchWorkOrders = async () => {
        if (!user) return

        if (user.isDemo) {
            setWorkOrders([
                { id: 'wo-1', service_category: 'Brakes', asset_type: 'Truck', asset_id: 'TRK-004', description: 'Front left brake pad replacement', status: 'In Progress', priority: 'High', created_at: new Date().toISOString() },
                { id: 'wo-2', service_category: 'Engine', asset_type: 'Truck', asset_id: 'TRK-012', description: 'Check engine light diagnosis', status: 'Open', priority: 'Critical', created_at: new Date(Date.now() - 86400000).toISOString() },
                { id: 'wo-3', service_category: 'PM', asset_type: 'Trailer', asset_id: 'TRL-992', description: 'Quarterly preventative maintenance', status: 'Completed', priority: 'Low', created_at: new Date(Date.now() - 172800000).toISOString() },
            ])
            setLoadingWO(false)
            return
        }

        if (!user?.organization_id) return

        try {
            const { data, error } = await supabase
                .from('work_orders')
                .select('*')
                .eq('organization_id', user.organization_id)
                .order('created_at', { ascending: false })

            if (!error && data) {
                setWorkOrders(data)
            }
        } catch (err) {
            console.error('Error fetching work orders:', err)
        } finally {
            setLoadingWO(false)
        }
    }

    useEffect(() => {
        fetchWorkOrders()
    }, [user])

    const recentCompleted = workOrders.filter(wo => wo.status === 'Completed').length
    const openWO = workOrders.filter(wo => wo.status !== 'Completed').length

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            {/* Stats */}
            <div className="stat-grid" style={{ marginBottom: 24 }}>
                <StatWidget label="Open Work Orders" value={loadingWO ? '-' : openWO} sub="Queued for service" trend="up" icon={Wrench} accent="amber" />
                <StatWidget label="Vehicles in Bay" value={1} sub="TRK-004" icon={AlertTriangle} accent="red" />
                <StatWidget label="Completed" value={loadingWO ? '-' : recentCompleted} sub="Total finished" trend="up" icon={CheckCircle} accent="green" />
                <StatWidget label="Parts Low Stock" value={3} sub="Order needed" icon={Package} accent="purple" />
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Work Orders */}
                <GlassCard style={{ padding: '20px 24px' }}>
                    <div className="section-header">
                        <span className="section-title">Work Orders Queue</span>
                        <button onClick={() => setRepairModalOpen(true)} className="section-action" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)' }}>+ New WO</button>
                    </div>
                    {loadingWO ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>Loading work orders...</div>
                    ) : workOrders.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No recent work orders found.</div>
                    ) : workOrders.map(wo => {
                        const priColor = wo.priority === 'Critical' ? '#ef4444' : wo.priority === 'High' ? '#f59e0b' : wo.priority === 'Low' ? '#22d3a8' : '#3b8ef3'
                        return (
                            <div key={wo.id} className="glass-card" style={{ padding: '14px 16px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: priColor }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{wo.service_category} Repair</h4>
                                            <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>{wo.asset_type}: {wo.asset_id}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {wo.description}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, minWidth: 100 }}>
                                        <span className={`badge ${wo.status === 'Completed' ? 'badge-green' : wo.status === 'In Progress' ? 'badge-blue' : 'badge-amber'}`}>
                                            <span className="badge-dot" />
                                            {wo.status}
                                        </span>
                                        <span style={{ fontSize: 11, color: priColor, fontWeight: 700 }}>{wo.priority} Priority</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </GlassCard>

                {/* Vehicle Health Grid */}
                <GlassCard style={{ padding: '20px 24px' }}>
                    <div className="section-header">
                        <span className="section-title">Vehicle Health</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {vehicleHealth.map(v => (
                            <div key={v.id} className="glass-card" style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-display)' }}>{v.id}</span>
                                    <span style={{ fontWeight: 800, fontSize: 16, color: healthColor(v.health), fontFamily: 'var(--font-display)' }}>
                                        {v.health}%
                                    </span>
                                </div>
                                <div className="progress-track" style={{ marginBottom: 8 }}>
                                    <div style={{
                                        height: '100%', width: `${v.health}%`, borderRadius: 3,
                                        background: healthColor(v.health),
                                        transition: 'width 1s cubic-bezier(0.23,1,0.32,1)'
                                    }} />
                                </div>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    {[['Eng', v.engine], ['Brk', v.brakes], ['Tires', v.tires], ['Oil', v.oil]].map(([label, val]) => (
                                        <span key={label} className={`badge ${systemBadge(val)}`} style={{ fontSize: 10, padding: '2px 7px' }}>
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            <div className="grid-2">
                <MaintenanceChart />

                {/* Parts Inventory */}
                <GlassCard style={{ padding: '20px 24px' }}>
                    <div className="section-header">
                        <span className="section-title">Parts Inventory Alerts</span>
                    </div>
                    {[
                        { part: 'Brake Pads (Front)', qty: 2, threshold: 5, unit: 'sets' },
                        { part: 'Engine Oil Filter', qty: 4, threshold: 10, unit: 'units' },
                        { part: 'Air Filter (Caterpillar)', qty: 1, threshold: 4, unit: 'units' },
                        { part: 'Coolant Fluid', qty: 8, threshold: 12, unit: 'liters' },
                    ].map((item, i) => (
                        <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{item.part}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: item.qty / item.threshold < 0.4 ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                                    {item.qty} {item.unit}
                                </span>
                            </div>
                            <div className="progress-track">
                                <div style={{
                                    height: '100%', width: `${(item.qty / item.threshold) * 100}%`, borderRadius: 3,
                                    background: item.qty / item.threshold < 0.4 ? 'var(--accent-red)' : 'var(--accent-amber)',
                                }} />
                            </div>
                        </div>
                    ))}
                    <button className="quick-btn" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                        <Package size={14} /> Order Parts
                    </button>
                </GlassCard>
            </div>

            {/* Photo Submissions */}
            <GlassCard style={{ padding: '22px 24px', marginTop: 24, marginBottom: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>📸 Submit Inspection Photos</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 18 }}>
                    Attach photos to work orders, defect reports, or pre/post-trip inspections.
                </p>
                <PhotoCapture context="defect" label="Defect Photo" multiple />
                <PhotoCapture context="general" label="Pre-Trip Inspection" multiple />
            </GlassCard>

            <LogRepairModal
                isOpen={repairModalOpen}
                onClose={() => setRepairModalOpen(false)}
                onAddSuccess={fetchWorkOrders}
            />
        </motion.div>
    )
}
