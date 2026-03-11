/**
 * AuthContext — Role-Based Login System (Supabase Version)
 *
 * Three separate profiles: Office Staff, Driver, Mechanic
 * Sessions persist automatically via Supabase.
 * Only 'office' and 'mechanic' roles can access backend/admin data.
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

const DEMO_PROFILES = {
    office: { id: 'demo-office-1', email: 'office@demo.com', role: 'office', name: 'Sarah Mitchell', initials: 'SM', title: 'Dispatch Manager', organization_id: 'demo-org', color: '#3b8ef3' },
    driver: { id: 'demo-driver-1', email: 'driver@demo.com', role: 'driver', name: 'John Davis', initials: 'JD', title: 'Senior Operator', organization_id: 'demo-org', color: '#22d3a8' },
    mechanic: { id: 'demo-mech-1', email: 'mechanic@demo.com', role: 'mechanic', name: 'Mike Chen', initials: 'MC', title: 'Lead Technician', organization_id: 'demo-org', color: '#f59e0b' }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [loginError, setLoginError] = useState('')

    useEffect(() => {
        // Check active session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchProfile(session.user)
            } else {
                setAuthLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                fetchProfile(session.user)
            } else {
                setUser(null)
                setAuthLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const demoLogin = (roleKey) => {
        setAuthLoading(true)
        const profile = DEMO_PROFILES[roleKey]
        if (profile) {
            setUser({ ...profile, isDemo: true })
            setLoginError('')
        }
        setAuthLoading(false)
    }

    const fetchProfile = async (supabaseUser) => {
        try {
            // Bypass DB for test accounts
            if (supabaseUser.email === 'office@fleetcommand.com') {
                setUser({
                    id: supabaseUser.id,
                    email: supabaseUser.email,
                    role: 'office',
                    name: 'Test Office',
                    initials: 'TO',
                    title: 'System Admin',
                    organization_id: 'test-org-123',
                    color: '#3b8ef3',
                    isDemo: false
                })
                setAuthLoading(false)
                return
            }
            if (supabaseUser.email === 'mechanic@fleetcommand.com') {
                setUser({
                    id: supabaseUser.id,
                    email: supabaseUser.email,
                    role: 'mechanic',
                    name: 'Test Mechanic',
                    initials: 'TM',
                    title: 'Lead Mechanic',
                    organization_id: 'test-org-123',
                    color: '#f59e0b',
                    isDemo: false
                })
                setAuthLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', supabaseUser.id)
                .single()

            if (error) throw error

            setUser({
                id: supabaseUser.id,
                email: supabaseUser.email,
                role: data.role,
                name: data.full_name,
                initials: data.full_name.split(' ').map(n => n[0]).join(''),
                title: data.title,
                organization_id: data.organization_id,
                color: data.role === 'office' ? '#3b8ef3' : data.role === 'driver' ? '#22d3a8' : '#f59e0b',
                isDemo: false
            })
        } catch (err) {
            console.error('Error fetching user profile:', err)
            // Fallback if profile fetch fails
            setUser({
                id: supabaseUser.id,
                email: supabaseUser.email,
                role: 'driver', // Default safe role
                name: supabaseUser.email.split('@')[0],
                initials: '?',
                color: '#22d3a8',
                isDemo: false
            })
        } finally {
            setAuthLoading(false)
        }
    }

    const login = async (email, password) => {
        try {
            setLoginError('')
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            return true
        } catch (error) {
            setLoginError(error.message)
            return false
        }
    }

    const logout = async () => {
        if (user?.isDemo) {
            setUser(null)
            return
        }
        await supabase.auth.signOut()
    }

    const isAdmin = user?.role === 'office'

    return (
        <AuthContext.Provider value={{ user, authLoading, login, logout, demoLogin, loginError, setLoginError, isAdmin }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
