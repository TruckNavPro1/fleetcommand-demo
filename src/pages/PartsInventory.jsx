import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import StatWidget from '../components/ui/StatWidget'
import { Package, AlertTriangle, Search, ShoppingCart, CheckCircle, RefreshCw, Plus, Minus } from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'

const parts = [
    { id: 'BP-001', name: 'Brake Pads (Front — Freightliner)', category: 'Brakes', stock: 2, min: 5, unit: 'sets', cost: '$89.00', supplier: 'International Parts Co.' },
    { id: 'OF-002', name: 'Engine Oil Filter (Cummins ISX)', category: 'Engine', stock: 4, min: 10, unit: 'units', cost: '$18.50', supplier: 'FleetPro Supply' },
    { id: 'AF-003', name: 'Air Filter (Caterpillar C15)', category: 'Engine', stock: 1, min: 4, unit: 'units', cost: '$42.00', supplier: 'International Parts Co.' },
    { id: 'CF-004', name: 'Coolant Fluid (OAT)', category: 'Coolant', stock: 8, min: 12, unit: 'liters', cost: '$12.00/L', supplier: 'FleetPro Supply' },
    { id: 'TR-005', name: 'Rear Light Bulb Assembly', category: 'Electrical', stock: 6, min: 4, unit: 'units', cost: '$28.00', supplier: 'TruckLite' },
    { id: 'WP-006', name: 'Windshield Wiper Blade 24"', category: 'Exterior', stock: 12, min: 6, unit: 'units', cost: '$14.50', supplier: 'FleetPro Supply' },
    { id: 'MO-007', name: 'Mobil Delvac 15W-40 (Quart)', category: 'Engine', stock: 24, min: 20, unit: 'qts', cost: '$9.00', supplier: 'WEX Fleet' },
    { id: 'TH-008', name: 'Thermostat (Cummins)', category: 'Cooling', stock: 2, min: 2, unit: 'units', cost: '$65.00', supplier: 'International Parts Co.' },
    { id: 'FS-009', name: 'Fuel Filter (Racor)', category: 'Fuel', stock: 5, min: 8, unit: 'units', cost: '$38.00', supplier: 'FleetPro Supply' },
    { id: 'SP-010', name: 'Spark Plug Set (Peterbilt 579)', category: 'Engine', stock: 3, min: 4, unit: 'sets', cost: '$72.00', supplier: 'Peterbilt Direct' },
    { id: 'BP-011', name: 'Brake Shoes (Rear)', category: 'Brakes', stock: 6, min: 4, unit: 'pairs', cost: '$120.00', supplier: 'International Parts Co.' },
    { id: 'HB-012', name: 'Hunter (Wheel Nuts)', category: 'Wheels', stock: 48, min: 24, unit: 'units', cost: '$4.50', supplier: 'FleetPro Supply' },
]

const CATEGORIES = ['All', ...Array.from(new Set(parts.map(p => p.category)))]
const CAT_COLORS = { Brakes: '#ef4444', Engine: '#3b8ef3', Coolant: '#22d3a8', Electrical: '#f59e0b', Exterior: '#a855f7', Cooling: '#6366f1', Fuel: '#ec4899', Wheels: '#14b8a6' }

const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

