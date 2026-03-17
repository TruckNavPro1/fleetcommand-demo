/**
 * TelematicsWrapper — Multi-ELD router
 * 
 * Routes FleetContext requests to the appropriate currently-selected API service.
 */
import * as Samsara from './samsaraService'
import * as Motive from './motiveService'

function getProvider() {
    return localStorage.getItem('eld_provider') || 'samsara'
}

function getService() {
    const provider = getProvider()
    if (provider === 'motive') return Motive
    return Samsara
}

export function hasToken() {
    return getService().hasToken()
}

export function getVehicles(...args) { return getService().getVehicles(...args) }
export function getVehicleLocations(...args) { return getService().getVehicleLocations(...args) }
export function getVehicleStats(...args) { return getService().getVehicleStats(...args) }
export function getDrivers(...args) { return getService().getDrivers(...args) }
export function getDriverDutyStatus(...args) { return getService().getDriverDutyStatus(...args) }
export function getSafetyEvents(...args) { return getService().getSafetyEvents(...args) }
export function getDVIRs(...args) { return getService().getDVIRs(...args) }
export function normalizeTruck(...args) { return getService().normalizeTruck(...args) }
export function normalizeDriver(...args) { return getService().normalizeDriver(...args) }
