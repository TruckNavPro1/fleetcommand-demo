import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import { Calendar, Clock, Wrench, CheckCircle, AlertTriangle, Plus } from 'lucide-react'
import AddWorkOrderModal from '../components/AddWorkOrderModal'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

const jobs = [
    { id: 'WO-1042', truck: 'TRK-004', type: 'Engine Repair (P0300)', tech: 'Ray Johnson', day: 'Mon', start: 7, dur: 4, priority: 'high', status: 'In Progress' },
    { id: 'WO-1041', truck: 'TRK-002', type: 'Tire Rotation', tech: 'Ray Johnson', day: 'Tue', start: 9, dur: 2, priority: 'medium', status: 'Scheduled' },
    { id: 'WO-1039', truck: 'TRK-001', type: 'Brake Inspection', tech: 'Ray Johnson', day: 'Tue', start: 13, dur: 3, priority: 'high', status: 'Scheduled' },
    { id: 'WO-1040', truck: 'TRK-006', type: 'Oil Change', tech: 'Mark Davis', day: 'Wed', start: 8, dur: 1, priority: 'low', status: 'Scheduled' },
    { id: 'WO-1038', truck: 'TRK-005', type: 'AC Repair', tech: 'Mark Davis', day: 'Wed', start: 10, dur: 3, priority: 'medium', status: 'Scheduled' },
    { id: 'WO-1044', truck: 'TRK-003', type: 'DOT Pre-Trip Inspection', tech: 'Ray Johnson', day: 'Thu', start: 7, dur: 2, priority: 'medium', status: 'Scheduled' },
    { id: 'WO-1043', truck: 'TRK-002', type: 'Brake Pad Replacement', tech: 'Mark Davis', day: 'Fri', start: 9, dur: 3, priority: 'high', status: 'Scheduled' },
]

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22d3a8' }
const TECHS = { 'Ray Johnson': '#3b8ef3', 'Mark Davis': '#a855f7' }

const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

export default function Schedule() {
    const [selectedJob, setSelectedJob] = useState(null)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [localJobs, setLocalJobs] = useState(jobs)

    const handleAddSuccess = (newJob) => {
        setLocalJobs([...localJobs, newJob])
    }

    return (
        <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
            <AddWorkOrderModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAddSuccess={handleAddSuccess} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Schedule</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Mechanic work schedule — Mar 10–16, 2026</p>
                </div>
                <button onClick={() => setIsAddOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, border: '1px solid var(--accent-blue)', background: 'rgba(59,142,243,0.1)', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    <Plus size={15} /> New Work Order
                </button>
            </div>

            {/* Technician legend */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {Object.entries(TECHS).map(([tech, color]) => (
                    <div key={tech} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 20, background: color + '15', border: `1px solid ${color}40` }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color }}>{tech}</span>
                    </div>
                ))}
                {Object.entries(PRIORITY_COLORS).map(([p, color]) => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p} priority</span>
                    </div>
                ))}
            </div>

            {/* Week grid */}
            <GlassCard style={{ padding: '0', overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: 700 }}>
                        {/* Day headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <div style={{ padding: '12px 8px' }} />
                            {DAYS.map(d => (
                                <div key={d} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{d}</div>
                            ))}
                        </div>
                        {/* Hour rows */}
                        {HOURS.map((hr, hi) => (
                            <div key={hr} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.04)', minHeight: 48 }}>
                                <div style={{ padding: '8px', fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'right', paddingRight: 10 }}>{hr}</div>
                                {DAYS.map((day, di) => {
                                    const slot = localJobs.filter(j => j.day === day && j.start === (hi + 7))
                                    return (
                                        <div key={day} style={{ padding: '2px 4px', position: 'relative' }}>
                                            {slot.map(job => (
                                                <motion.div key={job.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                                                    style={{
                                                        padding: '5px 8px', borderRadius: 8, cursor: 'pointer',
                                                        background: TECHS[job.tech] + '22',
                                                        border: `1px solid ${PRIORITY_COLORS[job.priority]}50`,
                                                        borderLeft: `3px solid ${PRIORITY_COLORS[job.priority]}`,
                                                    }}>
                                                    <div style={{ fontSize: 10, fontWeight: 700, color: TECHS[job.tech], marginBottom: 1 }}>{job.truck}</div>
                                                    <div style={{ fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.3 }}>{job.type}</div>
                                                    <div style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{job.dur}h</div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </GlassCard>

            {/* Selected job detail */}
            {selectedJob && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <GlassCard style={{ padding: '18px 22px', border: `1px solid ${PRIORITY_COLORS[selectedJob.priority]}40` }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: TECHS[selectedJob.tech] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Wrench size={20} color={TECHS[selectedJob.tech]} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{selectedJob.type}</div>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-secondary)' }}>
                                    <span>🚛 {selectedJob.truck}</span>
                                    <span>👷 {selectedJob.tech}</span>
                                    <span>📅 {selectedJob.day} · {HOURS[selectedJob.start - 7]} · {selectedJob.dur}h</span>
                                    <span>🔖 {selectedJob.id}</span>
                                </div>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: selectedJob.status === 'In Progress' ? '#22d3a8' : '#3b8ef3', background: selectedJob.status === 'In Progress' ? 'rgba(34,211,168,0.1)' : 'rgba(59,142,243,0.1)', padding: '4px 10px', borderRadius: 8 }}>
                                {selectedJob.status}
                            </span>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Queue list */}
            <div style={{ marginTop: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>All Work Orders This Week</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                    {localJobs.map(job => (
                        <div key={job.id} style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${PRIORITY_COLORS[job.priority]}25` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: PRIORITY_COLORS[job.priority] }} />
                                <span style={{ fontSize: 12, fontWeight: 700 }}>{job.id} · {job.truck}</span>
                                <span style={{ marginLeft: 'auto', fontSize: 10, color: TECHS[job.tech] }}>{job.tech.split(' ')[0]}</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{job.type}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>{job.day} · {HOURS[job.start - 7]} · {job.dur}h</div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
