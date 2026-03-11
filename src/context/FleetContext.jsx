/**
 * FleetContext — Central data provider for FleetCommand
 *
 * Role-based access:
 *   driver   → always uses frontend mock data (no backend access)
 *   mechanic → fetches live Samsara data when token is available
 *   office   → fetches live Samsara data when token is available
 *
 * Polls every 30s while in live mode.
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
    hasSamsaraToken,
    getVehicles,
    getVehicleLocations,
    getVehicleStats,
    getDrivers,
    getDriverDutyStatus,
    getSafetyEvents,
    getDVIRs,
    normalizeTruck,
    normalizeDriver,
} from '../services/samsaraService'
import {
    mockFleet,
    mockAlerts,
    mockActivity,
    vehicleHealth as mockVehicleHealth,
} from '../data/mockData'
import { useAuth } from './AuthContext'

const FleetContext = createContext(null)
const POLL_INTERVAL = 30_000

// Roles that are allowed to access the backend
const BACKEND_ROLES = ['mechanic', 'office']

// ── Normalizers ───────────────────────────────────────────────────

function normalizeAlerts(safetyEvents = [], dvirs = []) {
    const safetyAlerts = safetyEvents.map((e, i) => ({
        id: `safety-${i}`,
        severity: e.behavior?.includes('harsh') ? 'warning' : 'critical',
        category: 'Safety',
        title: `${e.behaviorLabel ?? 'Safety Event'} — ${e.vehicle?.name ?? 'Vehicle'}`,
        body: `${e.behavior ?? ''} logged at ${e.location?.reverseGeo?.formattedLocation ?? 'unknown location'}.`,
        time: e.time ? new Date(e.time).toLocaleTimeString() : 'Recently',
        role: 'all',
    }))
    const dvirAlerts = dvirs.map((d, i) => ({
        id: `dvir-${i}`,
        severity: d.resolved ? 'info' : 'warning',
        category: 'Maintenance',
        title: `Defect Report — ${d.vehicle?.name ?? 'Vehicle'}`,
        body: d.defectType ?? 'Vehicle defect reported during inspection.',
        time: d.createdAtTime ? new Date(d.createdAtTime).toLocaleTimeString() : 'Recently',
        role: 'all',
    }))
    return [...safetyAlerts, ...dvirAlerts]
}

function normalizeVehicleHealth(vehicles, locations, stats) {
    return vehicles.map(v => {
        const loc = locations.find(l => l.id === v.id)
        const stat = stats.find(s => s.id === v.id)
        const fuel = stat?.fuelPercents?.[0]?.value ?? null
        const engineState = stat?.engineStates?.[0]?.value ?? 'Off'
        const odometer = stat?.obdOdometerMeters?.[0]?.value ?? null
        const odometerMi = odometer ? Math.round(odometer * 0.000621371).toLocaleString() : '—'
        const healthScore = fuel !== null ? Math.round(fuel) : 75
        return {
            id: v.name ?? v.id,
            samsaraId: v.id,
            health: healthScore,
            engine: engineState === 'On' ? 'Good' : 'Off',
            brakes: 'Good',
            tires: 'Good',
            oil: fuel !== null && fuel < 20 ? 'Low' : 'Good',
            mileage: odometerMi,
            lat: loc?.location?.latitude ?? 0,
            lng: loc?.location?.longitude ?? 0,
            fuel: fuel !== null ? Math.round(fuel) : 0,
        }
    })
}

// ── Provider ──────────────────────────────────────────────────────

export function FleetProvider({ children }) {
    const { user } = useAuth()
    const role = user?.role ?? null

    // True only for mechanic and office roles
    const canAccessBackend = BACKEND_ROLES.includes(role)

    const [fleet, setFleet] = useState(() => {
        const c = localStorage.getItem('fc_cache_fleet');
        return c ? JSON.parse(c) : mockFleet;
    })
    const [drivers, setDrivers] = useState(() => {
        const c = localStorage.getItem('fc_cache_drivers');
        return c ? JSON.parse(c) : [];
    })
    const [alerts, setAlerts] = useState(() => {
        const c = localStorage.getItem('fc_cache_alerts');
        return c ? JSON.parse(c) : mockAlerts;
    })
    const [vehicleHealth, setVehicleHealth] = useState(() => {
        const c = localStorage.getItem('fc_cache_health');
        return c ? JSON.parse(c) : mockVehicleHealth;
    })
    const [activity] = useState(mockActivity)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isLive, setIsLive] = useState(false)
    const pollRef = useRef(null)

    const fetchLive = useCallback(async () => {
        // Drivers and Demo modes are always frontend-only
        if (!canAccessBackend || !hasSamsaraToken() || user?.isDemo) {
            setFleet(mockFleet)
            setAlerts(mockAlerts)
            setVehicleHealth(mockVehicleHealth)
            setIsLive(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const [vehicles, locations, stats, driverList, dutyClocks, safetyEvents, dvirs] =
                await Promise.all([
                    getVehicles(),
                    getVehicleLocations(),
                    getVehicleStats(),
                    getDrivers(),
                    getDriverDutyStatus(),
                    getSafetyEvents(),
                    getDVIRs(),
                ])

            const normalizedFleet = vehicles.map(v => {
                const loc = locations.find(l => l.id === v.id)
                const stat = stats.find(s => s.id === v.id)
                return normalizeTruck(v, loc, stat, dutyClocks)
            })
            const finalFleet = normalizedFleet.length ? normalizedFleet : mockFleet
            setFleet(finalFleet)
            localStorage.setItem('fc_cache_fleet', JSON.stringify(finalFleet))

            const normalizedDrivers = driverList.map(d => {
                const clock = dutyClocks.find(c => c.driver?.id === d.id)
                return normalizeDriver(d, clock)
            })
            setDrivers(normalizedDrivers)
            localStorage.setItem('fc_cache_drivers', JSON.stringify(normalizedDrivers))

            const liveAlerts = normalizeAlerts(safetyEvents, dvirs)
            const finalAlerts = liveAlerts.length ? liveAlerts : mockAlerts
            setAlerts(finalAlerts)
            localStorage.setItem('fc_cache_alerts', JSON.stringify(finalAlerts))

            const health = normalizeVehicleHealth(vehicles, locations, stats)
            const finalHealth = health.length ? health : mockVehicleHealth
            setVehicleHealth(finalHealth)
            localStorage.setItem('fc_cache_health', JSON.stringify(finalHealth))

            setIsLive(true)
        } catch (err) {
            console.warn('[FleetContext] Samsara fetch failed, falling back to mock data:', err.message)
            setError(err.message)
            setIsLive(false)
        } finally {
            setLoading(false)
        }
    }, [canAccessBackend])

    // Re-run when role changes (e.g. role switcher in header)
    useEffect(() => {
        clearInterval(pollRef.current)

        if (!canAccessBackend || user?.isDemo) {
            // Snap back to mock data instantly for driver role or demo mode
            setFleet(mockFleet)
            setAlerts(mockAlerts)
            setVehicleHealth(mockVehicleHealth)
            setDrivers([])
            setIsLive(false)
            return
        }

        fetchLive()
        if (hasSamsaraToken()) {
            pollRef.current = setInterval(fetchLive, POLL_INTERVAL)
        }
        return () => clearInterval(pollRef.current)
    }, [fetchLive, canAccessBackend])

    // Called from Settings after token save
    const refresh = useCallback(() => {
        if (!canAccessBackend) return
        clearInterval(pollRef.current)
        fetchLive().then(() => {
            if (hasSamsaraToken()) {
                pollRef.current = setInterval(fetchLive, POLL_INTERVAL)
            }
        })
    }, [fetchLive, canAccessBackend])

    return (
        <FleetContext.Provider value={{
            fleet,
            drivers,
            alerts,
            vehicleHealth,
            activity,
            loading,
            error,
            isLive,
            canAccessBackend,
            refresh,
        }}>
            {children}
        </FleetContext.Provider>
    )
}

export const useFleetData = () => {
    const ctx = useContext(FleetContext)
    if (!ctx) throw new Error('useFleetData must be used inside <FleetProvider>')
    return ctx
}

export default FleetContext
