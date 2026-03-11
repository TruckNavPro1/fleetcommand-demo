import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneOff, Mic, MicOff, Hash, X, Delete, PhoneCall, Disc } from 'lucide-react'
import { usePhone } from '../context/PhoneContext'

export default function PhoneDialer() {
    const { isDialerOpen, closeDialer, activeCall, makeCall, endCall, callDuration, formatDuration, toggleMute } = usePhone()
    const [dialDigits, setDialDigits] = useState('')

    const handleDigitClick = (digit) => {
        if (dialDigits.length < 15) {
            setDialDigits(prev => prev + digit)
        }
    }

    const handleBackspace = () => {
        setDialDigits(prev => prev.slice(0, -1))
    }

    if (!isDialerOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                    position: 'fixed', bottom: 24, right: 24, width: 320,
                    background: '#121214', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 9999, overflow: 'hidden',
                    display: 'flex', flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PhoneCall size={16} color="var(--accent-blue)" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Fleet Dialer</span>
                    </div>
                    <button onClick={closeDialer} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                {activeCall ? (
                    /* Active Call View */
                    <div style={{ padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' }}>
                            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-blue)' }}>
                                {activeCall.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                            {activeCall.status === 'ringing' && (
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid var(--accent-blue)' }}
                                />
                            )}
                        </div>

                        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, textAlign: 'center', color: 'white' }}>{activeCall.name}</h2>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontFamily: 'var(--font-display)' }}>{activeCall.number}</div>

                        <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: activeCall.status === 'ended' ? 'var(--accent-red)' : activeCall.status === 'connected' ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                            {activeCall.status === 'dialing' && 'Calling...'}
                            {activeCall.status === 'ringing' && 'Ringing...'}
                            {activeCall.status === 'connected' && formatDuration(callDuration)}
                            {activeCall.status === 'ended' && 'Call Ended'}
                        </div>

                        <div style={{ display: 'flex', gap: 16, marginTop: 40, width: '100%', justifyContent: 'center' }}>
                            <button
                                onClick={toggleMute}
                                disabled={activeCall.status === 'ended'}
                                style={{
                                    width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: activeCall.status === 'ended' ? 'default' : 'pointer',
                                    background: activeCall.isMuted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                                    color: activeCall.isMuted ? 'white' : 'var(--text-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                }}
                            >
                                {activeCall.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                            <button
                                onClick={endCall}
                                disabled={activeCall.status === 'ended'}
                                style={{
                                    width: 64, height: 64, borderRadius: '50%', border: 'none', cursor: activeCall.status === 'ended' ? 'default' : 'pointer',
                                    background: activeCall.status === 'ended' ? 'rgba(239, 68, 68, 0.4)' : '#ef4444', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', marginTop: -6,
                                    boxShadow: activeCall.status === 'ended' ? 'none' : '0 10px 20px rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                <PhoneOff size={24} />
                            </button>
                            <button
                                disabled={activeCall.status === 'ended'}
                                style={{
                                    width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: activeCall.status === 'ended' ? 'default' : 'pointer',
                                    background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                }}
                            >
                                <Hash size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Dialpad View */
                    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 60, marginBottom: 20 }}>
                            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.05em', color: dialDigits ? 'white' : 'var(--text-tertiary)', wordBreak: 'break-all', textAlign: 'center' }}>
                                {dialDigits || 'Enter Number'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 16px', marginBottom: 24 }}>
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(digit => (
                                <button
                                    key={digit}
                                    onClick={() => handleDigitClick(digit)}
                                    style={{
                                        aspectRatio: '1', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.04)',
                                        color: 'white', fontSize: 24, fontWeight: 500, fontFamily: 'var(--font-display)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                        transition: 'background 0.1s'
                                    }}
                                    onMouseDown={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseUp={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                >
                                    {digit}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                            <div style={{ width: 44 }} /> {/* Spacer */}
                            <button
                                onClick={() => dialDigits && makeCall(dialDigits, 'Unknown Caller')}
                                disabled={!dialDigits}
                                style={{
                                    width: 64, height: 64, borderRadius: '50%', border: 'none', cursor: dialDigits ? 'pointer' : 'not-allowed',
                                    background: dialDigits ? '#22d3a8' : 'rgba(34, 211, 168, 0.4)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                    boxShadow: dialDigits ? '0 10px 20px rgba(34, 211, 168, 0.3)' : 'none'
                                }}
                            >
                                <Phone size={24} style={{ fill: 'currentColor' }} />
                            </button>
                            <button
                                onClick={handleBackspace}
                                disabled={!dialDigits}
                                style={{
                                    width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'none',
                                    color: dialDigits ? 'var(--text-secondary)' : 'transparent', cursor: dialDigits ? 'pointer' : 'default',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Delete size={24} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
