import { useState, useEffect } from 'react'
import { useFleetData } from '../../context/FleetContext'
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps'

const statusColors = {
    active: '#22d3a8',
    rest: '#f59e0b',
    maintenance: '#ef4444',
    idle: '#a855f7',
}

// Approximate US map coordinates for fallback SVG
function toSvgCoords(lat, lng) {
    const x = ((lng - (-125)) / (-66 - (-125))) * 100
    const y = ((lat - 49) / (24 - 49)) * 100
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) }
}

function SvgFallbackMap({ fleet }) {
    return (
        <svg viewBox="0 0 100 60" style={{ width: '100%', height: 260, display: 'block' }} preserveAspectRatio="xMidYMid meet">
            <rect width="100" height="60" fill="rgba(255,255,255,0.02)" rx="2" />
            <path
                d="M 8 12 L 15 10 L 25 9 L 38 8 L 48 10 L 55 8 L 62 9 L 68 10 L 72 8 L 76 9 L 80 8 L 85 10 L 88 14 L 90 20 L 89 28 L 86 34 L 82 38 L 76 42 L 68 44 L 60 44 L 50 46 L 40 48 L 30 50 L 20 48 L 12 44 L 8 38 L 6 30 L 7 20 Z"
                fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4"
            />
            {[20, 35, 50, 65, 78].map(x => (
                <line key={x} x1={x} y1="8" x2={x} y2="50" stroke="rgba(255,255,255,0.04)" strokeWidth="0.2" />
            ))}
            {[18, 28, 38, 46].map(y => (
                <line key={y} x1="8" y1={y} x2="90" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.2" />
            ))}
            {fleet.filter(t => t.status === 'active').map((truck) => {
                const pos = toSvgCoords(truck.lat, truck.lng)
                return (
                    <line
                        key={`route-${truck.id}`}
                        x1={pos.x - 5} y1={pos.y} x2={pos.x + 10} y2={pos.y - 5}
                        stroke={statusColors.active} strokeWidth="0.3" opacity="0.3" strokeDasharray="1,1"
                    />
                )
            })}
            {fleet.map((truck) => {
                const pos = toSvgCoords(truck.lat, truck.lng)
                const color = statusColors[truck.status]
                return (
                    <g key={truck.id}>
                        {truck.status === 'active' && (
                            <circle cx={pos.x} cy={pos.y} r="3" fill="none" stroke={color} strokeWidth="0.4" opacity="0.4">
                                <animate attributeName="r" from="2" to="5" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                            </circle>
                        )}
                        <circle cx={pos.x} cy={pos.y} r="1.8" fill={color} opacity="0.9" />
                        <text x={pos.x + 2.5} y={pos.y + 0.8} fontSize="2.2" fill="rgba(255,255,255,0.6)" fontFamily="Inter, sans-serif">
                            {truck.id}
                        </text>
                    </g>
                )
            })}
        </svg>
    )
}

function GoogleMapView({ fleet, gmapsKey }) {
    const center = { lat: 39.8283, lng: -98.5795 } // Center of US

    return (
        <div style={{ width: '100%', height: 260, borderRadius: 8, overflow: 'hidden' }}>
            <APIProvider apiKey={gmapsKey}>
                <Map
                    defaultCenter={center}
                    defaultZoom={4}
                    mapId="DEMO_MAP_ID"
                    disableDefaultUI={true}
                    style={{ width: '100%', height: '100%' }}
                    colorScheme="DARK"
                >
                    {fleet.map(truck => (
                        <AdvancedMarker
                            key={truck.id}
                            position={{ lat: truck.lat, lng: truck.lng }}
                            title={`Truck ${truck.id} - ${truck.status}`}
                        >
                            <Pin
                                background={statusColors[truck.status]}
                                borderColor="rgba(255,255,255,0.4)"
                                glyphColor="rgba(0,0,0,0.5)"
                                scale={0.8}
                            />
                        </AdvancedMarker>
                    ))}
                </Map>
            </APIProvider>
        </div>
    )
}

export default function FleetMap() {
    const { fleet } = useFleetData()
    const [gmapsKey, setGmapsKey] = useState('')

    useEffect(() => {
        const key = localStorage.getItem('fc_gmaps_key')
        if (key) setGmapsKey(key)

        const interval = setInterval(() => {
            const current = localStorage.getItem('fc_gmaps_key') || ''
            if (current !== gmapsKey) setGmapsKey(current)
        }, 1000)

        return () => clearInterval(interval)
    }, [gmapsKey])

    return (
        <div className="glass-card fleet-map-wrap" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Live Fleet Map
                    {gmapsKey && <span style={{ fontSize: 10, padding: '2px 6px', background: 'rgba(34,211,168,0.15)', color: '#22d3a8', borderRadius: 4, fontWeight: 700 }}>Google Maps Active</span>}
                </h3>
                <div style={{ display: 'flex', gap: 14 }}>
                    {Object.entries(statusColors).map(([s, c]) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </div>
                    ))}
                </div>
            </div>

            {gmapsKey && gmapsKey.length > 5 ? (
                <GoogleMapView fleet={fleet} gmapsKey={gmapsKey} />
            ) : (
                <SvgFallbackMap fleet={fleet} />
            )}
        </div>
    )
}
