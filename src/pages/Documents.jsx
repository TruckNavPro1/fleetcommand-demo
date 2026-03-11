import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import PhotoCapture from '../components/ui/PhotoCapture'
import { FileText, Download, Upload, CheckCircle, Clock, AlertTriangle, Search } from 'lucide-react'

const documents = [
    { id: 1, name: 'Commercial Drivers License', type: 'License', expires: 'Dec 14, 2027', status: 'valid', fileType: 'PDF', size: '1.2 MB', updated: 'Jan 2026' },
    { id: 2, name: 'Medical Certificate', type: 'Medical', expires: 'Jun 30, 2026', status: 'valid', fileType: 'PDF', size: '0.8 MB', updated: 'Jul 2025' },
    { id: 3, name: 'HazMat Endorsement', type: 'Endorsement', expires: 'Dec 14, 2027', status: 'valid', fileType: 'PDF', size: '0.5 MB', updated: 'Jan 2026' },
    { id: 4, name: 'Annual Vehicle Inspection — TRK-001', type: 'Inspection', expires: 'Mar 15, 2026', status: 'expiring', fileType: 'PDF', size: '2.1 MB', updated: 'Mar 2025' },
    { id: 5, name: 'BOL — Load LD-9823', type: 'BOL', expires: 'N/A', status: 'valid', fileType: 'PDF', size: '0.3 MB', updated: 'Mar 5, 2026' },
    { id: 6, name: 'Proof of Delivery — LD-9801', type: 'POD', expires: 'N/A', status: 'valid', fileType: 'JPG', size: '1.8 MB', updated: 'Feb 28, 2026' },
    { id: 7, name: 'IFTA Quarterly Report Q4 2025', type: 'Tax', expires: 'N/A', status: 'valid', fileType: 'PDF', size: '0.9 MB', updated: 'Jan 2026' },
    { id: 8, name: 'Pre-Trip Inspection — Mar 5', type: 'Inspection', expires: 'N/A', status: 'valid', fileType: 'PDF', size: '0.4 MB', updated: 'Mar 5, 2026' },
]

const STATUS = {
    valid: { color: '#22d3a8', icon: CheckCircle, label: 'Valid' },
    expiring: { color: '#f59e0b', icon: Clock, label: 'Expiring' },
    expired: { color: '#ef4444', icon: AlertTriangle, label: 'Expired' },
}

const TYPE_COLORS = { License: '#3b8ef3', Medical: '#22d3a8', Endorsement: '#a855f7', Inspection: '#f59e0b', BOL: '#6366f1', POD: '#ec4899', Tax: '#14b8a6' }

const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

export default function Documents() {
    const [search, setSearch] = useState('')
    const [showUpload, setShowUpload] = useState(false)

    const filtered = documents.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.type.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Documents</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Licenses, BOLs, inspection reports, and compliance docs</p>
                </div>
                <button onClick={() => setShowUpload(s => !s)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, border: '1px solid var(--accent-blue)', background: 'rgba(59,142,243,0.1)', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    <Upload size={15} /> Upload Doc
                </button>
            </div>

            {showUpload && (
                <GlassCard style={{ padding: '20px 24px', marginBottom: 20, border: '1px solid rgba(59,142,243,0.25)' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📎 Upload New Document</div>
                    <PhotoCapture context="general" label="Scan or Photo of Document" multiple />
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                        <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'var(--accent-blue)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Submit</button>
                        <button onClick={() => setShowUpload(false)} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                    </div>
                </GlassCard>
            )}

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..."
                    style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Expiring notice */}
            {documents.some(d => d.status === 'expiring') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', marginBottom: 16 }}>
                    <Clock size={15} color="#f59e0b" />
                    <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>Annual Vehicle Inspection expires in 9 days — renew with Ray Johnson</span>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map((doc, i) => {
                    const s = STATUS[doc.status]
                    const typeColor = TYPE_COLORS[doc.type] || '#6366f1'
                    return (
                        <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                            <GlassCard style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: typeColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FileText size={18} color={typeColor} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{doc.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                        {doc.type} · {doc.fileType} · {doc.size} · Updated {doc.updated}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginBottom: 4 }}>
                                        <s.icon size={12} color={s.color} />
                                        <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</span>
                                    </div>
                                    {doc.expires !== 'N/A' && (
                                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Exp: {doc.expires}</div>
                                    )}
                                </div>
                                <button style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <Download size={14} />
                                </button>
                            </GlassCard>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    )
}
