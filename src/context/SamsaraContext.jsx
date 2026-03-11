/**
 * SamsaraContext — Live Fleet Data Provider
 *
 * Fetches from Samsara API on mount and every 30s.
 * If VITE_SAMSARA_API_TOKEN is not set, falls back to mock data
 * so the dashboard always works during development/demos.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as Samsara from '../services/samsaraService'
import {
    mockFleet, mockWorkOrders, mockAlerts, mockActivity,
    mockLoads, vehicleHealth, fuelData, dispatchData, maintenanceData
} from '../data/mockData'

const SamsaraContext = createContext(null)

const IS_LIVE = !!import.meta.env.VITE_SAMSARA_API_TOKEN
const POLL_INTERVAL = 30_000 // 30 seconds

function makeAlertFromSafety(event) {
    return {
        id: event.id,
        type: event.behaviorLabels?.includes('crash') ? 'critical' : 'warning',
        msg: `${event.driver?.name ?? 'Unknown driver'} — ${event.behaviorLabels?.[0] ?? 'Safety event'}`,
        time: new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
}

function makeAlertFromDVIR(defect) {
    return {
        id: defect.id,
        type: defect.isResolved ? 'info' : 'warning',
        msg: `${defect.vehicle?.name ?? 'Unknown truck'} — ${defect.comment ?? 'Defect reported'}`,
        time: new Date(defect.createdAtTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
}

export function SamsaraProvider({ children }) {
    const [fleet, setFleet] = useState(mockFleet)
    const [alerts, setAlerts] = useState(mockAlerts)
    const [activity, setActivity] = useState(mockActivity)
    const [loads, setLoads] = useState(mockLoads)
    const [workOrders, setWorkOrders] = useState(mockWorkOrders)
    const [health, setHealth] = useState(vehicleHealth)
    const [isLive, setIsLive] = useState(false)
    const [lastSync, setLastSync] = useState(null)
    const [error, setError] = useState(null)

    const fetchAll = useCallback(async () => {
        if (!IS_LIVE) return

        try {
            // Parallel fetch all data
            const [vehicles, locations, statsRaw, dutyClocksRaw, safetyRaw, dvirRaw] = await Promise.all([
                Samsara.getVehicles(),
                Samsara.getVehicleLocations(),
                Samsara.getVehicleStats(),
                Samsara.getDriverDutyStatus(),
                Samsara.getSafetyEvents(),
                Samsara.getDVIRs(),
            ])

            // Build location + stats lookup maps
            const locMap = Object.fromEntries(locations.map(l => [l.id, l]))
            const statsMap = Object.fromEntries(statsRaw.map(s => [s.id, s]))

            // Normalize fleet
            const liveFleet = vehicles.map(v =>
                Samsara.normalizeTruck(v, locMap[v.id], statsMap[v.id], dutyClocksRaw)
            )
            setFleet(liveFleet.length ? liveFleet : mockFleet)

            // Build alerts from safety events + defects
            const liveAlerts = [
                ...safetyRaw.slice(0, 5).map(makeAlertFromSafety),
                ...dvirRaw.filter(d => !d.isResolved).slice(0, 3).map(makeAlertFromDVIR),
            ]
            setAlerts(liveAlerts.length ? liveAlerts : mockAlerts)

            // Vehicle health from stats
            const liveHealth = vehicles.map(v => {
                const s = statsMap[v.id]
                const fuelPct = s?.fuelPercents?.[0]?.value ?? 100
                const engine = s?.engineStates?.[0]?.value ?? 'Off'
                return {
                    id: v.name || v.id,
                    health: Math.round(fuelPct),
                    engine: engine === 'On' ? 'Good' : 'Off',
                    brakes: 'Unknown',
                    tires: 'Unknown',
                    oil: fuelPct < 20 ? 'Low' : 'Good',
                }
            })
            if (liveHealth.length) setHealth(liveHealth)

            setIsLive(true)
            setError(null)
            setLastSync(new Date())
        } catch (err) {
            setError(err.message)
            // Keep showing mock data if live fetch fails
        }
    }, [])

    useEffect(() => {
        fetchAll()
        if (!IS_LIVE) return
        const interval = setInterval(fetchAll, POLL_INTERVAL)
        return () => clearInterval(interval)
    }, [fetchAll])

    return (
        <SamsaraContext.Provider value={{
            fleet, alerts, activity, loads, workOrders, health,
            fuelData, dispatchData, maintenanceData,
            isLive, lastSync, error, refetch: fetchAll,
        }}>
            {children}
        </SamsaraContext.Provider>
    )
}

export const useFleet = () => useContext(SamsaraContext)
