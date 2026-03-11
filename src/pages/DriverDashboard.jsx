import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import StatWidget from '../components/ui/StatWidget'
import { FuelChart } from '../components/charts/Charts'
import { mockDispatchFeed } from '../data/mockData'
import { useFleetData } from '../context/FleetContext'
import InternalChat from '../components/InternalChat'
import { usePhone } from '../context/PhoneContext'
import { Truck, MapPin, Clock, Fuel, Phone, CheckCircle, Navigation, Radio, ChevronDown, ChevronUp } from 'lucide-react'

const PRIORITY_STYLES = {
    high: { border: 'rgba(239,68,68,0.35)', bg: 'rgba(239,68,68,0.06)', dot: '#ef4444', label: 'URGENT' },
    warning: { border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.06)', dot: '#f59e0b', label: 'NOTICE' },
    info: { border: 'rgba(59,142,243,0.25)', bg: 'rgba(59,142,243,0.04)', dot: '#3b8ef3', label: 'INFO' },
}

function DispatchFeed() {
    const [expanded, setExpanded] = useState(null)
    const [dismissed, setDismissed] = useState([])
    const visible = mockDispatchFeed.filter(f => !dismissed.includes(f.id))

    return (
        <GlassCard style={{ padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3a8', animation: 'ring-pulse 2s infinite' }} />
                <Radio size={15} color="#22d3a8" />
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>Dispatch Alerts</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    From: Sarah Mitchell · Dispatch Office
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AnimatePresence>
                    {visible.map((item, i) => {
                        const ps = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.info
                        const isOpen = expanded === item.id
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.25 }}
                                style={{
                                    borderRadius: 12, border: `1px solid ${ps.border}`,
                                    background: ps.bg, overflow: 'hidden',
                                }}
                            >
                                <button
                                    onClick={() => setExpanded(isOpen ? null : item.id)}
                                    style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 12,
                                        width: '100%', padding: '12px 14px', background: 'none',
                                        border: 'none', cursor: 'pointer', textAlign: 'left',
                                    }}
                                >
                                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {item.title}
                                            </span>
                                            <span style={{
                                                fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
                                                color: ps.dot, background: `${ps.dot}18`,
                                                padding: '2px 6px', borderRadius: 4,
                                            }}>
                                                {ps.label}
                                            </span>
                                        </div>
                                        {!isOpen && (
                                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {item.body}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                        <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{item.time}</span>
                                        {isOpen ? <ChevronUp size={13} color="var(--text-tertiary)" /> : <ChevronDown size={13} color="var(--text-tertiary)" />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{ padding: '0 14px 14px 44px' }}
                                        >
                                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                                                {item.body}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                                    📡 {item.from}
                                                </span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDismissed(d => [...d, item.id]) }}
                                                    style={{
                                                        fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        padding: '4px 8px', borderRadius: 6,
                                                    }}
                                                >
                                                    ✓ Dismiss
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
                {visible.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
                        ✓ All caught up — no pending alerts
                    </div>
                )}
            </div>
        </GlassCard>
    )
}


const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

