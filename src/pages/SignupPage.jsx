import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Truck, Eye, EyeOff, ChevronRight, Lock, Building, User, Mail, Globe } from 'lucide-react'

export default function SignupPage() {
    const { signup, loginError, setLoginError } = useAuth()
    const navigate = useNavigate()

    const [orgName, setOrgName] = useState('')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fleetSize, setFleetSize] = useState('1-5 Trucks')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSignup = async (e) => {
        e.preventDefault()
        if (!email || !password || !orgName || !fullName) return
        setLoading(true)

        // Supabase sign up call will go here via AuthContext
        // We assume signup returns true on success
        if (signup) {
            const success = await signup(email, password, { orgName, fullName, fleetSize })
            if (success) {
                navigate('/office') // or welcome page
            }
        } else {
            console.warn("AuthContext.signup is not implemented yet")
            // Fallback for mock demo UI
            setTimeout(() => {
                setLoading(false)
                navigate('/login')
            }, 1000)
        }
        setLoading(false)
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
                style={{ width: '100%', maxWidth: 440, padding: 32 }}
            >
                {/* Logo & Header */}
                <div className="login-logo" style={{ marginBottom: 32, justifyContent: 'flex-start' }}>
                    <div className="login-logo-icon" style={{ '--role-color': '#a855f7' }}>
                        <Truck size={28} color="white" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h1 className="login-brand" style={{ fontSize: 22, margin: 0, fontWeight: 800 }}>FleetCommand Hub</h1>
                        <p className="login-tagline" style={{ margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>ONBOARD YOUR BUSINESS</p>
                    </div>
                </div>

                {/* Signup Form */}
                <form className="login-form" onSubmit={handleSignup}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        <div className="login-input-wrap">
                            <Building size={16} color="var(--text-tertiary)" className="login-input-icon" />
                            <input
                                type="text"
                                className="login-input"
                                placeholder="Organization Name"
                                value={orgName}
                                onChange={e => { setOrgName(e.target.value); setLoginError?.('') }}
                                autoFocus
                                required
                            />
                        </div>

                        <div className="login-input-wrap">
                            <User size={16} color="var(--text-tertiary)" className="login-input-icon" />
                            <input
                                type="text"
                                className="login-input"
                                placeholder="Your Full Name"
                                value={fullName}
                                onChange={e => { setFullName(e.target.value); setLoginError?.('') }}
                                required
                            />
                        </div>

                        <div className="login-input-wrap">
                            <Mail size={16} color="var(--text-tertiary)" className="login-input-icon" />
                            <input
                                type="email"
                                className="login-input"
                                placeholder="Email Address"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setLoginError?.('') }}
                                required
                            />
                        </div>

                        <div className="login-input-wrap">
                            <Globe size={16} color="var(--text-tertiary)" className="login-input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="login-input"
                                placeholder="Password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setLoginError?.('') }}
                                required
                            />
                            <button type="button" className="login-eye-btn" onClick={() => setShowPassword(s => !s)} tabIndex={-1}>
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>

                        <div className="login-input-wrap" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '0 16px' }}>
                            <select
                                value={fleetSize}
                                onChange={e => setFleetSize(e.target.value)}
                                style={{ width: '100%', padding: '14px 0', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 14, outline: 'none', appearance: 'none', cursor: 'pointer' }}
                            >
                                <option value="1-5 Trucks" style={{ color: 'black' }}>Fleet Size: 1-5 Trucks</option>
                                <option value="6-20 Trucks" style={{ color: 'black' }}>Fleet Size: 6-20 Trucks</option>
                                <option value="21-50 Trucks" style={{ color: 'black' }}>Fleet Size: 21-50 Trucks</option>
                                <option value="50+ Trucks" style={{ color: 'black' }}>Fleet Size: 50+ Trucks</option>
                            </select>
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
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b8ef3)', color: 'white', marginTop: 12 }}
                            disabled={!email || !password || !orgName || !fullName || loading}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        >
                            {loading ? <span className="login-spinner" /> : <>Register Business <ChevronRight size={16} /></>}
                        </motion.button>
                    </div>
                </form>

                <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                    Already have a business account? <Link to="/login" style={{ color: '#3b8ef3', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
                </div>

            </motion.div>
        </div>
    )
}
