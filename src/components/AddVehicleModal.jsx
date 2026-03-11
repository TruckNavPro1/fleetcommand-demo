import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Truck, AlertCircle } from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export default function AddVehicleModal({ isOpen, onClose, onAddSuccess }) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [vehicleId, setVehicleId] = useState('')
    const [makeModel, setMakeModel] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!vehicleId || !makeModel) {
            setError('Please fill out all fields')
            return
        }

        setLoading(true)
        setError('')

        try {
            const { error: insertError } = await supabase
                .from('vehicles')
                .insert([{
                    id: vehicleId.toUpperCase(),
                    make_model: makeModel,
                    status: 'idle',
                    fuel_level: 100,
                    organization_id: user?.organization_id
                }])

            if (insertError) throw insertError

            setVehicleId('')
            setMakeModel('')

            if (onAddSuccess) onAddSuccess()
            onClose()
        } catch (err) {
            console.error('Error adding vehicle:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="glass-card"
                    style={{ background: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: 400, padding: 0, overflow: 'hidden', borderRadius: 16 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Truck size={18} color="var(--accent-green)" />
                            Add New Vehicle
                        </h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: 20 }}>
                        {error && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Vehicle ID</label>
                                <input type="text" value={vehicleId} onChange={e => setVehicleId(e.target.value)} placeholder="e.g. TRK-007" className="login-input" style={{ padding: '10px 14px' }} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Make / Model</label>
                                <input type="text" value={makeModel} onChange={e => setMakeModel(e.target.value)} placeholder="e.g. 2024 Freightliner Cascadia" className="login-input" style={{ padding: '10px 14px' }} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancel</button>
                            <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent-green)', color: '#000', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                {loading ? <span className="login-spinner" style={{ width: 14, height: 14, borderColor: '#000', borderBottomColor: 'transparent' }} /> : 'Add Vehicle'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