export default function DriverDashboard() {
    const { drivers, fleet } = useFleetData()
    const [isChatOpen, setIsChatOpen] = useState(false)
    const { makeCall } = usePhone()

    // Find current driver's HOS clock (first active driver as demo fallback)
    const myDriver = drivers.find(d => d.status === 'driving' || d.status === 'onDuty') || null
    const hosHours = myDriver ? parseFloat(myDriver.hosRemaining ?? 7.5) : 7.5
    const hosMax = 11
    const myTruck = fleet.find(t => t.driver && t.status === 'active') || fleet[0]
    const fuelPct = myTruck?.fuel ?? 72

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <InternalChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            {/* Dispatch Alerts Feed */}
            <DispatchFeed />

            {/* Current Route Card */}
            <GlassCard glow="green" style={{ padding: '24px', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-green)', animation: 'ring-pulse 2s infinite' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Route</span>
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
                            Chicago, IL → Dallas, TX
                        </h2>
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <MapPin size={13} /> 920 mi total
                            </span>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Clock size={13} /> ETA: Mar 6, 18:00
                            </span>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Truck size={13} /> TRK-001 · Load LD-9823
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="quick-btn" style={{ background: 'var(--accent-green-dim)', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>
                            <Navigation size={14} /> Navigate
                        </button>
                        <button className="quick-btn" onClick={() => makeCall('Dispatch', 'Dispatch Office')}>
                            <Phone size={14} /> Call Dispatch
                        </button>
                    </div>
                </div>

                {/* Route Progress */}
                <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <span>Chicago, IL</span>
                        <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>68% Complete</span>
                        <span>Dallas, TX</span>
                    </div>
                    <div className="progress-track" style={{ height: 10, background: 'rgba(255,255,255,0.06)' }}>
                        <div style={{
                            height: '100%', width: '68%', borderRadius: 5,
                            background: 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))',
                            boxShadow: '0 0 14px rgba(34,211,168,0.5)',
                            transition: 'width 1.2s cubic-bezier(0.23,1,0.32,1)'
                        }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 5 }}>
                        <span></span>
                        <span>🚛 You are here — 626 mi driven</span>
                        <span>294 mi remaining</span>
                    </div>
                </div>
            </GlassCard>

            {/* Stats */}
            <div className="stat-grid" style={{ marginBottom: 24 }}>
                <StatWidget label="Miles Today" value={626} suffix=" mi" sub="+4% avg" trend="up" icon={Truck} accent="blue" />
                <StatWidget label="Fuel Level" value={fuelPct} suffix="%" sub={`~${Math.round(fuelPct * 7.5)} mi range`} icon={Fuel} accent="green" />
                <StatWidget label="ETA" value="18:00" sub="Mar 6 · On schedule" icon={Clock} accent="purple" />
                <StatWidget label="Load Weight" value="42,000" suffix=" lbs" sub="Under limit" icon={CheckCircle} accent="amber" />
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* HOS */}
                <GlassCard style={{ padding: '22px 24px' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Hours of Service (HOS)</h3>
                    {[
                        { label: 'Drive Time Used', used: hosHours, max: hosMax, color: 'var(--accent-blue)' },
                        { label: 'Duty Time Used', used: 9, max: 14, color: 'var(--accent-purple)' },
                        { label: 'Weekly Driving', used: 42, max: 70, color: 'var(--accent-amber)' },
                    ].map(h => (
                        <div key={h.label} className="hos-bar-wrap">
                            <div className="hos-label">
                                <span>{h.label}</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{h.used}h / {h.max}h</span>
                            </div>
                            <div className="progress-track">
                                <div style={{
                                    height: '100%', width: `${(h.used / h.max) * 100}%`, borderRadius: 3,
                                    background: h.color, transition: 'width 1s cubic-bezier(0.23,1,0.32,1)'
                                }} />
                            </div>
                        </div>
                    ))}
                    <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--accent-amber-dim)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-amber)' }}>⚠ Required Break in 3.5 hours</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Plan a 30-min rest stop near Joplin, MO</div>
                    </div>
                </GlassCard>

                {/* Contact Panel */}
                <GlassCard style={{ padding: '22px 24px' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Quick Contacts</h3>
                    {[
                        { name: 'Sarah Mitchell', role: 'Dispatch', icon: '📋', color: '#3b8ef3', phone: '555-0101' },
                        { name: 'Ray Johnson', role: 'Mechanic', icon: '🔧', color: '#f59e0b', phone: '555-0102' },
                        { name: 'Emergency Line', role: 'Safety', icon: '🆘', color: '#ef4444', phone: '911' },
                    ].map(c => (
                        <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                {c.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.role}</div>
                            </div>
                            <button className="quick-btn" style={{ padding: '7px 14px' }} onClick={() => makeCall(c.phone, c.name)}>
                                <Phone size={13} /> Call
                            </button>
                        </div>
                    ))}
                </GlassCard>
            </div>

        </motion.div >
    )
}
