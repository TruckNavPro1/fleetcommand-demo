import { motion } from 'framer-motion'
import { useState } from 'react'
import StatWidget from '../components/ui/StatWidget'
import GlassCard from '../components/ui/GlassCard'
import FleetMap from '../components/map/FleetMap'
import { FuelChart, DispatchChart } from '../components/charts/Charts'
import { useFleetData } from '../context/FleetContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Truck, AlertTriangle, Package, Fuel, Users, PhoneCall, Plus, RefreshCw } from 'lucide-react'
import AddLoadModal from '../components/AddLoadModal'
import InternalChat from '../components/InternalChat'
import { usePhone } from '../context/PhoneContext'

const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
}

const statusColors = { active: '#22d3a8', rest: '#f59e0b', maintenance: '#ef4444', idle: '#a855f7' }

export default function Overview() {
    const { fleet, alerts, activity, loading, refresh } = useFleetData()
    const active = fleet.filter(t => t.status === 'active').length
    const onRest = fleet.filter(t => t.status === 'rest').length
    const inMaint = fleet.filter(t => t.status === 'maintenance').length

    const [isLoadOpen, setIsLoadOpen] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const { makeCall } = usePhone()

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <AddLoadModal isOpen={isLoadOpen} onClose={() => setIsLoadOpen(false)} onAddSuccess={() => { }} />
            <InternalChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            {/* Quick Actions */}
            <div className="quick-actions">
                <button className="quick-btn" onClick={() => setIsLoadOpen(true)}><Plus size={16} /> New Dispatch</button>
                <button className="quick-btn" onClick={() => makeCall('+1 (555) 019-2831', 'Driver (via Tracker)')}><PhoneCall size={16} /> Contact Driver</button>
                <button className="quick-btn" onClick={refresh}><RefreshCw size={16} /> Refresh Data</button>
                <button className="quick-btn" onClick={() => alert("Issue reported to support via ticketing system. Reference #8841")}><AlertTriangle size={16} /> Report Issue</button>
            </div>

            {/* KPI Stats */}
            <div className="stat-grid">
                <StatWidget label="Active Trucks" value={active} sub="On the road" trend="up" icon={Truck} accent="green" />
                <StatWidget label="Loads Today" value={12} sub="+3 vs yesterday" trend="up" icon={Package} accent="blue" />
                <StatWidget label="Fuel Cost Today" value={3284} prefix="$" sub="Est. $22k this week" icon={Fuel} accent="amber" />
                <StatWidget label="Active Alerts" value={alerts.length} sub={alerts.filter(a => a.severity === 'critical' || a.type === 'critical').length + ' critical'} trend="down" icon={AlertTriangle} accent="red" />
                <StatWidget label="Drivers on Duty" value={fleet.filter(t => t.status === 'active' || t.status === 'rest').length} sub={`${onRest} on rest`} icon={Users} accent="purple" />
                <StatWidget label="Miles Today" value={8420} sub="On pace for month" trend="up" icon={Truck} accent="blue" />
            </div>

            {/* Fleet Bar */}
            <GlassCard style={{ padding: '18px 24px', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>Fleet Status Overview</h3>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fleet.length} vehicles total</span>
                </div>
                {loading ? <LoadingSpinner size={24} label="Fetching fleet status…" /> : (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {Object.entries(statusColors).map(([status, color]) => {
                            const count = fleet.filter(t => t.status === status).length
                            const pct = (count / fleet.length) * 100
                            return (
                                <div key={status} style={{ flex: `${pct} 0 0`, minWidth: 60 }}>
                                    <div style={{ height: 8, background: color, borderRadius: 4, marginBottom: 6, opacity: 0.85 }} />
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{status}</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>{count}</div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </GlassCard>

            {/* Map + Alerts */}
            <div className="grid-2" style={{ marginBottom: 24 }}>
                <FleetMap />
                <GlassCard style={{ padding: '20px 24px' }}>
                    <div className="section-header">
                        <span className="section-title">Live Alerts</span>
                        <span className="section-action">View all</span>
                    </div>
                    {loading ? <LoadingSpinner size={24} label="Fetching alerts…" /> : alerts.slice(0, 4).map((alert, i) => (
                        <div key={alert.id ?? i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                background: (alert.type === 'critical' || alert.severity === 'critical') ? 'var(--accent-red-dim)' : (alert.type === 'warning' || alert.severity === 'warning') ? 'var(--accent-amber-dim)' : 'var(--accent-blue-dim)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <AlertTriangle size={16} color={(alert.type === 'critical' || alert.severity === 'critical') ? 'var(--accent-red)' : (alert.type === 'warning' || alert.severity === 'warning') ? 'var(--accent-amber)' : 'var(--accent-blue)'} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{alert.msg ?? alert.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{alert.time}</div>
                            </div>
                            <span className={`badge badge-${(alert.type === 'critical' || alert.severity === 'critical') ? 'red' : (alert.type === 'warning' || alert.severity === 'warning') ? 'amber' : 'blue'}`}>
                                <span className="badge-dot pulse" />
                                {alert.type ?? alert.severity}
                            </span>
                        </div>
                    ))}
                </GlassCard>
            </div>

            {/* Charts */}
            <div className="grid-2" style={{ marginBottom: 24 }}>
                <FuelChart />
                <DispatchChart />
            </div>

            {/* Activity Feed + Fleet Table */}
            <div className="grid-2">
                <GlassCard style={{ padding: '20px 24px' }}>
                    <div className="section-header">
                        <span className="section-title">Recent Activity</span>
                    </div>
                    <div className="activity-list">
                        {activity.map((item, i) => (
                            <div key={i} className="activity-item">
                                <div className="activity-icon" style={{ background: `${item.color}18` }}>
                                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                                </div>
                                <div className="activity-content">
                                    <h4>{item.title}</h4>
                                    <p>{item.desc}</p>
                                </div>
                                <div className="activity-time">{item.time}</div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard style={{ padding: '20px 24px', overflowX: 'auto' }}>
                    <div className="section-header">
                        <span className="section-title">Fleet Roster</span>
                    </div>
                    {loading ? <LoadingSpinner size={24} label="Loading fleet…" /> : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Truck</th>
                                    <th>Driver</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fleet.map(truck => (
                                    <tr key={truck.id}>
                                        <td style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>{truck.id}</td>
                                        <td>{truck.driver}</td>
                                        <td>
                                            <span className={`badge badge-${truck.status === 'active' ? 'green' : truck.status === 'maintenance' ? 'red' : truck.status === 'rest' ? 'amber' : 'purple'}`}>
                                                <span className="badge-dot" />
                                                {truck.status}
                                            </span>
                                        </td>
                                        <td style={{ width: 100 }}>
                                            {truck.progress > 0 && (
                                                <div>
                                                    <div className="progress-track">
                                                        <div className="progress-fill" style={{ width: `${truck.progress}%` }} />
                                                    </div>
                                                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 3 }}>{truck.progress}%</div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </GlassCard>
            </div>
        </motion.div>
    )
}
