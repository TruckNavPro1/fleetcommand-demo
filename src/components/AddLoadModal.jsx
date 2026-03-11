import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Clock, MapPin, Truck, AlertCircle } from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { z } from 'zod'
import { toast } from 'react-hot-toast'

const loadSchema = z.object({
    origin: z.string().min(2, "Origin City is too short"),
    dest: z.string().min(2, "Destination City is too short"),
    weight: z.string().regex(/^\d+(,\d{3})*$/, "Weight must be a valid number (e.g. 42,000)"),
    miles: z.number().int().positive("Miles must be greater than zero")
})

export default function AddLoadModal({ isOpen, onClose, onAddSuccess }) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Form fields
    const [loadId, setLoadId] = useState(`LD-${Math.floor(1000 + Math.random() * 9000)}`)
    const [origin, setOrigin] = useState('')
    const [dest, setDest] = useState('')
    const [weight, setWeight] = useState('')
    const [miles, setMiles] = useState('')
    const [pickup, setPickup] = useState('')
    const [delivery, setDelivery] = useState('')
    const [pickupNumber, setPickupNumber] = useState('')
    const [selectedVehicle, setSelectedVehicle] = useState('')

    // Data lists
    const [vehicles, setVehicles] = useState([])

    useEffect(() => {
        if (isOpen) {
            fetchOptions()
        }
    }, [isOpen])

    const fetchOptions = async () => {
        const { data: vData } = await supabase.from('vehicles').select('id, make_model').order('id')
        if (vData) setVehicles(vData)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validation = loadSchema.safeParse({ origin, dest, weight, miles: parseInt(miles) || 0 })
        if (!validation.success) {
            const errorMsg = validation.error.errors[0].message
            setError(errorMsg)
            toast.error(errorMsg)
            return
        }

        setLoading(true)
        setError('')

        try {
            const { error: insertError } = await supabase
                .from('loads')
                .insert([{
                    id: loadId,
                    origin,
                    destination: dest,
                    weight,
                    miles: parseInt(miles),
                    pickup_number: pickupNumber || null,
                    assigned_vehicle_id: selectedVehicle || null,
                    status: 'Upcoming',
                    created_by: user?.id,
                    organization_id: user?.organization_id
                }])

            if (insertError) throw insertError

            // Clear form
            setLoadId(`LD-${Math.floor(1000 + Math.random() * 9000)}`)
            setOrigin('')
            setDest('')
            setWeight('')
            setMiles('')
            setPickup('')
            setDelivery('')
            setPickupNumber('')
            setSelectedVehicle('')

            setSelectedVehicle('')

            toast.success("Load successfully dispatched!")
            if (onAddSuccess) onAddSuccess()
            onClose()
        } catch (err) {
            console.error('Error adding load:', err)
            setError(err.message)
            toast.error(`Failed to assign load: ${err.message}`)
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
                    style={{ background: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: 500, padding: 0, overflow: 'hidden', borderRadius: 16 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Plus size={18} color="var(--accent-blue)" />
                            Add New Load
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Load ID</label>
                                <input type="text" value={loadId} readOnly className="login-input" style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Pickup Number</label>
                                <input type="text" value={pickupNumber} onChange={e => setPickupNumber(e.target.value)} placeholder="e.g. PU-8821" className="login-input" style={{ padding: '10px 14px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Assign Vehicle</label>
                                <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className="login-input" style={{ padding: '10px 14px' }}>
                                    <option value="">-- Unassigned --</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.id} ({v.make_model})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Weight (lbs)</label>
                                <input type="text" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 42,000" className="login-input" style={{ padding: '10px 14px' }} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}><MapPin size={12} style={{ marginRight: 4 }} />Origin</label>
                                <input type="text" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="City, ST" className="login-input" style={{ padding: '10px 14px' }} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}><MapPin size={12} style={{ marginRight: 4 }} />Destination</label>
                                <input type="text" value={dest} onChange={e => setDest(e.target.value)} placeholder="City, ST" className="login-input" style={{ padding: '10px 14px' }} required />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Est. Miles</label>
                                <input type="number" value={miles} onChange={e => setMiles(e.target.value)} placeholder="e.g. 550" className="login-input" style={{ padding: '10px 14px' }} required />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}><Clock size={12} style={{ marginRight: 4 }} />Pickup Time</label>
                                <input type="datetime-local" value={pickup} onChange={e => setPickup(e.target.value)} className="login-input" style={{ padding: '10px 14px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}><Clock size={12} style={{ marginRight: 4 }} />Delivery Time</label>
                                <input type="datetime-local" value={delivery} onChange={e => setDelivery(e.target.value)} className="login-input" style={{ padding: '10px 14px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancel</button>
                            <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent-blue)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                {loading ? <span className="login-spinner" style={{ width: 14, height: 14 }} /> : 'Add Load'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
