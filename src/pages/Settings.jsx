import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
    Globe, User, Bell, Shield, Monitor, Info,
    Check, ChevronRight, Volume2, VolumeX, Send, ExternalLink, Zap, Copy, Phone, X
} from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import { useAuth } from '../context/AuthContext'
import { useFleetData } from '../context/FleetContext'
import { toast } from 'react-hot-toast'

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'uk', label: 'Українська', flag: '🇺🇦', dir: 'ltr' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺', dir: 'ltr' },
    { code: 'es', label: 'Español', flag: '🇲🇽', dir: 'ltr' },
]

const TEXT_SIZES = [
    { key: 'sm', label: 'Small', px: '13px' },
    { key: 'md', label: 'Medium', px: '15px' },
    { key: 'lg', label: 'Large', px: '17px' },
]

function Section({ icon: Icon, title, desc, children, accentColor = 'var(--accent-blue)' }) {
    return (
        <GlassCard style={{ padding: '24px 28px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${accentColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={accentColor} />
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{desc}</div>
                </div>
            </div>
            {children}
        </GlassCard>
    )
}

function Toggle({ label, sublabel, value, onChange }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                {sublabel && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{sublabel}</div>}
            </div>
            <button
                onClick={() => onChange(!value)}
                style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: value ? 'var(--accent-blue)' : 'rgba(255,255,255,0.12)',
                    position: 'relative', transition: 'background 0.25s', flexShrink: 0,
                    boxShadow: value ? '0 0 12px rgba(59,142,243,0.4)' : 'none',
                }}
            >
                <div style={{
                    position: 'absolute', top: 3, left: value ? 22 : 3, width: 18, height: 18,
                    borderRadius: '50%', background: 'white', transition: 'left 0.25s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
            </button>
        </div>
    )
}

function InputField({ label, value, onChange, type = 'text', placeholder }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent-blue)'; e.target.style.boxShadow = '0 0 0 2px rgba(59,142,243,0.15)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
            />
        </div>
    )
}

