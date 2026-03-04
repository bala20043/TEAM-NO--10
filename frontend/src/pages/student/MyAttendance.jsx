import { motion } from 'framer-motion';
import { ClipboardList, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function MyAttendance() {
    const monthlyData = [
        { month: 'Sep', present: 22, total: 24, pct: 92 },
        { month: 'Oct', present: 20, total: 23, pct: 87 },
        { month: 'Nov', present: 19, total: 22, pct: 86 },
        { month: 'Dec', present: 18, total: 20, pct: 90 },
        { month: 'Jan', present: 21, total: 24, pct: 88 },
        { month: 'Feb', present: 20, total: 22, pct: 91 },
        { month: 'Mar', present: 8, total: 9, pct: 89 },
    ];

    const recentDays = [
        { date: 'Mar 3, 2026', day: 'Monday', status: 'present' },
        { date: 'Mar 2, 2026', day: 'Sunday', status: 'holiday' },
        { date: 'Mar 1, 2026', day: 'Saturday', status: 'holiday' },
        { date: 'Feb 28, 2026', day: 'Friday', status: 'present' },
        { date: 'Feb 27, 2026', day: 'Thursday', status: 'absent' },
        { date: 'Feb 26, 2026', day: 'Wednesday', status: 'present' },
        { date: 'Feb 25, 2026', day: 'Tuesday', status: 'present' },
    ];

    const statusColors = { present: 'var(--accent-500)', absent: 'var(--danger-500)', holiday: 'var(--text-muted)' };
    const getBarColor = (pct) => pct >= 85 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#ef4444';

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>My Attendance</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Track your attendance percentage and history</p>
            </motion.div>

            {/* Overall Stats */}
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '28px' }}>
                {[
                    { label: 'Overall %', value: '89%', icon: TrendingUp, color: '#10b981' },
                    { label: 'Days Present', value: '128', icon: ClipboardList, color: '#6366f1' },
                    { label: 'Days Absent', value: '16', icon: ClipboardList, color: '#ef4444' },
                    { label: 'Working Days', value: '144', icon: Calendar, color: '#f59e0b' },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <motion.div key={s.label} className="stat-card" variants={itemVariants} whileHover={{ y: -4 }}>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                <p style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{s.value}</p>
                                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}><Icon size={20} /></div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Chart */}
            <motion.div variants={itemVariants} className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Monthly Attendance %</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                        <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                            {monthlyData.map((entry, i) => <Cell key={i} fill={getBarColor(entry.pct)} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Recent */}
            <motion.div variants={itemVariants} className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Recent Days</h3>
                {recentDays.map((d, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < recentDays.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[d.status] }} />
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{d.date}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.day}</p>
                            </div>
                        </div>
                        <span className={`badge ${d.status === 'present' ? 'badge-success' : d.status === 'absent' ? 'badge-danger' : ''}`}
                            style={d.status === 'holiday' ? { background: 'var(--bg-tertiary)', color: 'var(--text-muted)' } : { textTransform: 'capitalize' }}>
                            {d.status}
                        </span>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}
