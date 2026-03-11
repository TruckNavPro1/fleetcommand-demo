import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { askAI } from '../services/aiService'

export default function AIChatDrawer({ isOpen, onClose }) {
    const { user } = useAuth()
    const [messages, setMessages] = useState([
        { id: 0, sender: 'ai', content: "Hello! I am your FleetCommand AI. How can I assist you with your fleet today?" }
    ])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (isOpen) {
            scrollToBottom()
        }
    }, [messages, isOpen])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || loading) return

        const userMsg = { id: Date.now(), sender: 'user', content: newMessage.trim() }
        setMessages(prev => [...prev, userMsg])
        setNewMessage('')
        setLoading(true)

        try {
            const aiResponse = await askAI(userMsg.content, user)
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', content: aiResponse }])
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', content: `⚠️ Error: ${error.message}` }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 900, backdropFilter: 'blur(2px)' }}
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, maxWidth: '100%',
                            background: '#121214', borderLeft: '1px solid rgba(255,255,255,0.08)', zIndex: 1000,
                            display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 40px rgba(0,0,0,0.3)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles size={18} color="var(--accent-purple)" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, padding: 0 }}>Fleet AI Copilot</h3>
                                    <div style={{ fontSize: 12, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)' }} />
                                        Online & connected to fleet data
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages List */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender === 'user'
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ display: 'flex', gap: 12, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-start' }}
                                    >
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                            background: isMe ? 'rgba(255,255,255,0.1)' : 'var(--accent-purple-dim)',
                                            color: isMe ? 'white' : 'var(--accent-purple)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {isMe ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div style={{
                                            background: isMe ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                                            padding: '12px 16px', borderRadius: 16,
                                            borderTopRightRadius: isMe ? 4 : 16,
                                            borderTopLeftRadius: !isMe ? 4 : 16,
                                            fontSize: 14, lineHeight: 1.5, color: '#fff',
                                            maxWidth: '80%', wordBreak: 'break-word', whiteSpace: 'pre-wrap'
                                        }}>
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                )
                            })}

                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
                                >
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Loader2 size={16} color="var(--accent-purple)" className="spin" />
                                    </div>
                                    <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, borderTopLeftRadius: 4, display: 'flex', gap: 4, alignItems: 'center' }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Analyzing fleet data...</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} style={{ height: 1 }} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#121214' }}>
                            <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, position: 'relative' }}>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Ask about loads, drivers, or rules..."
                                    disabled={loading}
                                    style={{
                                        flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff', padding: '14px 44px 14px 16px', borderRadius: 12, fontSize: 14,
                                        outline: 'none', transition: 'all 0.2s',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || loading}
                                    style={{
                                        position: 'absolute', right: 6, top: 6, bottom: 6,
                                        background: newMessage.trim() ? 'var(--accent-purple)' : 'transparent',
                                        color: newMessage.trim() ? '#fff' : 'var(--text-tertiary)',
                                        border: 'none', borderRadius: 8, padding: '0 12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: newMessage.trim() ? 'pointer' : 'default',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Send size={16} style={{ marginLeft: 2 }} />
                                </button>
                            </form>
                            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 12 }}>
                                AI may hallucinate data. Verify critical information.
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
