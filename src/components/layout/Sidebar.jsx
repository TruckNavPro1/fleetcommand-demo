import { NavLink } from 'react-router-dom'
import { useRole } from '../../context/RoleContext'
import { useAuth } from '../../context/AuthContext'
import {
    LayoutDashboard, Truck, Wrench, Building2, MapPin,
    AlertTriangle, FileText, Users, BarChart3, Settings,
    ClipboardList, Fuel, Package, ShieldCheck, CreditCard
} from 'lucide-react'

const navConfig = {
    office: [
        { label: 'Command Center', icon: LayoutDashboard, to: '/' },
        { label: 'Dispatch Board', icon: Package, to: '/office', badge: 3 },
        { label: 'Fleet Map', icon: MapPin, to: '/map' },
        { label: 'Driver Roster', icon: Users, to: '/drivers' },
        { label: 'Analytics', icon: BarChart3, to: '/analytics' },
        { label: 'Compliance', icon: ShieldCheck, to: '/compliance' },
        { label: 'Reports', icon: FileText, to: '/reports' },
        { label: 'Billing & Plan', icon: CreditCard, to: '/billing' },
        { label: 'Settings', icon: Settings, to: '/settings' },
    ],
    driver: [
        { label: 'Command Center', icon: LayoutDashboard, to: '/' },
        { label: 'My Dashboard', icon: Truck, to: '/driver' },
        { label: 'Documents', icon: FileText, to: '/docs' },
        { label: 'Settings', icon: Settings, to: '/settings' },
    ],
    mechanic: [
        { label: 'Command Center', icon: LayoutDashboard, to: '/' },
        { label: 'Work Orders', icon: Wrench, to: '/mechanic', badge: 5 },
        { label: 'Vehicle Health', icon: Truck, to: '/health' },
        { label: 'Parts Inventory', icon: ClipboardList, to: '/parts' },
        { label: 'Schedule', icon: Building2, to: '/schedule' },
        { label: 'Alerts', icon: AlertTriangle, to: '/alerts', badge: 1 },
        { label: 'Reports', icon: FileText, to: '/reports' },
        { label: 'Settings', icon: Settings, to: '/settings' },
    ],
}

export default function Sidebar({ open, onClose }) {
    const { role } = useRole()
    const { user } = useAuth()
    // Use proper user auth role if available, fallback to legacy RoleContext
    const activeRole = user?.role || role || 'office'
    const navItems = navConfig[activeRole] || navConfig.office

    // Pull display info from the real auth session
    const displayName = user?.name || 'Fleet Staff'
    const displayTitle = user?.title || role || ''
    const displayColor = user?.color || '#3b8ef3'
    const displayInitials = user?.initials
        || displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

    return (
        <aside className={`sidebar ${open ? 'open' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <Truck size={20} color="white" />
                </div>
                <div className="logo-text">
                    <h2>FleetCommand</h2>
                    <p>Operations Hub</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                <span className="nav-section-label">Navigation</span>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to + item.label}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={onClose}
                    >
                        <item.icon className="nav-icon" />
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User tile — from auth session */}
            <div className="sidebar-role">
                <div className="sidebar-user">
                    <div className="avatar" style={{
                        background: `linear-gradient(135deg, ${displayColor}, #a855f7)`,
                        width: 34, height: 34, fontSize: 12
                    }}>
                        {displayInitials}
                    </div>
                    <div>
                        <div className="name">{displayName}</div>
                        <div className="role-label">{displayTitle}</div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
