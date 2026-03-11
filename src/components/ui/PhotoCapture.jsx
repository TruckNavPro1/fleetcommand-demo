/**
 * PhotoCapture — mobile-first photo submission component
 *
 * On iOS/Android: offers "Take Photo" (rear camera) + "Choose from Library"
 * On desktop: opens standard file picker
 *
 * Props:
 *   onCapture(file, previewUrl) — called when user picks/captures a photo
 *   label      — button label (default "Add Photo")
 *   multiple   — allow multiple photos (default false)
 *   context    — 'defect' | 'delivery' | 'bol' | 'damage' | 'general'
 *   maxSizeMB  — reject files larger than this (default 10)
 */

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, ImagePlus, X, CheckCircle, AlertCircle, Upload } from 'lucide-react'

const CONTEXT_LABELS = {
    defect: { icon: '🔧', label: 'Defect Photo', hint: 'Capture the issue clearly' },
    delivery: { icon: '📦', label: 'Delivery Confirm', hint: 'Photo proof of delivery' },
    bol: { icon: '📄', label: 'Bill of Lading', hint: 'Full document, good lighting' },
    damage: { icon: '⚠️', label: 'Damage Report', hint: 'Multiple angles recommended' },
    general: { icon: '📷', label: 'Photo', hint: '' },
}

export default function PhotoCapture({
    onCapture,
    label,
    multiple = false,
    context = 'general',
    maxSizeMB = 10,
}) {
    const inputCameraRef = useRef(null)
    const inputGalleryRef = useRef(null)
    const [previews, setPreviews] = useState([])
    const [error, setError] = useState('')
    const [showMenu, setShowMenu] = useState(false)

    const ctx = CONTEXT_LABELS[context] || CONTEXT_LABELS.general

    const processFiles = (files) => {
        setError('')
        const valid = []
        for (const file of files) {
            if (!file.type.startsWith('image/')) { setError('Only image files are supported.'); continue }
            if (file.size > maxSizeMB * 1024 * 1024) { setError(`File too large (max ${maxSizeMB}MB).`); continue }
            const url = URL.createObjectURL(file)
            valid.push({ file, url, name: file.name, size: (file.size / 1024).toFixed(0) + 'KB' })
            if (onCapture) onCapture(file, url)
        }
        setPreviews(p => multiple ? [...p, ...valid] : valid)
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length) processFiles(files)
        e.target.value = '' // reset so same file can be re-selected
        setShowMenu(false)
    }

    const removePreview = (idx) => {
        setPreviews(p => p.filter((_, i) => i !== idx))
    }

    return (
        <div style={{ marginBottom: 16 }}>
            {/* Trigger button */}
            <motion.button
                type="button"
                onClick={() => setShowMenu(s => !s)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 18px', borderRadius: 12, width: '100%',
                    border: '1px dashed rgba(59,142,243,0.4)',
                    background: 'rgba(59,142,243,0.06)',
                    cursor: 'pointer', transition: 'all 0.15s',
                }}
            >
                <Camera size={18} color="var(--accent-blue)" />
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)' }}>
                        {ctx.icon} {label || ctx.label}
                    </div>
                    {ctx.hint && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ctx.hint}</div>}
                </div>
                <Upload size={14} color="var(--text-tertiary)" style={{ marginLeft: 'auto' }} />
            </motion.button>

            {/* Hidden file inputs */}
            {/* Camera capture — uses rear camera on mobile (environment facing) */}
            <input
                ref={inputCameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple={multiple}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            {/* Gallery / file picker — no capture attribute so user can choose library */}
            <input
                ref={inputGalleryRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {/* Action menu dropdown */}
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            marginTop: 8, borderRadius: 12, overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(18,18,28,0.95)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => { inputCameraRef.current?.click() }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                                padding: '14px 18px', background: 'none', border: 'none',
                                cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.06)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            <Camera size={18} color="var(--accent-blue)" />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>Take Photo</div>
                                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Use rear camera</div>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => { inputGalleryRef.current?.click() }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                                padding: '14px 18px', background: 'none', border: 'none',
                                cursor: 'pointer', color: 'var(--text-primary)',
                            }}
                        >
                            <ImagePlus size={18} color="var(--accent-purple)" />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>Choose from Library</div>
                                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Photo Library / Files</div>
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error */}
            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--accent-red)', fontSize: 12 }}>
                    <AlertCircle size={13} /> {error}
                </div>
            )}

            {/* Previews */}
            {previews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginTop: 12 }}>
                    {previews.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <img
                                src={p.url}
                                alt={p.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                padding: '8px 6px 4px', fontSize: 9, color: 'rgba(255,255,255,0.8)',
                            }}>
                                {p.size}
                            </div>
                            <button
                                type="button"
                                onClick={() => removePreview(i)}
                                style={{
                                    position: 'absolute', top: 4, right: 4, width: 22, height: 22,
                                    borderRadius: '50%', background: 'rgba(239,68,68,0.85)',
                                    border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <X size={12} color="white" />
                            </button>
                            <div style={{ position: 'absolute', top: 4, left: 4 }}>
                                <CheckCircle size={14} color="var(--accent-green)" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
