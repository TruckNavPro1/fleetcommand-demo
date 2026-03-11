import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, ShieldAlert } from 'lucide-react'

export default function AddDriverModal({ isOpen, onClose }) {
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
                            <Users size={18} color="var(--accent-blue)" />
                            Add New Driver
                        </h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ padding: 24 }}>
                        <div style={{ display: 'flex', gap: 14, background: 'rgba(59, 142, 243, 0.1)', border: '1px solid rgba(59, 142, 243, 0.3)', padding: 16, borderRadius: 12 }}>
                            <ShieldAlert size={24} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 6 }}>Security Notice</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                    Because FleetCommand uses secure role-based authentication, all new staff and drivers must be created inside your <strong>Supabase Authentication Dashboard</strong>.
                                </p>
                            </div>
                        </div>

                        <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 20, paddingLeft: 20 }}>
                            <li>Log into Supabase and open the <strong>Authentication</strong> tab.</li>
                            <li>Click <strong>Add User</strong> -> <strong>Invite User</strong> and enter their email.</li>
                            <li>Once their account is created, they will automatically be synced to the database.</li>
                            <li>A manager can then assign their "Driver" role in the <code>profiles</code> table.</li>
                        </ul>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent-blue)', color: '#000', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                                Understood
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
