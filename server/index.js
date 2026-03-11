/**
 * FleetCommand — Samsara Webhook Receiver
 * =========================================
 * Run this server to receive real-time event-driven
 * notifications from Samsara's webhook system.
 *
 * Setup:
 *   1. cd server && npm install
 *   2. node index.js  (runs on port 3001)
 *   3. Point Samsara Dashboard → Settings → Webhooks to:
 *      https://your-domain.com/webhook/samsara  (or use ngrok for local dev)
 *
 * Samsara Webhook Docs:
 *   https://developers.samsara.com/docs/webhooks
 */

require('dotenv').config({ path: '../.env' })
const express = require('express')
const cors = require('cors')
const tg = require('./telegram')

const app = express()
const PORT = process.env.WEBHOOK_PORT || 3001

// In-memory event store (replace with DB in production)
const eventLog = []
const MAX_EVENTS = 200

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Logging middleware ────────────────────────────────────────────
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    next()
})

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', events: eventLog.length, ts: new Date().toISOString() })
})

// ── Samsara Webhook Endpoint ─────────────────────────────────────
/**
 * Samsara sends POST requests here for every subscribed event type.
 * Event types we handle:
 *   - VehicleLocation        → update fleet map
 *   - EngineOn / EngineOff   → update truck status
 *   - HosSummaryDailyLogs    → driver HOS alerts
 *   - VehicleFuelPercent     → fuel level alerts
 *   - DefectCreated          → maintenance alerts
 *   - DriverDutyStatusChange → driver status
 *   - SevereSpeedingDetected → safety alerts
 */
app.post('/webhook/samsara', (req, res) => {
    // Samsara requires a 200 response within 5s
    res.status(200).json({ received: true })

    const payload = req.body
    if (!payload) return

    const events = Array.isArray(payload) ? payload : [payload]

    events.forEach(event => {
        const normalized = {
            id: event.id || `${Date.now()}`,
            type: event.eventType || 'unknown',
            ts: event.eventMs ? new Date(event.eventMs).toISOString() : new Date().toISOString(),
            vehicleId: event.vehicleId || event.vehicle?.id,
            driverId: event.driverId || event.driver?.id,
            raw: event,
        }

        // Route to specialized handlers
        switch (event.eventType) {
            case 'VehicleLocation':
                handleLocation(normalized)
                break
            case 'EngineOn':
            case 'EngineOff':
                handleEngineState(normalized)
                break
            case 'VehicleFuelPercent':
                handleFuel(normalized)
                break
            case 'DefectCreated':
                handleDefect(normalized)
                break
            case 'SevereSpeedingDetected':
            case 'ForwardCollisionWarning':
            case 'HarshBrake':
                handleSafety(normalized)
                break
            case 'DriverDutyStatusChange':
                handleDutyStatus(normalized)
                break
            default:
                // Store unknown events for inspection
                break
        }

        // Keep rolling event log
        eventLog.unshift(normalized)
        if (eventLog.length > MAX_EVENTS) eventLog.pop()

        console.log(`[WEBHOOK] ${normalized.type} — vehicle:${normalized.vehicleId || '—'} driver:${normalized.driverId || '—'}`)
    })
})

// ── Event Handlers ────────────────────────────────────────────────
function handleLocation(event) {
    const loc = event.raw.location
    if (loc) {
        console.log(`📍 ${event.vehicleId}: ${loc.latitude?.toFixed(4)}, ${loc.longitude?.toFixed(4)}`)
    }
}

function handleEngineState(event) {
    const state = event.type === 'EngineOn' ? '🟢 ON' : '🔴 OFF'
    console.log(`🚛 Engine ${state} — Vehicle ${event.vehicleId}`)
}

function handleFuel(event) {
    const pct = event.raw.fuelPercent ?? '?'
    console.log(`⛽ Fuel: ${pct}% — Vehicle ${event.vehicleId}`)
    if (pct < 20) {
        console.warn(`⚠️  LOW FUEL ALERT: ${event.vehicleId} at ${pct}%`)
        tg.alertLowFuel(event.vehicleId, pct)
    }
}

function handleDefect(event) {
    const comment = event.raw.comment ?? 'Defect reported'
    console.warn(`🔧 DEFECT: ${event.vehicleId} — ${comment}`)
    tg.alertDefect(event.vehicleId, comment)
}

function handleSafety(event) {
    console.warn(`⚠️  SAFETY EVENT: ${event.type} — Driver ${event.driverId} Vehicle ${event.vehicleId}`)
    tg.alertSafety(event.vehicleId, event.type)
}

function handleDutyStatus(event) {
    const status = event.raw.dutyStatus ?? 'unknown'
    console.log(`👤 Driver ${event.driverId} changed to: ${status}`)
    // Alert if driver goes off-duty unexpectedly
    if (status === 'OFF_DUTY') {
        tg.sendMessage(tg.CHAT_IDS.office, `👤 Driver \`${event.driverId}\` is now OFF DUTY`)
    }
}

// ── API: Retrieve recent events (for dashboard polling) ──────────
app.get('/events', (req, res) => {
    const limit = parseInt(req.query.limit) || 50
    const type = req.query.type
    const filtered = type ? eventLog.filter(e => e.type === type) : eventLog
    res.json({ count: filtered.length, events: filtered.slice(0, limit) })
})

// ── Telegram Webhook (two-way bot) ──────────────────────────────
/**
 * Configure in Telegram:
 *   POST https://api.telegram.org/bot<TOKEN>/setWebhook
 *   {"url": "https://your-domain.com/telegram/webhook"}
 */
app.post('/telegram/webhook', (req, res) => {
    res.status(200).json({ ok: true })
    tg.handleTelegramUpdate(req.body)
})

// ── API: Route optimization placeholder ──────────────────────────
/**
 * In production: integrate with Google Maps Routes API or
 * Samsara's own routing suggestions via the Vehicles API.
 */
app.post('/optimize-route', (req, res) => {
    const { vehicleId, stops } = req.body
    // TODO: Call routing API with live traffic + HOS constraints
    res.json({
        vehicleId,
        optimized: stops,
        estimatedSavings: '12%',
        message: 'Route optimization pending live routing API integration.',
    })
})

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚛 FleetCommand Webhook Server running on port ${PORT}`)
    console.log(`   Webhook URL:  POST http://localhost:${PORT}/webhook/samsara`)
    console.log(`   Events feed:  GET  http://localhost:${PORT}/events`)
    console.log(`   Health:       GET  http://localhost:${PORT}/health`)
    console.log(`\n   To expose publicly for Samsara webhooks, run:`)
    console.log(`   npx -y ngrok http ${PORT}\n`)
})
