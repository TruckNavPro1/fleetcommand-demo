import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import StatWidget from '../components/ui/StatWidget'
import { mockFleet } from '../data/mockData'
import { Users, Phone, Star, MoreVertical } from 'lucide-react'
import { usePhone } from '../context/PhoneContext'

const rosterExtended = [
    { id: 'DRV-001', name: 'Dave Kowalski', cdl: 'CDL-A', state: 'IL', hazmat: true, tanker: true, exp: '2027-12', status: 'active', hoursWeek: 42, miles: 4820, onTime: 98, rating: 4.9, phone: '(312) 555-0182', truck: 'TRK-001' },
    { id: 'DRV-002', name: 'Mike Torres', cdl: 'CDL-A', state: 'TX', hazmat: false, tanker: true, exp: '2026-08', status: 'active', hoursWeek: 38, miles: 4180, onTime: 92, rating: 4.6, phone: '(214) 555-0193', truck: 'TRK-002' },
    { id: 'DRV-003', name: 'Linda Shaw', cdl: 'CDL-A', state: 'CA', hazmat: true, tanker: false, exp: '2028-03', status: 'rest', hoursWeek: 34, miles: 3920, onTime: 96, rating: 4.8, phone: '(310) 555-0147', truck: 'TRK-003' },
    { id: 'DRV-004', name: 'Tom Bradley', cdl: 'CDL-A', state: 'IL', hazmat: false, tanker: false, exp: '2026-11', status: 'maintenance', hoursWeek: 0, miles: 0, onTime: 89, rating: 4.2, phone: '(312) 555-0256', truck: 'TRK-004' },
    { id: 'DRV-005', name: 'Carlos Rivera', cdl: 'CDL-A', state: 'GA', hazmat: true, tanker: true, exp: '2027-06', status: 'active', hoursWeek: 44, miles: 4410, onTime: 95, rating: 4.7, phone: '(404) 555-0318', truck: 'TRK-005' },
    { id: 'DRV-006', name: 'Amy Chen', cdl: 'CDL-B', state: 'GA', hazmat: false, tanker: false, exp: '2029-01', status: 'idle', hoursWeek: 18, miles: 2100, onTime: 100, rating: 5.0, phone: '(404) 555-0429', truck: 'TRK-006' },
]

const STATUS_STYLE = {
    active: { color: '#22d3a8', label: 'En Route' },
    rest: { color: '#3b8ef3', label: 'Rest Stop' },
    maintenance: { color: '#ef4444', label: 'Off — Maint' },
    idle: { color: '#f59e0b', label: 'Available' },
}

const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

export default function DriverRoster() {
    const { makeCall } = usePhone()
    const active = rosterExtended.filter(d => d.status === 'active').length
    const available = rosterExtended.filter(d => d.status === 'idle').length
    const avgRating = (rosterExtended.reduce((s, d) => s + d.rating, 0) / rosterExtended.length).toFixed(1)

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Driver Roster</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>All active drivers, licenses, and performance</p>
            </div>

            <div className="stat-grid" style={{ marginBottom: 24 }}>
                <StatWidget label="Total Drivers" value={rosterExtended.length} sub="All CDL holders" icon={Users} accent="blue" />
                <StatWidget label="Currently Active" value={active} sub="On the road" icon={Users} accent="green" />
                <StatWidget label="Available" value={available} sub="Ready to dispatch" icon={Users} accent="amber" />
                <StatWidget label="Avg Rating" value={avgRating} suffix="/5.0" sub="Driver performance" icon={Star} accent="purple" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
                {rosterExtended.map((driver, i) => {
                    const ss = STATUS_STYLE[driver.status]
                    return (
                        <motion.div key={driver.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                            <GlassCard style={{ padding: '18px 20px' }}>
                                {/* Header row */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 50, background: `linear-gradient(135deg, ${ss.color}, #a855f7)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, flexShrink: 0, color: 'white' }}>
                                        {driver.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>{driver.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{driver.id} · {driver.truck}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginBottom: 3 }}>
                                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: ss.color }} />
                                            <span style={{ fontSize: 11, fontWeight: 700, color: ss.color }}>{ss.label}</span>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>⭐ {driver.rating}</div>
                                    </div>
                                </div>

                                {/* License info */}
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: 'rgba(59,142,243,0.15)', color: '#3b8ef3' }}>{driver.cdl} · {driver.state}</span>
                                    {driver.hazmat && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>HazMat</span>}
                                    {driver.tanker && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>Tanker</span>}
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)' }}>Exp {driver.exp}</span>
                                </div>

                                {/* Performance stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                                    {[
                                        { label: 'Miles/Mo', value: driver.miles.toLocaleString() },
                                        { label: 'HRS/Week', value: driver.hoursWeek + 'h' },
                                        { label: 'On-Time', value: driver.onTime + '%' },
                                    ].map(s => (
                                        <div key={s.label} style={{ textAlign: 'center', padding: '8px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
                                            <div style={{ fontSize: 13, fontWeight: 800 }}>{s.value}</div>
                                            <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Contact */}
                                <button onClick={() => makeCall(driver.phone, driver.name)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12 }}>
                                    <Phone size={13} color="var(--accent-blue)" />
                                    {driver.phone}
                                </button>
                            </GlassCard>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    )
}
