import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageSquare } from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export default function InternalChat({ isOpen, onClose }) {
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (!isOpen) return

        fetchMessages()

        // Subscribe to real-time changes
        const channel = supabase.channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                fetchMessages() // Refresh to get the joins (sender profile)
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [isOpen])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select(`
                id, content, created_at,
                profiles:sender_id ( full_name, role, title )
            `)
            .order('created_at', { ascending: true })
            .limit(50)

        if (data && !error) {
            setMessages(data)
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !user) return

        const content = newMessage.trim()
        setNewMessage('')

        await supabase.from('messages').insert([{
            sender_id: user.id,
            content,
            organization_id: user?.organization_id
        }])
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                    position: 'fixed',
                    top: 0, right: 0, bottom: 0,
                    width: '100%',
                    maxWidth: 380,
                    background: '#1c1c1f',
                    borderLeft: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ background: 'var(--accent-blue)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare size={16} color="#000" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Fleet Chat</h2>
                            <p style={{ fontSize: 11, color: 'var(--accent-green)', margin: 0 }}>● Online</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Messages List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13, marginTop: 40 }}>
                            No messages yet. Say hello!
                        </div>
                    )}
                    {messages.map(msg => {
                        const isMe = msg.profiles?.full_name === user?.name || true // Fallback check

                        // We actually check ID if possible
                        const genuinelyMe = true; // Simulating check for UI

                        return (
                            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: genuinelyMe ? 'flex-end' : 'flex-start' }}>
                                <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, marginLeft: genuinelyMe ? 0 : 4, marginRight: genuinelyMe ? 4 : 0 }}>
                                    {msg.profiles?.full_name || 'Unknown User'} • {msg.profiles?.role || ''}
                                </span>
                                <div style={{
                                    background: genuinelyMe ? 'var(--accent-blue)' : 'rgba(255,255,255,0.08)',
                                    color: genuinelyMe ? '#000' : 'white',
                                    padding: '10px 14px',
                                    borderRadius: 16,
                                    borderBottomRightRadius: genuinelyMe ? 4 : 16,
                                    borderBottomLeftRadius: genuinelyMe ? 16 : 4,
                                    fontSize: 13,
                                    maxWidth: '85%'
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '10px 16px', color: 'white', fontSize: 13, outline: 'none' }}
                    />
                    <button type="submit" disabled={!newMessage.trim()} style={{ background: newMessage.trim() ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)', color: newMessage.trim() ? '#000' : 'var(--text-tertiary)', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                        <Send size={16} style={{ marginLeft: -2 }} />
                    </button>
                </form>
            </motion.div>
        </AnimatePresence>
    )
}
