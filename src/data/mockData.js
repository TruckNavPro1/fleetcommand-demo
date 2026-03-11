export const mockFleet = [
    { id: 'TRK-001', driver: 'Dave Kowalski', status: 'active', route: 'Chicago → Dallas', progress: 68, fuel: 72, lat: 39.1, lng: -94.6, lastUpdate: '2m ago' },
    { id: 'TRK-002', driver: 'Mike Torres', status: 'active', route: 'Houston → Denver', progress: 42, fuel: 58, lat: 36.2, lng: -99.1, lastUpdate: '5m ago' },
    { id: 'TRK-003', driver: 'Linda Shaw', status: 'rest', route: 'Los Angeles → Phoenix', progress: 85, fuel: 45, lat: 34.3, lng: -116.3, lastUpdate: '12m ago' },
    { id: 'TRK-004', driver: 'Tom Bradley', status: 'maintenance', route: 'N/A', progress: 0, fuel: 90, lat: 41.8, lng: -87.7, lastUpdate: 'In Shop' },
    { id: 'TRK-005', driver: 'Carlos Rivera', status: 'active', route: 'Atlanta → Miami', progress: 25, fuel: 85, lat: 31.5, lng: -84.1, lastUpdate: '1m ago' },
    { id: 'TRK-006', driver: 'Amy Chen', status: 'idle', route: 'Awaiting Dispatch', progress: 0, fuel: 95, lat: 33.7, lng: -84.4, lastUpdate: '30m ago' },
]

export const mockWorkOrders = [
    { id: 'WO-1042', truck: 'TRK-004', type: 'Engine Check', priority: 'high', tech: 'Ray Johnson', eta: '2h', status: 'In Progress' },
    { id: 'WO-1041', truck: 'TRK-002', type: 'Tire Rotation', priority: 'medium', tech: 'Ray Johnson', eta: '4h', status: 'Scheduled' },
    { id: 'WO-1040', truck: 'TRK-006', type: 'Oil Change', priority: 'low', tech: 'Mark Davis', eta: 'Tomorrow', status: 'Pending' },
    { id: 'WO-1039', truck: 'TRK-001', type: 'Brake Inspection', priority: 'high', tech: 'Ray Johnson', eta: '6h', status: 'Scheduled' },
    { id: 'WO-1038', truck: 'TRK-005', type: 'AC Repair', priority: 'medium', tech: 'Mark Davis', eta: '2d', status: 'Pending' },
]

export const mockLoads = [
    { id: 'LD-9823', origin: 'Chicago, IL', dest: 'Dallas, TX', weight: '42,000 lbs', miles: 920, pickup: 'Mar 5, 08:00', delivery: 'Mar 6, 18:00', status: 'In Transit' },
    { id: 'LD-9831', origin: 'Dallas, TX', dest: 'Houston, TX', weight: '38,500 lbs', miles: 239, pickup: 'Mar 7, 09:00', delivery: 'Mar 7, 14:00', status: 'Upcoming' },
    { id: 'LD-9844', origin: 'Houston, TX', dest: 'Memphis, TN', weight: '41,200 lbs', miles: 567, pickup: 'Mar 8, 07:30', delivery: 'Mar 9, 11:00', status: 'Upcoming' },
]

export const mockAlerts = [
    { id: 1, type: 'critical', msg: 'TRK-004 engine fault code P0300', time: '3m ago' },
    { id: 2, type: 'warning', msg: 'TRK-003 HOS limit in 45 minutes', time: '8m ago' },
    { id: 3, type: 'info', msg: 'Load LD-9831 pickup confirmed', time: '22m ago' },
    { id: 4, type: 'warning', msg: 'TRK-002 fuel below 60%', time: '35m ago' },
]

export const mockActivity = [
    { icon: '🟢', title: 'TRK-001 departed Chicago', desc: 'Dave Kowalski – Load LD-9823 en route', time: '2m ago', color: '#22d3a8' },
    { icon: '🔧', title: 'WO-1042 opened', desc: 'Engine fault – TRK-004 in Bay 2', time: '14m ago', color: '#f59e0b' },
    { icon: '📦', title: 'Load LD-9831 assigned', desc: 'Mike Torres – Dallas → Houston', time: '28m ago', color: '#3b8ef3' },
    { icon: '⛽', title: 'Fuel stop logged', desc: 'TRK-003 – Barstow, CA – 87 gal', time: '41m ago', color: '#a855f7' },
    { icon: '✅', title: 'WO-1037 completed', desc: 'TRK-006 oil change – signed off', time: '1h ago', color: '#22d3a8' },
]

