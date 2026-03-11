import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UploadCloud, FileText, CheckCircle, AlertTriangle } from 'lucide-react'
import Papa from 'papaparse'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export default function BulkUploadModal({ isOpen, onClose, onUploadSuccess }) {
    const { user } = useAuth()
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState({ type: '', msg: '' })
    const fileInputRef = useRef(null)

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setStatus({ type: '', msg: '' })
        }
    }

    const handleUpload = () => {
        if (!file) {
            setStatus({ type: 'error', msg: 'Please select a CSV file first.' })
            return
        }

        setLoading(true)
        setStatus({ type: '', msg: '' })

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data
                if (data.length === 0) {
                    setStatus({ type: 'error', msg: 'File is empty or invalid format.' })
                    setLoading(false)
                    return
                }

                try {
                    // Map headers to DB columns
                    // Expecting basic headers like: Origin, Destination, Weight, Miles, PickupDate, DeliveryDate
                    const insertPayload = data.map(row => ({
                        origin: row.Origin || row.origin || 'Unknown',
                        destination: row.Destination || row.destination || 'Unknown',
                        weight: row.Weight || row.weight || '0',
                        miles: parseInt(row.Miles || row.miles) || 0,
                        pickup_number: row.PickupNumber || row.pickup_number || null,
                        status: 'Upcoming',
                        created_by: user?.id,
                        organization_id: user?.organization_id
                    }))

                    const { error } = await supabase.from('loads').insert(insertPayload)

                    if (error) throw error

                    setStatus({ type: 'success', msg: `Successfully imported ${data.length} loads!` })

                    setTimeout(() => {
                        setFile(null)
                        setStatus({ type: '', msg: '' })
                        if (fileInputRef.current) fileInputRef.current.value = ''
                        if (onUploadSuccess) onUploadSuccess()
                        onClose()
                    }, 1500)

                } catch (err) {
                    console.error('Import error:', err)
                    setStatus({ type: 'error', msg: err.message || 'Failed to import loads.' })
                } finally {
                    setLoading(false)
                }
            },
            error: (err) => {
                setLoading(false)
                setStatus({ type: 'error', msg: 'Failed to parse CSV file.' })
            }
        })
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
                            <UploadCloud size={18} color="var(--accent-blue)" />
                            Bulk Import Loads
                        </h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ padding: 20 }}>
                        {status.msg && (
                            <div style={{
                                background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 211, 168, 0.1)',
                                color: status.type === 'error' ? '#ef4444' : '#22d3a8',
                                padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8
                            }}>
                                {status.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                                {status.msg}
                            </div>
                        )}

                        <div
                            style={{
                                border: '2px dashed rgba(255,255,255,0.1)',
                                borderRadius: 12,
                                padding: '30px 20px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: 'rgba(255,255,255,0.02)',
                                transition: 'all 0.2s',
                                marginBottom: 20
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept=".csv"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />

                            {file ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                    <FileText size={32} color="var(--accent-blue)" />
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{file.name}</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                    <UploadCloud size={32} color="var(--text-tertiary)" />
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Click to select a CSV file</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Must contain headers: Origin, Destination, Weight, etc.</span>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancel</button>
                            <button
                                onClick={handleUpload}
                                disabled={loading || !file}
                                style={{
                                    padding: '10px 20px', borderRadius: 8, background: 'var(--accent-blue)', color: 'white', border: 'none',
                                    cursor: (loading || !file) ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                                    opacity: (loading || !file) ? 0.7 : 1
                                }}
                            >
                                {loading ? <span className="login-spinner" style={{ width: 14, height: 14, borderColor: '#fff', borderBottomColor: 'transparent' }} /> : 'Import Data'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
