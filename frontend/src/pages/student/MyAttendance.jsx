import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { attendanceAPI } from '../../services/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function MyAttendance() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalDays: 0, presentDays: 0, absentDays: 0, percentage: 0 });
    const [recentDays, setRecentDays] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await attendanceAPI.getMyAttendance();
            if (res.stats) {
                setStats(res.stats);
            }
            if (res.attendance && res.attendance.length > 0) {
                // Build recent days list (last 10 records)
                const recent = res.attendance.slice(0, 10).map(record => {
                    const dateObj = new Date(record.date + 'T00:00:00');
                    return {
                        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        day: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
                        status: record.status,
                    };
                });
                setRecentDays(recent);

                // Build monthly chart data
                const monthMap = {};
                res.attendance.forEach(record => {
                    const d = new Date(record.date + 'T00:00:00');
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                    if (!monthMap[key]) {
                        monthMap[key] = { month: monthName, present: 0, total: 0, pct: 0, sortKey: key };
                    }
                    monthMap[key].total++;
                    if (record.status === 'present') monthMap[key].present++;
                });
                const monthly = Object.values(monthMap)
                    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
                    .slice(-8)
                    .map(m => ({ ...m, pct: m.total > 0 ? Math.round((m.present / m.total) * 100) : 0 }));
                setMonthlyData(monthly);
            }
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = { present: 'var(--accent-500)', absent: 'var(--danger-500)', holiday: 'var(--text-muted)' };
    const getBarColor = (pct) => pct >= 85 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#ef4444';

    const statCards = [
        { label: 'Overall %', value: `${stats.percentage}%`, icon: TrendingUp, color: '#10b981' },
        { label: 'Days Present', value: `${stats.presentDays}`, icon: ClipboardList, color: '#6366f1' },
        { label: 'Days Absent', value: `${stats.absentDays}`, icon: ClipboardList, color: '#ef4444' },
        { label: 'Working Days', value: `${stats.totalDays}`, icon: Calendar, color: '#f59e0b' },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary-500)" />
            </div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>My Attendance</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Track your attendance percentage and history</p>
            </motion.div>

            {/* Overall Stats */}
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '28px' }}>
                {statCards.map(s => {
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
            {monthlyData.length > 0 && (
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
            )}

            {/* No data message */}
            {stats.totalDays === 0 && (
                <motion.div variants={itemVariants} className="card" style={{ marginTop: '24px', textAlign: 'center', padding: '40px' }}>
                    <ClipboardList size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No Attendance Records Yet</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Your attendance will appear here once it has been marked by your class teacher.</p>
                </motion.div>
            )}

            {/* Recent */}
            {recentDays.length > 0 && (
                <motion.div variants={itemVariants} className="card" style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Recent Days</h3>
                    {recentDays.map((d, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < recentDays.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[d.status] || 'var(--text-muted)' }} />
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
            )}
        </motion.div>
    );
}
