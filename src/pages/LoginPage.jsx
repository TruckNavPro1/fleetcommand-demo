import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Truck, Eye, EyeOff, ChevronRight, Lock, Zap } from 'lucide-react'

export default function LoginPage() {
    const { login, demoLogin, loginError, setLoginError } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!email || !password) return
        setLoading(true)
        const success = await login(email, password)
        setLoading(false)
        if (!success) setPassword('')
    }

    return (
        <div className="login-page">
            <div className="mesh-bg">
                <div className="mesh-blob blob-1" />
                <div className="mesh-blob blob-2" />
                <div className="mesh-blob blob-3" />
                <div className="mesh-blob blob-4" />
            </div>

            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            >
                {/* Logo */}
                <div className="login-logo" style={{ marginBottom: 32 }}>
                    <div className="login-logo-icon">
                        <Truck size={28} color="white" />
                    </div>
                    <div>
                        <h1 className="login-brand">FleetCommand</h1>
                        <p className="login-tagline">Internal Operations Hub</p>
                    </div>
                </div>

                {/* ── Sign In Header ──────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em' }}>SIGN IN WITH SECURE CREDENTIALS</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                </div>

                {/* Email/Password Form */}
                <form
                    className="login-form"
                    onSubmit={handleLogin}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="login-input-wrap">
                            <input
                                type="email"
                                className="login-input"
                                placeholder="Email address"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setLoginError('') }}
                                autoFocus
                                required
                                style={{ paddingLeft: 16 }}
                            />
                        </div>

                        <div className="login-input-wrap">
                            <Lock size={15} color="var(--text-tertiary)" className="login-input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="login-input"
                                placeholder="Password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setLoginError('') }}
                                required
                            />
                            <button type="button" className="login-eye-btn" onClick={() => setShowPassword(s => !s)} tabIndex={-1}>
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>

                        <AnimatePresence>
                            {loginError && (
                                <motion.div className="login-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    {loginError}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            type="submit"
                            className="login-btn"
                            style={{ '--role-color': '#fff' }}
                            disabled={!email || !password || loading}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        >
                            {loading ? <span className="login-spinner" /> : <>Sign In <ChevronRight size={16} /></>}
                        </motion.button>
                    </div>
                </form>

                {/* ── QUICK TEST MODE (DEMO BYPASS) ──────────────────────── */}
                <div style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-amber)' }}>
                            <Zap size={14} />
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Interactive Demo Mode</span>
                        </div>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    </div>

                    <div className="role-cards">
                        <div className="role-card" onClick={() => demoLogin('office')}>
                            <div className="role-card-icon" style={{ '--role-color': '#3b8ef3', color: '#3b8ef3' }}>
                                <Truck size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="role-card-name">Office / Dispatch</div>
                                <div className="role-card-desc">Full admin & fleet view</div>
                            </div>
                            <div className="role-card-check" style={{ '--role-color': '#3b8ef3', color: '#3b8ef3' }}>
                                <ChevronRight size={16} />
                            </div>
                        </div>

                        <div className="role-card" onClick={() => demoLogin('driver')}>
                            <div className="role-card-icon" style={{ '--role-color': '#22d3a8', color: '#22d3a8' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="role-card-name">Driver App</div>
                                <div className="role-card-desc">Mobile routing & loads</div>
                            </div>
                            <div className="role-card-check" style={{ '--role-color': '#22d3a8', color: '#22d3a8' }}>
                                <ChevronRight size={16} />
                            </div>
                        </div>

                        <div className="role-card" onClick={() => demoLogin('mechanic')}>
                            <div className="role-card-icon" style={{ '--role-color': '#f59e0b', color: '#f59e0b' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="role-card-name">Mechanic Bay</div>
                                <div className="role-card-desc">Repairs & inventory</div>
                            </div>
                            <div className="role-card-check" style={{ '--role-color': '#f59e0b', color: '#f59e0b' }}>
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                <p className="login-footer">Internal use only · FleetCommand © {new Date().getFullYear()}</p>
            </motion.div>
        </div>
    )
}
