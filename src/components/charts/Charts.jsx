import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { fuelData, maintenanceData, dispatchData } from '../../data/mockData'
import GlassCard from '../ui/GlassCard'

const TooltipStyle = {
    contentStyle: {
        background: 'rgba(7,13,26,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
        color: '#fff',
    },
    cursor: { fill: 'rgba(255,255,255,0.03)' },
}

export function FuelChart() {
    return (
        <GlassCard className="chart-container">
            <h3>Weekly Fuel Cost</h3>
            <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={fuelData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                        <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b8ef3" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3b8ef3" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
                    <Tooltip {...TooltipStyle} formatter={v => [`$${v.toLocaleString()}`, 'Fuel Cost']} />
                    <Area type="monotone" dataKey="cost" stroke="#3b8ef3" strokeWidth={2} fill="url(#fuelGrad)" dot={false} />
                </AreaChart>
            </ResponsiveContainer>
        </GlassCard>
    )
}

export function MaintenanceChart() {
    return (
        <GlassCard className="chart-container">
            <h3>Maintenance History</h3>
            <ResponsiveContainer width="100%" height={180}>
                <BarChart data={maintenanceData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                    <Tooltip {...TooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
                    <Bar dataKey="scheduled" name="Scheduled" fill="#22d3a8" radius={[4, 4, 0, 0]} opacity={0.85} />
                    <Bar dataKey="unscheduled" name="Unscheduled" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.85} />
                </BarChart>
            </ResponsiveContainer>
        </GlassCard>
    )
}

export function DispatchChart() {
    return (
        <GlassCard className="chart-container">
            <h3>Weekly Loads Dispatched</h3>
            <ResponsiveContainer width="100%" height={180}>
                <LineChart data={dispatchData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                    <Tooltip {...TooltipStyle} />
                    <Line type="monotone" dataKey="loads" name="Loads" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: '#a855f7', r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </GlassCard>
    )
}
