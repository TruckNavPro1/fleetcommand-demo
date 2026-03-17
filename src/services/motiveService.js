/**
 * MotiveService (KeepTruckin) Stub
 * Placeholder for future integration with the Motive API.
 */

export function getToken() {
    return import.meta.env.VITE_MOTIVE_API_TOKEN || localStorage.getItem('eld_token') || ''
}

export function hasToken() {
    return Boolean(getToken())
}

export async function getVehicles() { return [] }
export async function getVehicleLocations() { return [] }
export async function getVehicleStats() { return [] }
export async function getDrivers() { return [] }
export async function getDriverDutyStatus() { return [] }
export async function getSafetyEvents() { return [] }
export async function getDVIRs() { return [] }

export function normalizeTruck(vehicle, location, stats, dutyClocks) {
    return {
        id: vehicle.id || 'unknown',
        driver: 'Unassigned',
        status: 'idle',
        route: 'En Route',
        progress: 50,
        fuel: 0,
        lat: 0,
        lng: 0,
        lastUpdate: 'Just now',
        motiveId: vehicle.id,
    }
}

export function normalizeDriver(driver, clock) {
    return {
        id: driver.id || 'unknown',
        name: driver.name || 'Driver',
        truck: 'Unassigned',
        status: 'offDuty',
        hosRemaining: '—',
        phone: '',
    }
}
