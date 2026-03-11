import { useState, useRef, useEffect } from 'react'
import { Bell, Search, Menu, LogOut, Shield, User } from 'lucide-react'
import { useRole, roles } from '../../context/RoleContext'
import { useAuth } from '../../context/AuthContext'
import { useFleetData } from '../../context/FleetContext'
import { motion, AnimatePresence } from 'framer-motion'

const pageTitles = {
    office: { title: 'Dispatch Center', sub: 'Real-time operations overview' },
    driver: { title: 'Driver Hub', sub: 'Your routes, loads & status' },
    mechanic: { title: 'Mechanic Bay', sub: 'Work orders & vehicle health' },
}

export default function Header({ onMenuClick }) {
    const { role, setRole } = useRole()
    const { user, logout, isAdmin } = useAuth()
    const { isLive, loading, canAccessBackend } = useFleetData()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)
    const info = pageTitles[role]

    // Close menu on outside click
    useEffect(() => {
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const initials = user?.initials || '??'
    const userName = user?.name || 'User'
    const userTitle = user?.title || ''
    const userColor = user?.color || 'var(--accent-blue)'

    return (
        <header className="header">
            {/* Mobile hamburger */}
            <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
                <Menu size={20} />
            </button>

            <div className="header-title">
                <h1>{info.title}</h1>
                <p>{info.sub}</p>
            </div>

            {/* Live / Demo / Driver View badge */}
            {(() => {
                if (!canAccessBackend) {
                    // Driver role — always frontend only
                    return (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                            letterSpacing: '0.04em', flexShrink: 0,
                            background: 'rgba(245,158,11,0.1)',
                            border: '1px solid rgba(245,158,11,0.3)',
                            color: '#f59e0b',
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                            Driver View
                        </div>
                    )
                }
                // Mechanic / Office — backend enabled
                return (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        letterSpacing: '0.04em',
                        background: isLive ? 'rgba(34,211,168,0.1)' : 'rgba(59,142,243,0.1)',
                        border: `1px solid ${isLive ? 'rgba(34,211,168,0.3)' : 'rgba(59,142,243,0.25)'}`,
                        color: isLive ? '#22d3a8' : '#3b8ef3',
                        transition: 'all 0.4s', flexShrink: 0,
                    }}>
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: isLive ? '#22d3a8' : '#3b8ef3',
                            animation: loading ? 'ring-pulse 1s infinite' : isLive ? 'ring-pulse 2s infinite' : 'none',
                        }} />
                        {loading ? 'Syncing…' : isLive ? 'Live Data' : 'Demo Mode'}
                    </div>
                )
            })()}

            <div className="header-spacer" />

            {/* Search */}
            <div className="header-search">
                <Search size={14} color="var(--text-tertiary)" />
                <input placeholder="Search trucks, drivers, loads…" />
            </div>

            {/* Role switcher — only visible to office/admin */}
            {isAdmin && (
                <div className="role-switcher">
                    {Object.entries(roles).map(([key, r]) => (
                        <button
                            key={key}
                            className={`role-btn ${role === key ? 'active' : ''}`}
                            onClick={() => setRole(key)}
                            title={`Preview ${r.label} view`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Notifications */}
            <button className="header-btn">
                <Bell size={18} />
                <span className="dot" />
            </button>

            {/* Avatar + user menu */}
            <div className="user-menu-wrap" ref={menuRef}>
                <div
                    className="avatar"
                    style={{ background: `linear-gradient(135deg, ${userColor}, #a855f7)` }}
                    onClick={() => setMenuOpen(o => !o)}
                    title={userName}
                >
                    {initials}
                </div>

                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            className="user-menu"
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                        >
                            <div className="user-menu-header">
                                <div className="user-menu-name">{userName}</div>
                                <div className="user-menu-role">
                                    {userTitle}
                                    {isAdmin && (
                                        <span className="admin-only-badge" style={{ marginLeft: 6 }}>
                                            <Shield size={9} /> Admin
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button className="user-menu-item">
                                <User size={14} /> My Profile
                            </button>
                            <button
                                className="user-menu-item danger"
                                onClick={() => { setMenuOpen(false); logout() }}
                            >
                                <LogOut size={14} /> Sign Out
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    )
}
