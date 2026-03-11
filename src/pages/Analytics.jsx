import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import StatWidget from '../components/ui/StatWidget'
import { FuelChart, MaintenanceChart, DispatchChart } from '../components/charts/Charts'
import { DollarSign, TrendingUp, Truck, Users, Fuel, BarChart3 } from 'lucide-react'

const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

const revenueData = [
    { week: 'W1', revenue: 62400, miles: 14200, loads: 18 },
    { week: 'W2', revenue: 71800, miles: 16800, loads: 22 },
    { week: 'W3', revenue: 58200, miles: 13100, loads: 16 },
    { week: 'W4', revenue: 84500, miles: 20400, loads: 27 },
    { week: 'W5', revenue: 79300, miles: 18900, loads: 24 },
    { week: 'W6', revenue: 91200, miles: 22600, loads: 30 },
]

const topDrivers = [
    { name: 'Dave Kowalski', miles: 4820, loads: 14, onTime: 98, score: 97 },
    { name: 'Carlos Rivera', miles: 4410, loads: 13, onTime: 95, score: 93 },
    { name: 'Mike Torres', miles: 4180, loads: 12, onTime: 92, score: 89 },
    { name: 'Linda Shaw', miles: 3920, loads: 11, onTime: 96, score: 88 },
    { name: 'Amy Chen', miles: 2100, loads: 6, onTime: 100, score: 95 },
]

const laneData = [
    { lane: 'Chicago → Dallas', loads: 18, revenue: '$38,400', avgMiles: 920 },
    { lane: 'Dallas → Houston', loads: 24, revenue: '$21,600', avgMiles: 239 },
    { lane: 'Houston → Memphis', loads: 12, revenue: '$27,800', avgMiles: 567 },
    { lane: 'Atlanta → Miami', loads: 9, revenue: '$19,200', avgMiles: 662 },
    { lane: 'Los Angeles → Phoenix', loads: 8, revenue: '$14,400', avgMiles: 370 },
]

export default function Analytics() {
    const maxRevenue = Math.max(...revenueData.map(d => d.revenue))

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Analytics</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Fleet performance · Revenue · Driver metrics</p>
            </div>

            {/* KPI row */}
            <div className="stat-grid" style={{ marginBottom: 24 }}>
                <StatWidget label="Revenue MTD" value="$447,400" sub="+14% vs last month" trend="up" icon={DollarSign} accent="green" />
                <StatWidget label="Miles MTD" value="109,800" sub="+8% vs last month" trend="up" icon={Truck} accent="blue" />
                <StatWidget label="Loads Delivered" value={127} sub="All on time" trend="up" icon={TrendingUp} accent="purple" />
                <StatWidget label="Fleet Utilization" value="87" suffix="%" sub="6/6 active" icon={BarChart3} accent="amber" />
            </div>

            {/* Revenue trend */}
            <GlassCard style={{ padding: '22px 24px', marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 20 }}>Weekly Revenue Trend</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140 }}>
                    {revenueData.map(d => (
                        <div key={d.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600 }}>
                                ${(d.revenue / 1000).toFixed(0)}k
                            </div>
                            <motion.div
                                initial={{ height: 0 }} animate={{ height: `${(d.revenue / maxRevenue) * 110}px` }}
                                transition={{ delay: 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                                style={{
                                    width: '100%', borderRadius: '6px 6px 0 0',
                                    background: 'linear-gradient(180deg, var(--accent-blue), var(--accent-purple))',
                                    boxShadow: '0 0 14px rgba(59,142,243,0.3)',
                                    minHeight: 4,
                                }}
                            />
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{d.week}</div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            <div className="grid-2" style={{ marginBottom: 20 }}>
                {/* Top Drivers */}
                <GlassCard style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>🏆 Top Drivers — This Month</div>
                    {topDrivers.map((d, i) => (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 800, color: i === 0 ? 'white' : 'var(--text-secondary)',
                            }}>
                                {i + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                    {d.miles.toLocaleString()} mi · {d.loads} loads · {d.onTime}% on-time
                                </div>
                            </div>
                            <div style={{
                                fontSize: 13, fontWeight: 800,
                                color: d.score >= 95 ? 'var(--accent-green)' : d.score >= 88 ? 'var(--accent-blue)' : 'var(--accent-amber)',
                            }}>
                                {d.score}
                            </div>
                        </div>
                    ))}
                </GlassCard>

                {/* Top Lanes */}
                <GlassCard style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📍 Top Revenue Lanes</div>
                    {laneData.map((l, i) => (
                        <div key={l.lane} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 12, fontWeight: 600 }}>{l.lane}</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-green)' }}>{l.revenue}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{l.loads} loads</span>
                                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{l.avgMiles} avg mi</span>
                            </div>
                            <div className="progress-track">
                                <motion.div
                                    initial={{ width: 0 }} animate={{ width: `${(l.loads / laneData[0].loads) * 100}%` }}
                                    transition={{ delay: i * 0.1 + 0.2, duration: 0.6 }}
                                    style={{ height: '100%', borderRadius: 3, background: 'var(--accent-blue)' }}
                                />
                            </div>
                        </div>
                    ))}
                </GlassCard>
            </div>

            <div className="grid-2">
                <FuelChart />
                <MaintenanceChart />
            </div>
        </motion.div>
    )
}
