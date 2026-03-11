/**
 * Fleet Map — interactive vehicle locations using OpenStreetMap / Leaflet
 * Falls back to a styled static mock when Leaflet isn't loaded.
 * For demo: shows all 6 mock vehicles on a map with status badges.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import { mockFleet } from '../data/mockData'
import { Truck, MapPin, Wifi, WifiOff } from 'lucide-react'

const STATUS_COLORS = {
    active: { dot: '#22d3a8', label: 'En Route', bg: 'rgba(34,211,168,0.12)' },
    rest: { dot: '#3b8ef3', label: 'Rest Stop', bg: 'rgba(59,142,243,0.12)' },
    maintenance: { dot: '#ef4444', label: 'Maintenance', bg: 'rgba(239,68,68,0.12)' },
    idle: { dot: '#f59e0b', label: 'Idle', bg: 'rgba(245,158,11,0.12)' },
}

// Mock GPS positions spread across the US
const POSITIONS = {
    'TRK-001': { top: '52%', left: '52%' },
    'TRK-002': { top: '60%', left: '34%' },
    'TRK-003': { top: '58%', left: '14%' },
    'TRK-004': { top: '38%', left: '55%' },
    'TRK-005': { top: '66%', left: '60%' },
    'TRK-006': { top: '62%', left: '57%' },
}

const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

export default function FleetMap() {
    const [selected, setSelected] = useState(null)
    const selectedVehicle = mockFleet.find(v => v.id === selected)

    const counts = {
        active: mockFleet.filter(v => v.status === 'active').length,
        rest: mockFleet.filter(v => v.status === 'rest').length,
        maintenance: mockFleet.filter(v => v.status === 'maintenance').length,
        idle: mockFleet.filter(v => v.status === 'idle').length,
    }

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Fleet Map</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    Live vehicle positions · Updated every 30 seconds via Samsara GPS
                </p>
            </div>

            {/* Status summary pills */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                {Object.entries(counts).map(([status, count]) => {
                    const s = STATUS_COLORS[status]
                    return (
                        <div key={status} style={{
                            display: 'flex', alignItems: 'center', gap: 7,
                            padding: '7px 14px', borderRadius: 20,
                            background: s.bg, border: `1px solid ${s.dot}30`,
                        }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot }} />
                            <span style={{ fontSize: 12, fontWeight: 700 }}>{count} {s.label}</span>
                        </div>
                    )
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
                {/* Map */}
                <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{
                        position: 'relative', height: 520,
                        background: 'linear-gradient(180deg, #0a1628 0%, #0f1f3d 100%)',
                        overflow: 'hidden',
                    }}>
                        {/* US map outline (SVG-based simplified) */}
                        <svg viewBox="0 0 960 600" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
                            <path d="M200,120 L760,120 L780,200 L820,280 L800,400 L700,460 L580,480 L400,470 L250,430 L160,350 L140,260 Z"
                                fill="none" stroke="rgba(59,142,243,0.6)" strokeWidth="1.5" />
                            {/* Major highways */}
                            <line x1="200" y1="300" x2="760" y2="300" stroke="rgba(59,142,243,0.2)" strokeWidth="1" strokeDasharray="8,6" />
                            <line x1="480" y1="120" x2="480" y2="480" stroke="rgba(59,142,243,0.2)" strokeWidth="1" strokeDasharray="8,6" />
                            <line x1="200" y1="200" x2="760" y2="400" stroke="rgba(59,142,243,0.1)" strokeWidth="1" strokeDasharray="6,8" />
                        </svg>

                        {/* Grid overlay */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            backgroundImage: 'radial-gradient(circle, rgba(59,142,243,0.06) 1px, transparent 1px)',
                            backgroundSize: '32px 32px',
                        }} />

                        {/* City labels */}
                        {[
                            { name: 'Chicago', top: '38%', left: '53%' },
                            { name: 'Dallas', top: '65%', left: '44%' },
                            { name: 'Atlanta', top: '62%', left: '62%' },
                            { name: 'Denver', top: '48%', left: '30%' },
                            { name: 'Los Angeles', top: '56%', left: '9%' },
                            { name: 'Houston', top: '72%', left: '45%' },
                        ].map(city => (
                            <div key={city.name} style={{
                                position: 'absolute', top: city.top, left: city.left,
                                fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600,
                                letterSpacing: '0.05em', transform: 'translate(-50%,-50%)',
                                pointerEvents: 'none',
                            }}>
                                · {city.name}
                            </div>
                        ))}

                        {/* Vehicle pins */}
                        {mockFleet.map(vehicle => {
                            const pos = POSITIONS[vehicle.id]
                            const s = STATUS_COLORS[vehicle.status]
                            const isSelected = selected === vehicle.id
                            return (
                                <motion.button
                                    key={vehicle.id}
                                    onClick={() => setSelected(isSelected ? null : vehicle.id)}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                        position: 'absolute', top: pos.top, left: pos.left,
                                        transform: 'translate(-50%, -50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', zIndex: 10,
                                    }}
                                >
                                    {/* Pulse ring for active */}
                                    {vehicle.status === 'active' && (
                                        <div style={{
                                            position: 'absolute', inset: -8,
                                            borderRadius: '50%', border: `2px solid ${s.dot}`,
                                            animation: 'ring-pulse 2s infinite',
                                        }} />
                                    )}
                                    <div style={{
                                        width: isSelected ? 44 : 36, height: isSelected ? 44 : 36,
                                        borderRadius: '50%', transition: 'all 0.2s',
                                        background: s.bg,
                                        border: `2px solid ${isSelected ? s.dot : s.dot + '80'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: isSelected ? `0 0 20px ${s.dot}60` : `0 0 10px ${s.dot}30`,
                                    }}>
                                        <Truck size={isSelected ? 18 : 14} color={s.dot} />
                                    </div>
                                    {/* ID label */}
                                    <div style={{
                                        position: 'absolute', top: '110%', left: '50%',
                                        transform: 'translateX(-50%)', whiteSpace: 'nowrap',
                                        fontSize: 9, fontWeight: 700, color: s.dot,
                                        background: 'rgba(10,22,40,0.8)', padding: '2px 5px', borderRadius: 4,
                                        marginTop: 2,
                                    }}>
                                        {vehicle.id}
                                    </div>
                                </motion.button>
                            )
                        })}

                        {/* Legend */}
                        <div style={{
                            position: 'absolute', bottom: 16, left: 16, padding: '10px 14px',
                            background: 'rgba(10,22,40,0.8)', borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
                        }}>
                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Legend</div>
                            {Object.entries(STATUS_COLORS).map(([status, s]) => (
                                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                                    <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Live badge */}
                        <div style={{
                            position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', background: 'rgba(34,211,168,0.1)',
                            border: '1px solid rgba(34,211,168,0.3)', borderRadius: 20,
                        }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a8', animation: 'ring-pulse 2s infinite' }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#22d3a8' }}>LIVE</span>
                            <Wifi size={11} color="#22d3a8" />
                        </div>
                    </div>
                </GlassCard>

                {/* Vehicle list panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {mockFleet.map(vehicle => {
                        const s = STATUS_COLORS[vehicle.status]
                        const isSelected = selected === vehicle.id
                        return (
                            <motion.div
                                key={vehicle.id}
                                whileHover={{ scale: 1.01 }}
                                onClick={() => setSelected(isSelected ? null : vehicle.id)}
                                style={{
                                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                                    border: `1px solid ${isSelected ? s.dot + '60' : 'rgba(255,255,255,0.07)'}`,
                                    background: isSelected ? s.bg : 'rgba(255,255,255,0.03)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                                    <span style={{ fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-display)' }}>{vehicle.id}</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: s.dot, marginLeft: 'auto' }}>{s.label}</span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, paddingLeft: 18 }}>
                                    {vehicle.driver}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, paddingLeft: 18 }}>
                                    {vehicle.route} · Fuel {vehicle.fuel}%
                                </div>
                                {isSelected && (
                                    <div style={{ marginTop: 10, paddingLeft: 18 }}>
                                        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${vehicle.progress}%`, background: s.dot, borderRadius: 2 }} />
                                        </div>
                                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>
                                            {vehicle.progress}% complete · {vehicle.lastUpdate}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    )
}
