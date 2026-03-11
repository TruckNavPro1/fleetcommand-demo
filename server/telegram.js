/**
 * Telegram Bot Notification Service
 * Uses the Telegram Bot API (no external library needed — pure fetch)
 *
 * Setup:
 *  1. Create a bot via @BotFather on Telegram → get TELEGRAM_BOT_TOKEN
 *  2. Each user starts a chat with the bot, then gets their Chat ID via /start
 *  3. Add TELEGRAM_BOT_TOKEN to server/.env or root .env
 *  4. Staff enter their Chat ID in Settings → Telegram
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`

// Role-specific default chat IDs from env (for fleet-wide broadcasts)
const CHAT_IDS = {
    office: process.env.TELEGRAM_CHAT_OFFICE || '',
    driver: process.env.TELEGRAM_CHAT_DRIVER || '',
    mechanic: process.env.TELEGRAM_CHAT_MECHANIC || '',
    // Comma-separated list for broadcast to all
    all: process.env.TELEGRAM_CHAT_ALL || '',
}

/**
 * Send a text message to one or more Telegram chat IDs
 * @param {string|string[]} chatIds - single ID or array
 * @param {string} text - message text (Markdown supported)
 * @param {string} [parseMode='Markdown'] - 'Markdown' | 'HTML'
 */
async function sendMessage(chatIds, text, parseMode = 'Markdown') {
    if (!BOT_TOKEN) {
        console.warn('[Telegram] No BOT_TOKEN set — skipping notification.')
        return
    }

    const ids = Array.isArray(chatIds) ? chatIds : [chatIds]
    const filtered = ids.filter(Boolean)
    if (!filtered.length) return

    await Promise.allSettled(
        filtered.map(chat_id =>
            fetch(`${BASE_URL}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id, text, parse_mode: parseMode }),
            })
                .then(r => r.json())
                .then(data => {
                    if (!data.ok) console.warn(`[Telegram] Error to ${chat_id}:`, data.description)
                    else console.log(`[Telegram] ✅ Sent to ${chat_id}`)
                })
                .catch(err => console.error(`[Telegram] Fetch error:`, err.message))
        )
    )
}

/**
 * Broadcast to all configured fleet channels
 */
function broadcast(text) {
    const allIds = CHAT_IDS.all
        ? CHAT_IDS.all.split(',').map(s => s.trim())
        : [CHAT_IDS.office, CHAT_IDS.driver, CHAT_IDS.mechanic].filter(Boolean)
    return sendMessage(allIds, text)
}

// ── Pre-built fleet alert messages ─────────────────────────────────────────

function alertNewLoad(load) {
    return sendMessage(CHAT_IDS.driver,
        `🚛 *New Load Assignment*\n\n` +
        `📦 Load: \`${load.id || 'N/A'}\`\n` +
        `📍 ${load.origin || '?'} → ${load.destination || '?'}\n` +
        `⚖️ ${load.weight || '?'} lbs · ${load.miles || '?'} mi\n` +
        `📅 Pickup: ${load.pickup || 'TBD'}\n\n` +
        `_Open FleetCommand for details._`
    )
}

function alertLowFuel(truck, fuelPct) {
    return sendMessage([CHAT_IDS.driver, CHAT_IDS.office].filter(Boolean),
        `⛽ *Low Fuel Warning*\n\n` +
        `🚛 ${truck} is at *${fuelPct}% fuel*\n` +
        `Plan a fuel stop soon.`
    )
}

function alertMaintenance(truck, issue) {
    return sendMessage([CHAT_IDS.mechanic, CHAT_IDS.office].filter(Boolean),
        `🔧 *Maintenance Alert*\n\n` +
        `🚛 ${truck}\n` +
        `⚠️ ${issue}\n\n` +
        `_Check the Mechanic Dashboard for work order details._`
    )
}

function alertHOS(driverName, hoursRemaining) {
    return sendMessage(CHAT_IDS.driver,
        `⏰ *HOS Warning*\n\n` +
        `👤 ${driverName}\n` +
        `🕐 *${hoursRemaining}h* remaining on drive time\n\n` +
        `Plan your rest stop.`
    )
}

function alertSafety(truck, event) {
    return sendMessage(CHAT_IDS.office,
        `🚨 *Safety Event*\n\n` +
        `🚛 ${truck}\n` +
        `⚠️ ${event}\n\n` +
        `_Review in FleetCommand → Compliance._`
    )
}

function alertDefect(truck, defect) {
    return sendMessage([CHAT_IDS.mechanic, CHAT_IDS.office].filter(Boolean),
        `🔩 *Defect Reported*\n\n` +
        `🚛 ${truck}\n` +
        `📋 ${defect}\n\n` +
        `_Inspect vehicle before next dispatch._`
    )
}

/**
 * Handle incoming Telegram webhook updates (optional — for two-way bot)
 * Route: POST /telegram/webhook
 */
function handleTelegramUpdate(update) {
    const msg = update?.message
    if (!msg) return

    const chatId = msg.chat?.id
    const text = msg.text?.trim() || ''

    console.log(`[Telegram] Incoming from ${chatId}: ${text}`)

    if (text === '/start') {
        sendMessage(chatId,
            `👋 Welcome to *FleetCommand Bot*!\n\n` +
            `Your Chat ID is: \`${chatId}\`\n\n` +
            `Enter this in *Settings → Telegram* to receive fleet notifications.`
        )
    } else if (text === '/status') {
        sendMessage(chatId, `✅ FleetCommand is running and connected.`)
    } else if (text === '/help') {
        sendMessage(chatId,
            `*FleetCommand Bot Commands*\n\n` +
            `/start — Get your Chat ID\n` +
            `/status — Check connection\n` +
            `/help — Show this menu`
        )
    }
}

module.exports = {
    sendMessage,
    broadcast,
    alertNewLoad,
    alertLowFuel,
    alertMaintenance,
    alertHOS,
    alertSafety,
    alertDefect,
    handleTelegramUpdate,
    CHAT_IDS,
}
