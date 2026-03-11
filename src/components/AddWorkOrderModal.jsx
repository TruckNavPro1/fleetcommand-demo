import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Wrench, AlertCircle } from 'lucide-react'
import { supabase } from '../services/supabase'

export default function AddWorkOrderModal({ isOpen, onClose, onAddSuccess }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [type, setType] = useState('')
    const [truck, setTruck] = useState('')
    const [tech, setTech] = useState('Ray Johnson')
    const [duration, setDuration] = useState('2')
    const [priority, setPriority] = useState('medium')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!type || !truck) {
            setError('Please fill out the repair type and select a truck')
            return
        }

        setLoading(true)
        setError('')

        // In a real app we would insert into a 'work_orders' table
        // For now, we will just simulate success to close the loop on the UI
        setTimeout(() => {
            setLoading(false)
            setType('')
            setTruck('')
            setPriority('medium')
            if (onAddSuccess) onAddSuccess({ id: `WO-${Math.floor(Math.random() * 9000) + 1000}`, type, truck, tech, priority, dur: duration, status: 'Scheduled', day: 'Wed', start: 9 })
            onClose()
        }, 600)
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
                    style={{ background: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: 450, padding: 0, overflow: 'hidden', borderRadius: 16 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Wrench size={18} color="var(--accent-amber)" />
                            New Work Order
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
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Vehicle / Asset</label>
                                <input type="text" value={truck} onChange={e => setTruck(e.target.value)} placeholder="e.g. TRK-002" className="login-input" style={{ padding: '10px 14px' }} required />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Repair Type & Description</label>
                                <input type="text" value={type} onChange={e => setType(e.target.value)} placeholder="e.g. Brake Pad Replacement" className="login-input" style={{ padding: '10px 14px' }} required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Technician</label>
                                    <select value={tech} onChange={e => setTech(e.target.value)} className="login-input" style={{ padding: '10px 14px' }}>
                                        <option value="Ray Johnson">Ray Johnson</option>
                                        <option value="Mark Davis">Mark Davis</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Est. Duration (Hours)</label>
                                    <input type="number" min="1" max="12" value={duration} onChange={e => setDuration(e.target.value)} className="login-input" style={{ padding: '10px 14px' }} required />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Priority</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {['low', 'medium', 'high'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            style={{
                                                flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, textTransform: 'capitalize', fontWeight: 600, cursor: 'pointer',
                                                border: priority === p ? `1px solid var(--accent-${p === 'high' ? 'red' : p === 'medium' ? 'amber' : 'green'})` : '1px solid rgba(255,255,255,0.1)',
                                                background: priority === p ? `var(--accent-${p === 'high' ? 'red' : p === 'medium' ? 'amber' : 'green'}-dim)` : 'rgba(255,255,255,0.02)',
                                                color: priority === p ? `var(--accent-${p === 'high' ? 'red' : p === 'medium' ? 'amber' : 'green'})` : 'var(--text-secondary)'
                                            }}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancel</button>
                            <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent-amber)', color: '#000', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                {loading ? <span className="login-spinner" style={{ width: 14, height: 14, borderColor: '#000', borderBottomColor: 'transparent' }} /> : 'Schedule Work'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
