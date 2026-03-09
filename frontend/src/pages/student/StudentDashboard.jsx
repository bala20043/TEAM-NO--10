import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, TrendingUp, Calendar, BookOpen, Bell, ClipboardList, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { attendanceAPI, marksAPI, announcementAPI } from '../../services/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

export default function StudentDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [attendanceStats, setAttendanceStats] = useState({ percentage: 0, totalDays: 0, presentDays: 0, absentDays: 0 });
    const [monthlyData, setMonthlyData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [marksData, setMarksData] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [attendanceRes, marksRes, announcementRes] = await Promise.allSettled([
                attendanceAPI.getMyAttendance(),
                marksAPI.getMyMarks(),
                announcementAPI.getAll(),
            ]);

            // Attendance
            if (attendanceRes.status === 'fulfilled' && attendanceRes.value.stats) {
                const stats = attendanceRes.value.stats;
                setAttendanceStats(stats);
                setPieData([
                    { name: 'Present', value: stats.presentDays || 0, color: '#10b981' },
                    { name: 'Absent', value: stats.absentDays || 0, color: '#ef4444' },
                ]);

                // Build monthly trend from records
                if (attendanceRes.value.attendance) {
                    const monthMap = {};
                    attendanceRes.value.attendance.forEach(record => {
                        const d = new Date(record.date + 'T00:00:00');
                        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                        const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                        if (!monthMap[key]) monthMap[key] = { month: monthName, present: 0, total: 0, sortKey: key };
                        monthMap[key].total++;
                        if (record.status === 'present') monthMap[key].present++;
                    });
                    const monthly = Object.values(monthMap)
                        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
                        .slice(-7)
                        .map(m => ({ ...m, percentage: m.total > 0 ? Math.round((m.present / m.total) * 100) : 0 }));
                    setMonthlyData(monthly);
                }
            }

            // Marks
            if (marksRes.status === 'fulfilled' && marksRes.value.marks) {
                setMarksData(marksRes.value.marks);
            }

            // Announcements
            if (announcementRes.status === 'fulfilled' && announcementRes.value.announcements) {
                setAnnouncements(announcementRes.value.announcements.slice(0, 3));
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const subjectCount = marksData.length > 0 ? new Set(marksData.map(m => m.subject)).size : 0;

    const stats = [
        { label: 'Attendance', value: `${attendanceStats.percentage}%`, icon: ClipboardList, color: '#10b981' },
        { label: 'Subjects', value: `${subjectCount}`, icon: BookOpen, color: '#6366f1' },
        { label: 'Announcements', value: `${announcements.length}`, icon: Bell, color: '#f59e0b' },
        { label: 'Working Days', value: `${attendanceStats.totalDays}`, icon: TrendingUp, color: '#8b5cf6' },
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
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Student Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Welcome back, {user?.name || 'Student'}!</p>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '28px' }}>
                {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                        <motion.div key={s.label} className="stat-card" variants={itemVariants} whileHover={{ y: -4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                                    <p style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginTop: '4px' }}>{s.value}</p>
                                </div>
                                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                                    <Icon size={20} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }}>
                {/* Attendance Chart */}
                <motion.div variants={itemVariants} className="card">
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
                        <BarChart3 size={18} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--primary-400)' }} />
                        Attendance Trend
                    </h3>
                    {monthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px' }} />
                                <Area type="monotone" dataKey="percentage" stroke="#6366f1" fill="url(#attendanceGradient)" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6, fill: '#6366f1' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No attendance data yet</p>
                    )}
                </motion.div>

                {/* Attendance Pie */}
                <motion.div variants={itemVariants} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-display)', alignSelf: 'flex-start' }}>Overall</h3>
                    {(pieData[0]?.value > 0 || pieData[1]?.value > 0) ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                {pieData.map(p => <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />{p.name}: {p.value}
                                </div>)}
                            </div>
                        </>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No data</p>
                    )}
                </motion.div>
            </div>

            {/* Recent Announcements */}
            <motion.div variants={itemVariants} className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
                    <Calendar size={18} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--primary-400)' }} />
                    Recent Announcements
                </h3>
                {announcements.length > 0 ? announcements.map((ann, i) => (
                    <motion.div key={ann.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < announcements.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <div style={{ width: '4px', height: '32px', borderRadius: '4px', background: 'var(--primary-500)' }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{ann.title}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(ann.created_at).toLocaleDateString()}</p>
                        </div>
                    </motion.div>
                )) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No announcements yet</p>
                )}
            </motion.div>

            <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </motion.div>
    );
}
