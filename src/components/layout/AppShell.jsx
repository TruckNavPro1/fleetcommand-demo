import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import { FleetProvider } from '../../context/FleetContext'
import PhoneDialer from '../PhoneDialer'
import { useAuth } from '../../context/AuthContext'
import { Wrench } from 'lucide-react'
import LogRepairModal from '../LogRepairModal'

export default function AppShell() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { user } = useAuth()
    const [repairModalOpen, setRepairModalOpen] = useState(false)

    return (
        <FleetProvider>
            <PhoneDialer />
            {/* Animated Mesh Background */}
            <div className="mesh-bg">
                <div className="mesh-blob blob-1" />
                <div className="mesh-blob blob-2" />
                <div className="mesh-blob blob-3" />
                <div className="mesh-blob blob-4" />
            </div>

            {/* Mobile sidebar overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <div className="app-shell">
                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="main-content">
                    <Header onMenuClick={() => setSidebarOpen(o => !o)} />
                    <main className="page-body">
                        <Outlet />
                        {user?.role === 'mechanic' && (
                            <button
                                className="fab-btn"
                                onClick={() => setRepairModalOpen(true)}
                                title="New Work Order"
                            >
                                <Wrench size={24} color="white" />
                                <span className="fab-text">New Route</span> {/* or "Log Repair" */}
                            </button>
                        )}
                    </main>
                </div>
            </div>

            {user?.role === 'mechanic' && (
                <LogRepairModal
                    isOpen={repairModalOpen}
                    onClose={() => setRepairModalOpen(false)}
                />
            )}
        </FleetProvider>
    )
}
