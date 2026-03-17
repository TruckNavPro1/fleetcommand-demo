import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RoleProvider } from './context/RoleContext'
import { SamsaraProvider } from './context/SamsaraContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PhoneProvider } from './context/PhoneContext'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'
import AppShell from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Overview from './pages/Overview'
import DriverDashboard from './pages/DriverDashboard'
import MechanicDashboard from './pages/MechanicDashboard'
import OfficeDashboard from './pages/OfficeDashboard'
import FleetMap from './pages/FleetMap'
import Analytics from './pages/Analytics'
import Alerts from './pages/Alerts'
import Documents from './pages/Documents'
import VehicleHealth from './pages/VehicleHealth'
import PartsInventory from './pages/PartsInventory'
import Schedule from './pages/Schedule'
import DriverRoster from './pages/DriverRoster'
import Compliance from './pages/Compliance'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Billing from './pages/Billing'

// Gate: redirect to /login if not authenticated
function RequireAuth({ children }) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    return children
}

// Gate: if already logged in, bounce away from /login to home
function GuestOnly({ children }) {
    const { user } = useAuth()
    if (user) {
        if (user.role === 'office') return <Navigate to="/office" replace />
        if (user.role === 'driver') return <Navigate to="/driver" replace />
        if (user.role === 'mechanic') return <Navigate to="/mechanic" replace />
        return <Navigate to="/" replace />
    }
    return children
}

// Gate: admin-only pages redirect non-office users
function RequireAdmin({ children }) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    if (user.role !== 'office') {
        if (user.role === 'driver') return <Navigate to="/driver" replace />
        if (user.role === 'mechanic') return <Navigate to="/mechanic" replace />
        return <Navigate to="/" replace />
    }
    return children
}

// Gate: command center is for office and mechanics, not drivers
function RequireCommandCenter({ children }) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    if (user.role === 'driver') return <Navigate to="/driver" replace />
    return children
}

export default function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <RoleProvider>
                    <SamsaraProvider>
                        <PhoneProvider>
                            <Toaster
                                position="top-center"
                                toastOptions={{
                                    style: { background: 'var(--bg-glass)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '13px', fontWeight: 600 }
                                }}
                            />
                            <BrowserRouter>
                                <Routes>
                                    {/* Public — guests only */}
                                    <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
                                    <Route path="/signup" element={<GuestOnly><SignupPage /></GuestOnly>} />

                                    {/* Protected — all authenticated roles */}
                                    <Route element={<RequireAuth><AppShell /></RequireAuth>}>
                                        <Route index element={<RequireCommandCenter><Overview /></RequireCommandCenter>} />
                                        <Route path="/driver" element={<DriverDashboard />} />
                                        <Route path="/mechanic" element={<MechanicDashboard />} />

                                        {/* Shared pages */}
                                        <Route path="/map" element={<RequireCommandCenter><FleetMap /></RequireCommandCenter>} />
                                        <Route path="/alerts" element={<RequireCommandCenter><Alerts /></RequireCommandCenter>} />

                                        {/* Driver pages */}
                                        <Route path="/docs" element={<Documents />} />

                                        {/* Mechanic pages */}
                                        <Route path="/health" element={<VehicleHealth />} />
                                        <Route path="/parts" element={<PartsInventory />} />
                                        <Route path="/schedule" element={<Schedule />} />

                                        {/* Admin-only — office staff only */}
                                        <Route path="/office" element={<RequireAdmin><OfficeDashboard /></RequireAdmin>} />
                                        <Route path="/drivers" element={<RequireAdmin><DriverRoster /></RequireAdmin>} />
                                        <Route path="/analytics" element={<RequireAdmin><Analytics /></RequireAdmin>} />
                                        <Route path="/compliance" element={<RequireAdmin><Compliance /></RequireAdmin>} />
                                        <Route path="/reports" element={<RequireAdmin><Reports /></RequireAdmin>} />
                                        <Route path="/billing" element={<RequireAdmin><Billing /></RequireAdmin>} />

                                        {/* Settings — available to all authenticated roles */}
                                        <Route path="/settings" element={<Settings />} />
                                    </Route>

                                    {/* Catch-all */}
                                    <Route path="*" element={<Navigate to="/login" replace />} />
                                </Routes>
                            </BrowserRouter>
                        </PhoneProvider>
                    </SamsaraProvider>
                </RoleProvider>
            </AuthProvider>
        </ErrorBoundary>
    )
}