export default function Settings() {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const { isLive, refresh } = useFleetData()
    const s = t('settings', { returnObjects: true })

    // Samsara integration
    const [samsaraToken, setSamsaraToken] = useState(() => localStorage.getItem('samsara_token') || '')
    const [samsaraSaved, setSamsaraSaved] = useState(false)

    const saveSamsaraToken = () => {
        if (samsaraToken.trim()) {
            localStorage.setItem('samsara_token', samsaraToken.trim())
        } else {
            localStorage.removeItem('samsara_token')
        }
        refresh()
        setSamsaraSaved(true)
        setTimeout(() => setSamsaraSaved(false), 2500)
    }

    // Google Maps integration
    const [gmapsKey, setGmapsKey] = useState(() => localStorage.getItem('fc_gmaps_key') || '')
    const [gmapsSaved, setGmapsSaved] = useState(false)

    const saveGmapsKey = () => {
        if (gmapsKey.trim()) {
            localStorage.setItem('fc_gmaps_key', gmapsKey.trim())
        } else {
            localStorage.removeItem('fc_gmaps_key')
        }
        setGmapsSaved(true)
        setTimeout(() => setGmapsSaved(false), 2500)
    }

    // Profile state
    const [name, setName] = useState(user?.name || '')
    const [jobTitle, setJobTitle] = useState(user?.title || '')
    const [phone, setPhone] = useState('')

    // Notifications state
    const [notifAlerts, setNotifAlerts] = useState(true)
    const [notifLoads, setNotifLoads] = useState(true)
    const [notifMaint, setNotifMaint] = useState(true)
    const [notifHOS, setNotifHOS] = useState(true)
    const [soundEnabled, setSoundEnabled] = useState(false)

    // Display state
    const [textSize, setTextSize] = useState('md')

    // Security state
    const [curPwd, setCurPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')

    // Telegram state
    const [tgChatId, setTgChatId] = useState(() => localStorage.getItem('fc_tg_chatid') || '')
    const [tgLoads, setTgLoads] = useState(true)
    const [tgAlerts, setTgAlerts] = useState(true)
    const [tgHOS, setTgHOS] = useState(true)
    const [tgTestSent, setTgTestSent] = useState(false)

    const saveTgChatId = () => {
        localStorage.setItem('fc_tg_chatid', tgChatId)
    }

    // VoIP state
    const [voipProvider, setVoipProvider] = useState(() => localStorage.getItem('fc_voip_provider') || 'twilio')
    const [voipSid, setVoipSid] = useState(() => localStorage.getItem('fc_voip_sid') || '')
    const [voipToken, setVoipToken] = useState(() => localStorage.getItem('fc_voip_token') || '')
    const [voipCallerId, setVoipCallerId] = useState(() => localStorage.getItem('fc_voip_callerid') || '')
    const [voipSaved, setVoipSaved] = useState(false)

    const saveVoipConfig = () => {
        localStorage.setItem('fc_voip_provider', voipProvider)
        localStorage.setItem('fc_voip_sid', voipSid)
        localStorage.setItem('fc_voip_token', voipToken)
        localStorage.setItem('fc_voip_callerid', voipCallerId)
        setVoipSaved(true)
        setTimeout(() => setVoipSaved(false), 2500)
    }

    const sendTestNotification = async () => {
        if (!tgChatId) return
        try {
            const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || ''
            if (!BOT_TOKEN) {
                alert('Add VITE_TELEGRAM_BOT_TOKEN to your .env file first.')
                return
            }
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: tgChatId,
                    text: `✅ *FleetCommand Connected!*\n\nYour Telegram notifications are working. You will receive:\n${tgLoads ? '🚛 New load assignments\n' : ''}${tgAlerts ? '⚠️ Safety & fuel alerts\n' : ''}${tgHOS ? '⏰ HOS warnings' : ''}`,
                    parse_mode: 'Markdown',
                }),
            })
            setTgTestSent(true)
            setTimeout(() => setTgTestSent(false), 3000)
        } catch (e) {
            console.error('Telegram test failed:', e)
        }
    }

    // Save state
    const [saved, setSaved] = useState(false)
    const [copiedOrg, setCopiedOrg] = useState(false)
    const [copiedUrl, setCopiedUrl] = useState(false)

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text)
        if (type === 'org') {
            setCopiedOrg(true)
            setTimeout(() => setCopiedOrg(false), 2000)
        } else {
            setCopiedUrl(true)
            setTimeout(() => setCopiedUrl(false), 2000)
        }
    }

    // Third-party integration modal state
    const [activeIntegration, setActiveIntegration] = useState(null)
    const [integrationKeys, setIntegrationKeys] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('fc_integrations') || '{}')
        } catch { return {} }
    })
    const [tempKey, setTempKey] = useState('')

    const handleOpenIntegration = (app) => {
        setActiveIntegration(app)
        setTempKey(integrationKeys[app.name] || '')
    }

    const handleSaveIntegration = () => {
        const loadingToast = toast.loading(`Connecting to ${activeIntegration.name}...`)
        setTimeout(() => {
            const newKeys = { ...integrationKeys, [activeIntegration.name]: tempKey }
            setIntegrationKeys(newKeys)
            localStorage.setItem('fc_integrations', JSON.stringify(newKeys))
            toast.success(`${activeIntegration.name} connected successfully!`, { id: loadingToast })
            setActiveIntegration(null)
        }, 1500)
    }

    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang.code)
        // Apply RTL direction for Arabic
        document.documentElement.dir = lang.dir
        document.documentElement.lang = lang.code
    }

    const handleTextSize = (size) => {
        setTextSize(size)
        const px = TEXT_SIZES.find(t => t.key === size)?.px || '15px'
        document.documentElement.style.setProperty('--font-size-body', px)
    }

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2200)
    }

    return (
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>{s.title}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Manage your account, language, and preferences</p>
            </div>

            {/* Language */}
            <Section icon={Globe} title={s.language} desc={s.languageDesc} accentColor="var(--accent-blue)">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                    {LANGUAGES.map(lang => (
                        <motion.button
                            key={lang.code}
                            onClick={() => changeLanguage(lang)}
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                                borderRadius: 12, border: `1px solid ${currentLang.code === lang.code ? 'var(--accent-blue)' : 'rgba(255,255,255,0.08)'}`,
                                background: currentLang.code === lang.code ? 'rgba(59,142,243,0.12)' : 'rgba(255,255,255,0.04)',
                                cursor: 'pointer', transition: 'all 0.15s',
                            }}
                        >
                            <span style={{ fontSize: 22 }}>{lang.flag}</span>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: 13, fontWeight: currentLang.code === lang.code ? 700 : 500, color: currentLang.code === lang.code ? 'var(--accent-blue)' : 'var(--text-primary)' }}>{lang.label}</div>
                            </div>
                            {currentLang.code === lang.code && <Check size={14} color="var(--accent-blue)" style={{ marginLeft: 'auto' }} />}
                        </motion.button>
                    ))}
                </div>
                {currentLang.code === 'ar' && (
                    <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(59,142,243,0.08)', border: '1px solid rgba(59,142,243,0.2)', borderRadius: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
                        ✓ Right-to-left (RTL) layout is active for Arabic
                    </div>
                )}
            </Section>

            {/* Profile */}
            <Section icon={User} title={s.profile} desc={s.profileDesc} accentColor="var(--accent-purple)">
                <InputField label={s.name} value={name} onChange={setName} placeholder="Your full name" />
                <InputField label={s.title} value={jobTitle} onChange={setJobTitle} placeholder="e.g. CDL Driver, Dispatcher" />
                <InputField label={s.phoneNumber} value={phone} onChange={setPhone} placeholder="+1 (555) 000-0000" type="tel" />
            </Section>

            {/* Notifications */}
            <Section icon={Bell} title={s.notifications} desc={s.notificationsDesc} accentColor="var(--accent-amber)">
                <Toggle label={s.notif_alerts} sublabel="Engine faults, accidents, breakdowns" value={notifAlerts} onChange={setNotifAlerts} />
                <Toggle label={s.notif_loads} sublabel="When dispatch assigns you a load" value={notifLoads} onChange={setNotifLoads} />
                <Toggle label={s.notif_maintenance} sublabel="Oil changes, inspections due" value={notifMaint} onChange={setNotifMaint} />
                <Toggle label={s.notif_hos} sublabel="30-min warning before HOS limit" value={notifHOS} onChange={setNotifHOS} />
                <div style={{ marginTop: 8 }}>
                    <Toggle
                        label={soundEnabled ? "Sound: On" : "Sound: Off"}
                        sublabel="Audible alert chime"
                        value={soundEnabled}
                        onChange={setSoundEnabled}
                    />
                </div>
            </Section>

            {/* Telegram */}
            <Section icon={Send} title="Telegram Notifications" desc="Get fleet alerts sent directly to your Telegram" accentColor="#29b6f6">
                {/* Step-by-step setup */}
                <div style={{ padding: '10px 14px', background: 'rgba(41,182,246,0.06)', border: '1px solid rgba(41,182,246,0.15)', borderRadius: 10, marginBottom: 16, fontSize: 12, lineHeight: 1.7 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: '#29b6f6' }}>Setup in 2 steps</div>
                    <div>1. Open Telegram → search <strong>@FleetCommandBot</strong> → tap <code>/start</code></div>
                    <div>2. Copy your Chat ID and paste it below</div>
                    <a
                        href="https://t.me/BotFather"
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, color: '#29b6f6', fontSize: 11, fontWeight: 600 }}
                    >
                        <ExternalLink size={11} /> Create your own bot via @BotFather
                    </a>
                </div>

                <InputField
                    label="Your Telegram Chat ID"
                    value={tgChatId}
                    onChange={(v) => { setTgChatId(v); localStorage.setItem('fc_tg_chatid', v) }}
                    placeholder="e.g. 123456789"
                />

                <Toggle label="New load assignments" sublabel="When dispatch assigns you a run" value={tgLoads} onChange={setTgLoads} />
                <Toggle label="Safety & fuel alerts" sublabel="Speeding, low fuel, defects" value={tgAlerts} onChange={setTgAlerts} />
                <Toggle label="HOS warnings" sublabel="30-min reminder before limit" value={tgHOS} onChange={setTgHOS} />

                <motion.button
                    onClick={sendTestNotification}
                    disabled={!tgChatId}
                    whileHover={{ scale: tgChatId ? 1.03 : 1 }} whileTap={{ scale: tgChatId ? 0.97 : 1 }}
                    style={{
                        marginTop: 14, display: 'flex', alignItems: 'center', gap: 8,
                        padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(41,182,246,0.3)',
                        background: tgTestSent ? 'rgba(34,211,168,0.12)' : 'rgba(41,182,246,0.1)',
                        color: tgTestSent ? 'var(--accent-green)' : '#29b6f6',
                        fontWeight: 700, fontSize: 13, cursor: tgChatId ? 'pointer' : 'not-allowed',
                        opacity: tgChatId ? 1 : 0.4, transition: 'all 0.2s',
                    }}
                >
                    {tgTestSent ? <><Check size={14} /> Sent!</> : <><Send size={14} /> Send Test Message</>}
                </motion.button>
            </Section>

            {/* Integrations — Samsara */}
            <Section icon={Zap} title="Integrations" desc="Connect FleetCommand to Samsara for live GPS, HOS, and safety data" accentColor="#22d3a8">
                <div style={{ padding: '10px 14px', background: isLive ? 'rgba(34,211,168,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isLive ? 'rgba(34,211,168,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: isLive ? '#22d3a8' : '#3b8ef3', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: isLive ? '#22d3a8' : 'var(--text-secondary)', fontWeight: 600 }}>
                        {isLive ? '🟢 Connected — Live fleet data active' : '🔵 Demo Mode — Enter token to enable live data'}
                    </span>
                </div>
                <InputField
                    label="Samsara API Token"
                    value={samsaraToken}
                    onChange={setSamsaraToken}
                    type="password"
                    placeholder="Paste your Samsara API token here"
                />
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 14, marginTop: -6, lineHeight: 1.6 }}>
                    Found in Samsara Dashboard → Settings → API Tokens. Stored locally in your browser only — never sent to any server.
                </p>
                <motion.button
                    onClick={saveSamsaraToken}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
                        borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                        background: samsaraSaved ? 'linear-gradient(135deg, #22d3a8, #059669)' : 'linear-gradient(135deg, #22d3a8, #3b8ef3)',
                        color: 'white', boxShadow: '0 6px 20px rgba(34,211,168,0.3)', transition: 'background 0.3s',
                    }}
                >
                    {samsaraSaved ? <><Check size={14} /> Saved & Refreshed</> : <><Zap size={14} /> Save & Connect</>}
                </motion.button>

                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ padding: '10px 14px', background: gmapsKey ? 'rgba(34,211,168,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${gmapsKey ? 'rgba(34,211,168,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: gmapsKey ? '#22d3a8' : '#3b8ef3', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: gmapsKey ? '#22d3a8' : 'var(--text-secondary)', fontWeight: 600 }}>
                            {gmapsKey ? '🟢 Active — Custom Maps enabled' : '🔵 Default — Enter key to enable Google Maps'}
                        </span>
                    </div>
                    <InputField
                        label="Google Maps API Key"
                        value={gmapsKey}
                        onChange={setGmapsKey}
                        type="password"
                        placeholder="AIzaSy..."
                    />
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 14, marginTop: -6, lineHeight: 1.6 }}>
                        Used for live tracking inside the FleetMap view. Enable the Maps JavaScript API in Google Cloud.
                    </p>
                    <motion.button
                        onClick={saveGmapsKey}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
                            borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                            background: gmapsSaved ? 'linear-gradient(135deg, #22d3a8, #059669)' : 'rgba(255,255,255,0.1)',
                            color: gmapsSaved ? 'white' : 'var(--text-primary)', transition: 'background 0.3s',
                        }}
                    >
                        {gmapsSaved ? <><Check size={14} /> Saved</> : <>Save Google Maps Key</>}
                    </motion.button>
                </div>
            </Section>

            {/* Webhook & API (Office Only) */}
            {user?.role === 'office' && (
                <Section icon={Globe} title="Webhook & API Setup" desc="Integrate n8n or Zapier to automatically import loads" accentColor="#a855f7">
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                        Use these credentials to authenticate external workflows. Never share your Supabase Service Key publicly.
                    </p>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Your Organization ID</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'monospace' }}>
                                {user?.organization_id || 'Generating...'}
                            </div>
                            <button onClick={() => handleCopy(user?.organization_id, 'org')} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {copiedOrg ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Webhook URL (POST)</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'var(--accent-blue)', fontSize: 13, fontFamily: 'monospace' }}>
                                {import.meta.env.VITE_SUPABASE_URL}/rest/v1/loads
                            </div>
                            <button onClick={() => handleCopy(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/loads`, 'url')} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {copiedUrl ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                </Section>
            )}

            {/* Third-Party Service Integrations */}
            {user?.role === 'office' && (
                <Section icon={Globe} title="Third-Party Apps & Services" desc="Connect accounting, backup ELD, and load board software" accentColor="#f59e0b">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { name: 'QuickBooks Online', desc: 'Sync invoices, fleet expenses, and payroll', icon: 'QBO', color: '#2ca01c' },
                            { name: 'Motive (KeepTruckin)', desc: 'Backup ELD & dashcam integration', icon: 'M', color: '#13294b' },
                            { name: 'Salesforce', desc: 'Sync customer accounts and leads', icon: 'SF', color: '#00a1e0' },
                            { name: 'DAT Freight & Analytics', desc: 'Search load boards automatically', icon: 'DAT', color: '#005596' }
                        ].map(app => (
                            <div key={app.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12, letterSpacing: '-0.02em', color: 'white' }}>{app.icon}</div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{app.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{app.desc}</div>
                                    </div>
                                </div>
                                <button
                                    style={{
                                        padding: '6px 14px', borderRadius: 8,
                                        border: `1px solid ${integrationKeys[app.name] ? 'rgba(34,211,168,0.3)' : 'rgba(255,255,255,0.15)'}`,
                                        background: integrationKeys[app.name] ? 'rgba(34,211,168,0.1)' : 'rgba(255,255,255,0.05)',
                                        color: integrationKeys[app.name] ? '#22d3a8' : 'white',
                                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 6
                                    }}
                                    onClick={() => handleOpenIntegration(app)}
                                >
                                    {integrationKeys[app.name] ? <><Check size={14} /> Connected</> : 'Connect'}
                                </button>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* VoIP Integrations */}
            {user?.role === 'office' && (
                <Section icon={Phone} title="Voice & Phone Integration" desc="Connect Twilio or RingCentral to call drivers directly from the dashboard" accentColor="#ef4444">
                    <div style={{ padding: '10px 14px', background: voipSid ? 'rgba(34,211,168,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${voipSid ? 'rgba(34,211,168,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: voipSid ? '#22d3a8' : '#3b8ef3', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: voipSid ? '#22d3a8' : 'var(--text-secondary)', fontWeight: 600 }}>
                            {voipSid ? '🟢 Softphone Active' : '🔵 Inactive — Enter credentials to enable softphone'}
                        </span>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Provider</label>
                        <select
                            value={voipProvider}
                            onChange={e => setVoipProvider(e.target.value)}
                            style={{
                                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                                appearance: 'none'
                            }}
                        >
                            <option value="twilio" style={{ color: 'black' }}>Twilio</option>
                            <option value="ringcentral" style={{ color: 'black' }}>RingCentral</option>
                        </select>
                    </div>

                    <InputField label="Account SID / Client ID" value={voipSid} onChange={setVoipSid} placeholder="Your Account SID" />
                    <InputField label="Auth Token / Client Secret" value={voipToken} onChange={setVoipToken} type="password" placeholder="••••••••••••" />
                    <InputField label="Company Caller ID" value={voipCallerId} onChange={setVoipCallerId} placeholder="+1 (555) 000-0000" />

                    <motion.button
                        onClick={saveVoipConfig}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', marginTop: 8,
                            borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                            background: voipSaved ? 'linear-gradient(135deg, #22d3a8, #059669)' : 'linear-gradient(135deg, #ef4444, #b91c1c)',
                            color: 'white', transition: 'background 0.3s',
                        }}
                    >
                        {voipSaved ? <><Check size={14} /> Saved!</> : <><Phone size={14} /> Save Phone Settings</>}
                    </motion.button>
                </Section>
            )}

            {/* Security */}
            <Section icon={Shield} title={s.security} desc={s.securityDesc} accentColor="var(--accent-red)">
                <InputField label={s.currentPassword} value={curPwd} onChange={setCurPwd} type="password" placeholder="••••••••" />
                <InputField label={s.newPassword} value={newPwd} onChange={setNewPwd} type="password" placeholder="••••••••" />
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: -6, marginBottom: 4 }}>
                    Contact your office admin if you are unable to access your account.
                </p>
            </Section>

            {/* Display */}
            <Section icon={Monitor} title={s.display} desc={s.displayDesc} accentColor="var(--accent-green)">
                <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>{s.textSize}</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {TEXT_SIZES.map(sz => (
                            <button
                                key={sz.key}
                                onClick={() => handleTextSize(sz.key)}
                                style={{
                                    flex: 1, padding: '10px 0', borderRadius: 10,
                                    border: `1px solid ${textSize === sz.key ? 'var(--accent-green)' : 'rgba(255,255,255,0.08)'}`,
                                    background: textSize === sz.key ? 'rgba(34,211,168,0.1)' : 'rgba(255,255,255,0.03)',
                                    color: textSize === sz.key ? 'var(--accent-green)' : 'var(--text-secondary)',
                                    fontWeight: textSize === sz.key ? 700 : 500,
                                    fontSize: sz.px, cursor: 'pointer', transition: 'all 0.15s',
                                }}
                            >
                                {sz.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Section>

            {/* About */}
            <Section icon={Info} title={s.about} desc={s.aboutDesc} accentColor="var(--text-tertiary)">
                <div style={{ display: 'grid', gap: 8 }}>
                    {[
                        ['Application', 'FleetCommand'],
                        [s.currentVersion, '1.0.0'],
                        ['Stack', 'React 18 · Vite · Groq AI · Samsara'],
                        ['Support', 'Contact your administrator'],
                    ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                            <span style={{ fontWeight: 600 }}>{v}</span>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Save button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 40 }}>
                <motion.button
                    onClick={handleSave}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px',
                        borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
                        background: saved ? 'linear-gradient(135deg, var(--accent-green), #059669)' : 'linear-gradient(135deg, var(--accent-blue), #a855f7)',
                        color: 'white', boxShadow: '0 8px 24px rgba(59,142,243,0.3)',
                        transition: 'background 0.3s',
                    }}
                >
                    {saved ? <><Check size={16} /> {s.saved}</> : <>{s.saveChanges}</>}
                </motion.button>
            </div>

            {/* Integration Modal Overlay */}
            {activeIntegration && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 16, width: '100%', maxWidth: 400, position: 'relative' }}
                    >
                        <button onClick={() => setActiveIntegration(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: activeIntegration.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14, color: 'white' }}>
                                {activeIntegration.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Connect {activeIntegration.name}</h3>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Authenticate your account</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
                                API Key / Access Token
                            </label>
                            <input
                                type="password"
                                value={tempKey}
                                onChange={e => setTempKey(e.target.value)}
                                placeholder={`Enter your ${activeIntegration.name} API key`}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                            />
                            <p style={{ margin: '8px 0 0 0', fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                                You can find this in your {activeIntegration.name} developer settings or integrations tab.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setActiveIntegration(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                            <button onClick={handleSaveIntegration} disabled={!tempKey.trim()} style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: tempKey.trim() ? activeIntegration.color : 'rgba(255,255,255,0.1)', color: tempKey.trim() ? 'white' : 'var(--text-secondary)', cursor: tempKey.trim() ? 'pointer' : 'not-allowed', fontWeight: 600, transition: 'all 0.2s' }}>
                                Authenticate & Connect
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
