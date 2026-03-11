import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wrench, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { useFleetData } from '../context/FleetContext'
import { z } from 'zod'
import { toast } from 'react-hot-toast'

const repairSchema = z.object({
    assetId: z.string().min(1, "Please provide an Asset ID"),
    description: z.string().min(10, "Description must be at least 10 characters long"),
    cost: z.string().optional()
})

export default function LogRepairModal({ isOpen, onClose, selectedVehicleId = '', onAddSuccess }) {
    const { user } = useAuth()
    const { vehicleHealth } = useFleetData()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Form fields
    const [assetType, setAssetType] = useState('Truck')
    const [assetId, setAssetId] = useState(selectedVehicleId)
    const [serviceCategory, setServiceCategory] = useState('General')
    const [priority, setPriority] = useState('Medium')
    const [reportedBy, setReportedBy] = useState('')
    const [description, setDescription] = useState('')
    const [cost, setCost] = useState('')
    const [status, setStatus] = useState('Completed')

    useEffect(() => {
        if (selectedVehicleId) {
            setAssetId(selectedVehicleId)
            setAssetType('Truck')
        }
    }, [selectedVehicleId])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validation = repairSchema.safeParse({ assetId, description, cost })
        if (!validation.success) {
            const errorMsg = validation.error.errors[0].message
            setError(errorMsg)
            toast.error(errorMsg)
            return
        }

        setLoading(true)
        setError('')

        try {
            if (user?.isDemo) {
                // Simulate network latency for the demo
                await new Promise(resolve => setTimeout(resolve, 800))
                toast.success("Demo: Repair logged successfully!")
                if (onAddSuccess) onAddSuccess()
                onClose()
                return
            }

            const { error: insertError } = await supabase
                .from('work_orders')
                .insert([{
                    asset_id: assetId,
                    asset_type: assetType,
                    service_category: serviceCategory,
                    priority,
                    reported_by: reportedBy,
                    mechanic_id: user?.id,
                    description,
                    cost: cost || null,
                    status,
                    organization_id: user?.organization_id
                }])

            if (insertError) throw insertError

            // Clear form
            setDescription('')
            setCost('')
            setReportedBy('')
            setStatus('Completed')

            toast.success("Repair logged successfully!")
            if (onAddSuccess) onAddSuccess()
            onClose()
        } catch (err) {
            console.error('Error logging repair:', err)
            setError(err.message)
            toast.error(`Failed to log repair: ${err.message}`)
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
                            <Wrench size={18} color="var(--accent-blue)" />
                            Log Repair & Maintenance
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
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Asset Type</label>
                                <select value={assetType} onChange={e => { setAssetType(e.target.value); setAssetId('') }} className="login-input" style={{ padding: '10px 14px', width: '100%' }}>
                                    <option value="Truck">Truck</option>
                                    <option value="Trailer">Trailer</option>
                                    <option value="Other">Other Equipment</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Asset ID</label>
                                {assetType === 'Truck' ? (
                                    <select value={assetId} onChange={e => setAssetId(e.target.value)} className="login-input" style={{ padding: '10px 14px', width: '100%' }}>
                                        <option value="">-- Select Truck --</option>
                                        {vehicleHealth.map(v => (
                                            <option key={v.id} value={v.id}>{v.id}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input type="text" value={assetId} onChange={e => setAssetId(e.target.value)} placeholder="e.g. TRL-1004" className="login-input" style={{ padding: '10px 14px', width: '100%' }} />
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Service Category</label>
                                <select value={serviceCategory} onChange={e => setServiceCategory(e.target.value)} className="login-input" style={{ padding: '10px 14px', width: '100%' }}>
                                    <option value="General">General / Other</option>
                                    <option value="Preventative">Preventative Maintenance</option>
                                    <option value="Brakes">Brakes & Air Systems</option>
                                    <option value="Engine">Engine & Drivetrain</option>
                                    <option value="Electrical">Electrical & Lighting</option>
                                    <option value="Tires">Tires & Wheels</option>
                                    <option value="Body">Body & Frame</option>
                                    <option value="Suspension">Suspension</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Priority</label>
                                <select value={priority} onChange={e => setPriority(e.target.value)} className="login-input" style={{ padding: '10px 14px', width: '100%' }}>
                                    <option value="Low">Low - Routine</option>
                                    <option value="Medium">Medium - Needs Attention</option>
                                    <option value="High">High - Urgent</option>
                                    <option value="Critical">Critical - Out of Service</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Driver Notes / Reported By (Optional)</label>
                            <input type="text" value={reportedBy} onChange={e => setReportedBy(e.target.value)} placeholder="e.g. Driver reported pulling to the right" className="login-input" style={{ padding: '10px 14px', width: '100%' }} />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Work Description / Notes</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="e.g., Replaced front-left brake pad and rotators. Checked fluids."
                                className="login-input"
                                style={{ padding: '10px 14px', width: '100%', minHeight: 80, resize: 'vertical' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Est. Cost ($)</label>
                                <input type="number" step="0.01" value={cost} onChange={e => setCost(e.target.value)} placeholder="e.g. 150.00" className="login-input" style={{ padding: '10px 14px', width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="login-input" style={{ padding: '10px 14px', width: '100%' }}>
                                    <option value="Completed">Completed (Ready to dispatch)</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Pending Parts">Pending Parts</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancel</button>
                            <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent-blue)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                {loading ? <span className="login-spinner" style={{ width: 14, height: 14 }} /> : <><CheckCircle size={16} /> Save Log</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
