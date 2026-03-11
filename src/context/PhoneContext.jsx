import { createContext, useContext, useState, useEffect } from 'react'

const PhoneContext = createContext({})

export function PhoneProvider({ children }) {
    const [isDialerOpen, setIsDialerOpen] = useState(false)
    const [activeCall, setActiveCall] = useState(null)
    const [callDuration, setCallDuration] = useState(0)

    // Timer for active call
    useEffect(() => {
        let interval
        if (activeCall?.status === 'connected') {
            interval = setInterval(() => setCallDuration(d => d + 1), 1000)
        } else {
            setCallDuration(0)
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [activeCall?.status])

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0')
        const s = (secs % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    const openDialer = () => setIsDialerOpen(true)
    const closeDialer = () => setIsDialerOpen(false)

    const makeCall = (number, name = 'Unknown Caller') => {
        setIsDialerOpen(true)
        setActiveCall({
            id: Date.now().toString(),
            number,
            name,
            status: 'dialing', // dialing, ringing, connected, ended
            direction: 'outbound'
        })

        // Simulate network connection flow
        setTimeout(() => {
            setActiveCall(prev => prev ? { ...prev, status: 'ringing' } : null)
        }, 800)

        setTimeout(() => {
            setActiveCall(prev => prev?.status !== 'ended' ? { ...prev, status: 'connected' } : null)
        }, 3500)
    }

    const endCall = () => {
        setActiveCall(prev => prev ? { ...prev, status: 'ended' } : null)
        setTimeout(() => {
            setActiveCall(null)
            setIsDialerOpen(false)
        }, 1500)
    }

    const toggleMute = () => {
        setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null)
    }

    return (
        <PhoneContext.Provider value={{
            isDialerOpen,
            openDialer,
            closeDialer,
            activeCall,
            makeCall,
            endCall,
            callDuration,
            formatDuration,
            toggleMute
        }}>
            {children}
        </PhoneContext.Provider>
    )
}

export const usePhone = () => useContext(PhoneContext)