export const fuelData = [
    { day: 'Mon', cost: 2840 }, { day: 'Tue', cost: 3100 }, { day: 'Wed', cost: 2720 },
    { day: 'Thu', cost: 3450 }, { day: 'Fri', cost: 3200 }, { day: 'Sat', cost: 2100 }, { day: 'Sun', cost: 1850 },
]

export const maintenanceData = [
    { month: 'Oct', scheduled: 8, unscheduled: 2 },
    { month: 'Nov', scheduled: 10, unscheduled: 3 },
    { month: 'Dec', scheduled: 7, unscheduled: 1 },
    { month: 'Jan', scheduled: 9, unscheduled: 4 },
    { month: 'Feb', scheduled: 11, unscheduled: 2 },
    { month: 'Mar', scheduled: 6, unscheduled: 1 },
]

export const dispatchData = [
    { day: 'Mon', loads: 12 }, { day: 'Tue', loads: 15 }, { day: 'Wed', loads: 10 },
    { day: 'Thu', loads: 18 }, { day: 'Fri', loads: 14 }, { day: 'Sat', loads: 8 }, { day: 'Sun', loads: 5 },
]

export const vehicleHealth = [
    { id: 'TRK-001', health: 92, engine: 'Good', brakes: 'Good', tires: 'Good', oil: 'Good' },
    { id: 'TRK-002', health: 78, engine: 'Good', brakes: 'Service Soon', tires: 'Good', oil: 'Good' },
    { id: 'TRK-003', health: 85, engine: 'Good', brakes: 'Good', tires: 'Service Soon', oil: 'Good' },
    { id: 'TRK-004', health: 34, engine: 'FAULT', brakes: 'Good', tires: 'Good', oil: 'Low' },
    { id: 'TRK-005', health: 90, engine: 'Good', brakes: 'Good', tires: 'Good', oil: 'Good' },
    { id: 'TRK-006', health: 88, engine: 'Good', brakes: 'Good', tires: 'Good', oil: 'Good' },
]

// Dispatch → Driver news feed (simulated, for demo)
export const mockDispatchFeed = [
    {
        id: 1, type: 'load', priority: 'high',
        title: 'New Load Assigned — LD-9831',
        body: 'Dallas, TX → Houston, TX · 38,500 lbs · Pickup Mar 7 @ 09:00. Confirm receipt.',
        from: 'Sarah Mitchell · Dispatch',
        time: 'Just now',
        icon: '📦',
    },
    {
        id: 2, type: 'alert', priority: 'warning',
        title: '⚠\uFE0F Road Closure — I-30 West near Texarkana',
        body: 'Construction closure until 18:00. Suggested alternate: US-67 S. Add ~25 min.',
        from: 'Dispatch Center',
        time: '4m ago',
        icon: '🚧',
    },
    {
        id: 3, type: 'weather', priority: 'info',
        title: 'Weather Advisory — Dallas area',
        body: 'Thunderstorms expected 14:00–20:00. Reduce speed, increase following distance.',
        from: 'Dispatch Center',
        time: '12m ago',
        icon: '⛈\uFE0F',
    },
    {
        id: 4, type: 'fuel', priority: 'info',
        title: 'Fuel Stop Recommended',
        body: 'Loves Travel Stop · Exit 187 off I-30 · Best rate: $3.74/gal · Truck lanes available.',
        from: 'Sarah Mitchell · Dispatch',
        time: '18m ago',
        icon: '⛽',
    },
    {
        id: 5, type: 'compliance', priority: 'warning',
        title: 'HOS Reminder — Break Required',
        body: 'You have 3h 30m of drive time left today. Plan 30-min break near Joplin, MO.',
        from: 'Compliance System',
        time: '31m ago',
        icon: '⏰',
    },
    {
        id: 6, type: 'info', priority: 'info',
        title: 'Delivery Instructions Updated — LD-9823',
        body: 'Receiver requests call 30 min before arrival. Contact: (214) 555-0192 · Gate 4.',
        from: 'Sarah Mitchell · Dispatch',
        time: '45m ago',
        icon: '📋',
    },
    {
        id: 7, type: 'info', priority: 'info',
        title: 'Fleet-Wide Notice',
        body: 'New pre-trip inspection form effective March 8. Ray Johnson will brief all drivers Mon AM.',
        from: 'Management',
        time: '2h ago',
        icon: '📣',
    },
]
