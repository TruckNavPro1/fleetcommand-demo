/**
 * SamsaraService — FleetCommand Integration Layer
 * Docs: https://developers.samsara.com/reference
 *
 * Uses the Samsara REST API v1 (openapi-compliant).
 * Token priority: VITE_SAMSARA_API_TOKEN env var → localStorage('samsara_token')
 * This allows in-app token entry via Settings without restarting the dev server.
 */

const BASE_URL = 'https://api.samsara.com'

// ── Token resolution: .env first, localStorage as fallback ───────
export function getToken() {
    return import.meta.env.VITE_SAMSARA_API_TOKEN || localStorage.getItem('samsara_token') || ''
}

export function hasSamsaraToken() {
    return Boolean(getToken())
}

// ── Core request helper ──────────────────────────────────────────
async function get(path, params = {}) {
    const token = getToken()
    if (!token) throw new Error('No Samsara API token configured.')
    const url = new URL(`${BASE_URL}${path}`)
    Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v))

    // Add 6-second timeout to prevent the app from hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    try {
        const res = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err?.message || `Samsara API error ${res.status}: ${path}`)
        }
        return res.json()
    } catch (err) {
        clearTimeout(timeoutId)
        if (err.name === 'AbortError') {
            throw new Error(`Connection to Samsara timed out. Resuming with offline cache.`)
        }
        throw err
    }
}

// ── Vehicles ─────────────────────────────────────────────────────

/** List all vehicles with basic info */
export async function getVehicles() {
    const data = await get('/fleet/vehicles')
    return data.data ?? []
}

/** Real-time GPS locations for all vehicles */
export async function getVehicleLocations() {
    const data = await get('/fleet/vehicles/locations')
    return data.data ?? []
}

/**
 * Live stats: fuel %, engine hours, odometer.
 * types: 'fuelPercents' | 'engineStates' | 'obdOdometerMeters'
 */
export async function getVehicleStats(types = ['fuelPercents', 'engineStates', 'obdOdometerMeters']) {
    const data = await get('/fleet/vehicles/stats', { types: types.join(',') })
    return data.data ?? []
}

/** Upcoming & overdue maintenance for a vehicle */
export async function getVehicleMaintenance(vehicleId) {
    const data = await get(`/fleet/vehicles/${vehicleId}/imminent-maintenances`)
    return data.data ?? []
}

// ── Drivers ──────────────────────────────────────────────────────

/** List all drivers */
export async function getDrivers() {
    const data = await get('/fleet/drivers')
    return data.data ?? []
}

/**
 * Hours of Service daily logs for a driver.
 * driverIds: comma-separated string of driver IDs
 * startTime / endTime: ISO-8601 strings
 */
export async function getDriverHOS({ driverIds, startTime, endTime }) {
    const now = new Date()
    const start = startTime || new Date(now - 7 * 86400000).toISOString()
    const end = endTime || now.toISOString()
    const data = await get('/fleet/hos/daily-logs', {
        driverIds,
        startTime: start,
        endTime: end,
    })
    return data.data ?? []
}

/** Current duty status for all drivers */
export async function getDriverDutyStatus() {
    const data = await get('/fleet/hos/clocks')
    return data.data ?? []
}

// ── Trips & Routes ────────────────────────────────────────────────

/** Recent trips for a vehicle */
export async function getVehicleTrips(vehicleId, { startTime, endTime } = {}) {
    const now = new Date()
    const data = await get('/fleet/trips', {
        vehicleId,
        startTime: startTime || new Date(now - 86400000).toISOString(),
        endTime: endTime || now.toISOString(),
    })
    return data.data ?? []
}

// ── Alerts & Defects ─────────────────────────────────────────────

/** Vehicle defect reports (DVIR) */
export async function getDVIRs(params = {}) {
    const data = await get('/fleet/defects', params)
    return data.data ?? []
}

// ── Safety ────────────────────────────────────────────────────────

/** Safety events (harsh braking, speeding, etc.) for all vehicles */
export async function getSafetyEvents({ startTime, endTime } = {}) {
    const now = new Date()
    const data = await get('/fleet/safety/events', {
        startTime: startTime || new Date(now - 86400000).toISOString(),
        endTime: endTime || now.toISOString(),
    })
    return data.data ?? []
}

// ── Normalizers: shape Samsara data to match our app's MockData schema ──

/** Convert Samsara vehicle list → FleetCommand truck format */
export function normalizeTruck(vehicle, location, stats, dutyClocks) {
    const loc = location?.location ?? {}
    const fuelStat = stats?.fuelPercents?.[0]
    const engineStat = stats?.engineStates?.[0]
    const clock = dutyClocks?.find(c => c.driver?.vehicleId === vehicle.id)

    const engineOn = engineStat?.value === 'On'
    const driverName = vehicle.driver?.name ?? 'Unassigned'

    let status = 'idle'
    if (vehicle.staticAssignedDriver && engineOn) status = 'active'
    else if (!engineOn && driverName !== 'Unassigned') status = 'rest'

    return {
        id: vehicle.name || vehicle.id,
        driver: driverName,
        status,
        route: `${loc.reverseGeo?.formattedLocation ?? 'En Route'}`,
        progress: 50, // Progress not directly available; use trip data for this
        fuel: Math.round(fuelStat?.value ?? 0),
        lat: loc.latitude ?? 0,
        lng: loc.longitude ?? 0,
        lastUpdate: `${Math.round((Date.now() - new Date(loc.time ?? Date.now())) / 60000)}m ago`,
        samsaraId: vehicle.id,
    }
}

/** Convert Samsara driver + HOS clock → FleetCommand driver format */
export function normalizeDriver(driver, clock) {
    return {
        id: driver.id,
        name: driver.name,
        truck: driver.vehicle?.id ?? 'Unassigned',
        status: clock?.currentDutyStatus ?? 'offDuty',
        hosRemaining: clock?.hoursUntilBreak?.toFixed(1) ?? '—',
        phone: driver.phone ?? '',
    }
}
