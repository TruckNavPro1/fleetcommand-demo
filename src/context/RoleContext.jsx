import { createContext, useContext, useState } from 'react'

const RoleContext = createContext(null)

export const roles = {
    office: { label: 'Office Staff', color: '#3b8ef3', initials: 'OS', name: 'Sarah Mitchell' },
    driver: { label: 'Driver', color: '#22d3a8', initials: 'DK', name: 'Dave Kowalski' },
    mechanic: { label: 'Mechanic', color: '#f59e0b', initials: 'RJ', name: 'Ray Johnson' },
}

export function RoleProvider({ children }) {
    const [role, setRole] = useState('office')
    return (
        <RoleContext.Provider value={{ role, setRole, roleInfo: roles[role] }}>
            {children}
        </RoleContext.Provider>
    )
}

export const useRole = () => useContext(RoleContext)
