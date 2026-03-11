import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import StatWidget from '../components/ui/StatWidget'
import { useFleetData } from '../context/FleetContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Truck, Activity, AlertTriangle, CheckCircle, Wrench, PlusCircle } from 'lucide-react'
import LogRepairModal from '../components/LogRepairModal'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

const SYSTEMS = ['engine', 'brakes', 'tires', 'oil']
const SYS_STYLE = {
    Good: { color: '#22d3a8', bg: 'rgba(34,211,168,0.1)', label: 'Good' },
    'Service Soon': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Service Soon' },
    FAULT: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'FAULT' },
    Low: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Low' },
}

const healthColor = h => h >= 80 ? '#22d3a8' : h >= 60 ? '#f59e0b' : '#ef4444'

// Enriched mock data
const healthDetails = {
    'TRK-001': { mileage: '482,210', nextService: '485,000', lastService: 'Feb 10, 2026', issues: [], temp: 195, battery: 13.8 },
    'TRK-002': { mileage: '304,880', nextService: '305,000', lastService: 'Jan 28, 2026', issues: ['Brake pads at 35% — schedule soon'], temp: 198, battery: 13.6 },
    'TRK-003': { mileage: '218,540', nextService: '220,000', lastService: 'Jan 15, 2026', issues: ['Right rear tire tread: 4/32"'], temp: 201, battery: 12.9 },
    'TRK-004': { mileage: '391,200', nextService: 'In bay', lastService: 'Mar 5, 2026', issues: ['P0300 misfire — in service', 'Oil level critical'], temp: 225, battery: 11.2 },
    'TRK-005': { mileage: '167,340', nextService: '170,000', lastService: 'Feb 20, 2026', issues: [], temp: 194, battery: 13.9 },
    'TRK-006': { mileage: '88,190', nextService: '90,000', lastService: 'Mar 1, 2026', issues: [], temp: 192, battery: 14.1 },
}

const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

export default function VehicleHealth() {
    const { vehicleHealth, loading } = useFleetData()
    const healthy = vehicleHealth.filter(v => v.health >= 80).length
    const caution = vehicleHealth.filter(v => v.health >= 60 && v.health < 80).length
    const critical = vehicleHealth.filter(v => v.health < 60).length
    const inBay = vehicleHealth.filter(v => v.engine === 'FAULT' || v.oil === 'Low').length

    // Modal state
    const [repairModalOpen, setRepairModalOpen] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState('')
    const { user } = useAuth()
    const [openWorkOrders, setOpenWorkOrders] = useState([])

    const fetchWO = async () => {
        if (!user) return

        if (user.isDemo) {
            setOpenWorkOrders([
                { asset_id: 'TRK-004', service_category: 'Brakes', priority: 'High' },
                { asset_id: 'TRK-012', service_category: 'Engine', priority: 'Critical' },
            ])
            return
        }

        if (!user?.organization_id) return

        const { data } = await supabase
            .from('work_orders')
            .select('asset_id, service_category, priority')
            .eq('organization_id', user.organization_id)
            .neq('status', 'Completed')

        if (data) setOpenWorkOrders(data)
    }

    useEffect(() => {
        fetchWO()
    }, [user])

    const openLogRepair = (vehicleId = '') => {
        setSelectedVehicle(vehicleId)
        setRepairModalOpen(true)
    }

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <div style={{ marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Vehicle Health</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Real-time diagnostics for all fleet vehicles</p>
                </div>
                <button
                    onClick={() => openLogRepair()}
                    style={{ padding: '10px 18px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    <Wrench size={16} /> Log Repair
                </button>
            </div>

            <div className="stat-grid" style={{ marginBottom: 24 }}>
                <StatWidget label="Healthy" value={healthy} sub="Health ≥ 80%" icon={CheckCircle} accent="green" />
                <StatWidget label="Caution" value={caution} sub="Health 60–79%" icon={AlertTriangle} accent="amber" />
                <StatWidget label="Critical" value={critical} sub="Health < 60%" icon={Wrench} accent="red" />
                <StatWidget label="Issues" value={inBay} sub="Needs attention" icon={Activity} accent="blue" />
            </div>

            {loading ? <LoadingSpinner label="Loading vehicle data…" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                    {vehicleHealth.map((v, i) => {
                        const d = healthDetails[v.id]
                        const hc = healthColor(v.health)
                        const wosForVehicle = openWorkOrders.filter(wo => wo.asset_id === v.id)
                        return (
                            <motion.div key={v.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                                <GlassCard style={{ padding: '20px 22px', border: `1px solid ${hc}25` }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 12, background: hc + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Truck size={20} color={hc} />
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{v.id}</div>
                                                <button onClick={() => openLogRepair(v.id)} style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <PlusCircle size={12} /> Log
                                                </button>
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{d.mileage} mi</div>
                                        </div>
                                        <div style={{ fontSize: 26, fontWeight: 900, color: hc, fontFamily: 'var(--font-display)' }}>{v.health}%</div>
                                    </div>

                                    {/* Health bar */}
                                    <div className="progress-track" style={{ height: 8, marginBottom: 14 }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${v.health}%` }} transition={{ duration: 0.8, delay: i * 0.08 }}
                                            style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${hc}, ${hc}88)`, boxShadow: `0 0 10px ${hc}40` }} />
                                    </div>

                                    {/* System badges */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                                        {SYSTEMS.map(sys => {
                                            const val = v[sys]
                                            const ss = SYS_STYLE[val] || SYS_STYLE['Good']
                                            return (
                                                <div key={sys} style={{ padding: '8px 10px', borderRadius: 10, background: ss.bg, border: `1px solid ${ss.color}30` }}>
                                                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{sys}</div>
                                                    <div style={{ fontSize: 12, fontWeight: 700, color: ss.color }}>{val}</div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Sensor readings */}
                                    <div style={{ display: 'flex', gap: 10, marginBottom: wosForVehicle.length ? 12 : 0 }}>
                                        <div style={{ flex: 1, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
                                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>Engine Temp</div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: d.temp > 215 ? '#ef4444' : '#22d3a8' }}>{d.temp}°F</div>
                                        </div>
                                        <div style={{ flex: 1, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
                                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>Battery</div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: d.battery < 12 ? '#ef4444' : '#22d3a8' }}>{d.battery}V</div>
                                        </div>
                                        <div style={{ flex: 1, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
                                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>Next Svc</div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{d.nextService}</div>
                                        </div>
                                    </div>

                                    {/* Issues */}
                                    {wosForVehicle.map((issue, j) => {
                                        const c = issue.priority === 'Critical' ? '#ef4444' : issue.priority === 'High' ? '#f59e0b' : '#3b8ef3'
                                        return (
                                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: `${c}15`, border: `1px solid ${c}30`, marginTop: 8 }}>
                                                <AlertTriangle size={13} color={c} />
                                                <span style={{ fontSize: 11, color: c, fontWeight: 700 }}>Open {issue.service_category} Repair ({issue.priority})</span>
                                            </div>
                                        )
                                    })}
                                </GlassCard>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            <LogRepairModal
                isOpen={repairModalOpen}
                onClose={() => setRepairModalOpen(false)}
                selectedVehicleId={selectedVehicle}
                onAddSuccess={fetchWO}
            />
        </motion.div>
    )
}
