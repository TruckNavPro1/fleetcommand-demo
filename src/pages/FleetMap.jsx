/**
 * Fleet Map — live vehicle positions
 *
 * Data priority:
 *   1. Samsara GPS (real lat/lng) when token is configured
 *   2. Supabase `vehicles` table (updated by Samsara webhook or manual dispatch)
 *   3. Mock data fallback
 *
 * Realtime: subscribes to Supabase `vehicles` changes so position/status
 * updates from any source (webhook, office edit) are reflected instantly.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import { useFleetData } from '../context/FleetContext'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { Truck, Wifi, WifiOff } from 'lucide-react'

const STATUS_COLORS = {
    active:      { dot: '#22d3a8', label: 'En Route',    bg: 'rgba(34,211,168,0.12)' },
    rest:        { dot: '#3b8ef3', label: 'Rest Stop',   bg: 'rgba(59,142,243,0.12)' },
    maintenance: { dot: '#ef4444', label: 'Maintenance', bg: 'rgba(239,68,68,0.12)' },
    idle:        { dot: '#f59e0b', label: 'Idle',        bg: 'rgba(245,158,11,0.12)' },
}

// Convert WGS-84 lat/lng to approximate % position on the SVG US map.
// US mainland bounding box: lat 24-49, lng -125 to -66
function latLngToPos(lat, lng) {
    const clampedLat = Math.max(24, Math.min(49, lat))
    const clampedLng = Math.max(-125, Math.min(-66, lng))
    const left = ((clampedLng + 125) / 59) * 82 + 7   // 7%-89%
    const top  = ((49 - clampedLat) / 25) * 70 + 15   // 15%-85%
    return { top: `${top.toFixed(1)}%`, left: `${left.toFixed(1)}%` }
}

// Static fallback positions for mock trucks (no GPS data)
const MOCK_POSITIONS = {
    'TRK-001': { top: '52%', left: '52%' },
    'TRK-002': { top: '60%', left: '34%' },
    'TRK-003': { top: '58%', left: '14%' },
    'TRK-004': { top: '38%', left: '55%' },
    'TRK-005': { top: '66%', left: '60%' },
    'TRK-006': { top: '62%', left: '57%' },
}

const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

export default function FleetMap() {
    const { fleet: samsaraFleet, isLive } = useFleetData()
    const { user } = useAuth()
    const [selected, setSelected] = useState(null)

    // Supabase vehicles layer — patches status/fuel/lat/lng via Realtime
    const [dbVehicles, setDbVehicles] = useState({})

    useEffect(() => {
        if (!user?.organization_id) return

        const fetchDbVehicles = async () => {
            const { data } = await supabase
                .from('vehicles')
                .select('id, status, fuel_level, lat, lng')
                .eq('organization_id', user.organization_id)
            if (data) {
                const map = {}
                data.forEach(v => { map[v.id] = v })
                setDbVehicles(map)
            }
        }

        fetchDbVehicles()

        const channel = supabase
            .channel(`vehicles:map:${user.organization_id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'vehicles',
                    filter: `organization_id=eq.${user.organization_id}`,
                },
                payload => {
                    const v = payload.new ?? payload.old
                    if (!v?.id) return
                    setDbVehicles(prev => ({ ...prev, [v.id]: { ...prev[v.id], ...v } }))
                }
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [user?.organization_id])

    // Samsara fleet is authoritative for GPS; DB layer patches status/fuel
    const fleet = samsaraFleet.map(truck => ({
        ...truck,
        ...(dbVehicles[truck.id] ?? {}),
    }))

    const counts = {
        active:      fleet.filter(v => v.status === 'active').length,
        rest:        fleet.filter(v => v.status === 'rest').length,
        maintenance: fleet.filter(v => v.status === 'maintenance').length,
        idle:        fleet.filter(v => v.status === 'idle').length,
    }

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Fleet Map</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {isLive
                        ? 'Live vehicle positions · Samsara GPS + Supabase Realtime'
                        : 'Demo data · Connect Samsara in Settings for live GPS'}
                </p>
            </div>

            {/* Status pills */}
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
                        {/* US outline */}
                        <svg viewBox="0 0 960 600" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
                            <path d="M200,120 L760,120 L780,200 L820,280 L800,400 L700,460 L580,480 L400,470 L250,430 L160,350 L140,260 Z"
                                fill="none" stroke="rgba(59,142,243,0.6)" strokeWidth="1.5" />
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
                            { name: 'Chicago',     top: '38%', left: '53%' },
                            { name: 'Dallas',      top: '65%', left: '44%' },
                            { name: 'Atlanta',     top: '62%', left: '62%' },
                            { name: 'Denver',      top: '48%', left: '30%' },
                            { name: 'Los Angeles', top: '56%', left: '9%'  },
                            { name: 'Houston',     top: '72%', left: '45%' },
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
                        {fleet.map(vehicle => {
                            const hasGps = vehicle.lat && vehicle.lng
                            const pos = hasGps
                                ? latLngToPos(vehicle.lat, vehicle.lng)
                                : (MOCK_POSITIONS[vehicle.id] ?? { top: '50%', left: '50%' })
                            const s = STATUS_COLORS[vehicle.status] ?? STATUS_COLORS.idle
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
                                    {vehicle.status === 'active' && (
                                        <div style={{
                                            position: 'absolute', inset: -8, borderRadius: '50%',
                                            border: `2px solid ${s.dot}`,
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

                        {/* Live / Demo badge */}
                        <div style={{
                            position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px',
                            background: isLive ? 'rgba(34,211,168,0.1)' : 'rgba(245,158,11,0.1)',
                            border: `1px solid ${isLive ? 'rgba(34,211,168,0.3)' : 'rgba(245,158,11,0.3)'}`,
                            borderRadius: 20,
                        }}>
                            <div style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: isLive ? '#22d3a8' : '#f59e0b',
                                animation: isLive ? 'ring-pulse 2s infinite' : 'none',
                            }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: isLive ? '#22d3a8' : '#f59e0b' }}>
                                {isLive ? 'LIVE' : 'DEMO'}
                            </span>
                            {isLive ? <Wifi size={11} color="#22d3a8" /> : <WifiOff size={11} color="#f59e0b" />}
                        </div>
                    </div>
                </GlassCard>

                {/* Vehicle list panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {fleet.map(vehicle => {
                        const s = STATUS_COLORS[vehicle.status] ?? STATUS_COLORS.idle
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
                                    {vehicle.route ?? '—'} · Fuel {vehicle.fuel ?? vehicle.fuel_level ?? '?'}%
                                </div>
                                {isSelected && (
                                    <div style={{ marginTop: 10, paddingLeft: 18 }}>
                                        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${vehicle.progress ?? 0}%`, background: s.dot, borderRadius: 2 }} />
                                        </div>
                                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>
                                            {vehicle.progress ?? 0}% complete · {vehicle.lastUpdate ?? 'recently updated'}
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
