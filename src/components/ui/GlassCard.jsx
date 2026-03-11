import { useEffect, useRef, useState } from 'react'

export default function GlassCard({ children, className = '', style = {}, glow }) {
    const glowStyle = glow ? { boxShadow: `var(--glass-glow-${glow}), var(--glass-shadow)` } : {}
    return (
        <div className={`glass-card ${className}`} style={{ ...glowStyle, ...style }}>
            {children}
        </div>
    )
}