export default function PartsInventory() {
    const { user } = useAuth()
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [cart, setCart] = useState([])
    const [partsList, setPartsList] = useState([])
    const [loading, setLoading] = useState(true)

    // Dynamic categories based on fetched list
    const CATEGORIES = ['All', ...Array.from(new Set(partsList.map(p => p.category)))]

    useEffect(() => {
        if (!user) return

        const fetchParts = async () => {
            setLoading(true)

            if (user.isDemo) {
                setPartsList(parts) // Use the local mock `const parts` above
                setLoading(false)
                return
            }

            if (!user.organization_id) {
                setLoading(false)
                return
            }

            try {
                const { data, error } = await supabase
                    .from('parts_inventory')
                    .select('*')
                    .eq('organization_id', user.organization_id)
                    .order('name')

                if (error) throw error

                if (data.length === 0) {
                    setPartsList([])
                } else {
                    setPartsList(data)
                }
            } catch (err) {
                console.error("Error fetching parts:", err)
                toast.error("Failed to load parts inventory.")
            } finally {
                setLoading(false)
            }
        }

        fetchParts()
    }, [user])

    const lowStock = partsList.filter(p => p.stock < p.min_stock).length
    const critical = partsList.filter(p => p.stock === 0).length
    const totalParts = partsList.reduce((s, p) => s + p.stock, 0)

    const filtered = partsList
        .filter(p => category === 'All' || p.category === category)
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))

    const inCart = id => cart.includes(id)
    const toggleCart = id => setCart(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id])

    const adjustStock = (id, amount) => {
        setPartsList(partsList.map(p =>
            p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p
        ))
    }

    const syncSoftware = async () => {
        const loadingToast = toast.loading("Connecting to company ERP...")
        // Fake latency
        setTimeout(() => {
            toast.success("Inventory synced with NAPA / Local ERP successfully (Demo).", { id: loadingToast })
        }, 1800)
    }

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Parts Inventory</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Stock levels and parts ordering</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={syncSoftware}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                    >
                        <RefreshCw size={15} /> Sync Software
                    </button>
                    {cart.length > 0 && (
                        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, border: '1px solid var(--accent-green)', background: 'rgba(34,211,168,0.1)', color: 'var(--accent-green)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                            <ShoppingCart size={15} /> Order {cart.length} part{cart.length > 1 ? 's' : ''}
                        </button>
                    )}
                </div>
            </div>

            <div className="stat-grid" style={{ marginBottom: 20 }}>
                <StatWidget label="Total Stock Items" value={loading ? '-' : totalParts} sub={`${partsList.length} part types`} icon={Package} accent="blue" />
                <StatWidget label="Low Stock" value={loading ? '-' : lowStock} sub="Below minimum level" icon={AlertTriangle} accent="amber" />
                <StatWidget label="Out of Stock" value={loading ? '-' : critical} sub="Order immediately" icon={AlertTriangle} accent="red" />
                <StatWidget label="Pending Orders" value={3} sub="ETA 1–3 business days" icon={ShoppingCart} accent="purple" />
            </div>

            {/* Low stock banner */}
            {lowStock > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', marginBottom: 16 }}>
                    <AlertTriangle size={15} color="#f59e0b" />
                    <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>{lowStock} items below minimum stock — select and click Order Parts</span>
                </div>
            )}

            {/* Search + filter */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parts..."
                        style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)} style={{
                        padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        border: `1px solid ${category === cat ? (CAT_COLORS[cat] || 'var(--accent-blue)') + '60' : 'rgba(255,255,255,0.08)'}`,
                        background: category === cat ? (CAT_COLORS[cat] || 'var(--accent-blue)') + '15' : 'rgba(255,255,255,0.03)',
                        color: category === cat ? (CAT_COLORS[cat] || 'var(--accent-blue)') : 'var(--text-secondary)',
                    }}>{cat}</button>
                ))}
            </div>

            <GlassCard style={{ padding: 0, overflowX: 'auto' }}>
                <table className="data-table" style={{ padding: 0 }}>
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: 16 }}></th>
                            <th>Part #</th><th>Name</th><th>Category</th><th>Stock</th><th>Min</th><th>Unit Cost</th><th>Supplier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40 }}><LoadingSpinner /></td></tr>
                        ) : filtered.map(p => {
                            const isLow = p.stock < p.min_stock
                            const catColor = CAT_COLORS[p.category] || '#6366f1'
                            return (
                                <tr key={p.id} style={{ background: inCart(p.id) ? 'rgba(34,211,168,0.06)' : undefined }}>
                                    <td style={{ paddingLeft: 16, width: 32 }}>
                                        <button onClick={() => toggleCart(p.id)} style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${inCart(p.id) ? '#22d3a8' : 'rgba(255,255,255,0.15)'}`, background: inCart(p.id) ? 'rgba(34,211,168,0.2)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {inCart(p.id) && <CheckCircle size={12} color="#22d3a8" />}
                                        </button>
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }}>{p.id}</td>
                                    <td style={{ fontSize: 12, maxWidth: 220 }}>{p.name}</td>
                                    <td>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: catColor, background: catColor + '18', padding: '2px 8px', borderRadius: 8 }}>{p.category}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <button
                                                onClick={() => adjustStock(p.id, -1)}
                                                style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span style={{ fontWeight: 800, color: isLow ? '#ef4444' : '#22d3a8', fontSize: 14, minWidth: 20, textAlign: 'center' }}>{p.stock}</span>
                                            <button
                                                onClick={() => adjustStock(p.id, 1)}
                                                style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{p.min_stock}</td>
                                    <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{p.cost}</td>
                                    <td style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.supplier}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </GlassCard>
        </motion.div>
    )
}
