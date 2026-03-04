import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, TrendingUp, Calendar, BookOpen, Bell, ClipboardList, FileText, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

export default function StudentDashboard() {
    const { user } = useAuth();

    const attendanceData = [
        { month: 'Sep', percentage: 92 }, { month: 'Oct', percentage: 88 },
        { month: 'Nov', percentage: 85 }, { month: 'Dec', percentage: 90 },
        { month: 'Jan', percentage: 87 }, { month: 'Feb', percentage: 91 },
        { month: 'Mar', percentage: 89 },
    ];

    const pieData = [
        { name: 'Present', value: 85, color: '#10b981' },
        { name: 'Absent', value: 15, color: '#ef4444' },
    ];

    const stats = [
        { label: 'Attendance', value: '89%', icon: ClipboardList, color: '#10b981' },
        { label: 'Subjects', value: '6', icon: BookOpen, color: '#6366f1' },
        { label: 'Pending Alerts', value: '3', icon: Bell, color: '#f59e0b' },
        { label: 'CGPA', value: '8.5', icon: TrendingUp, color: '#8b5cf6' },
    ];

    const upcomingEvents = [
        { title: 'Mid-Semester Exam', date: 'Mar 15, 2026', type: 'exam' },
        { title: 'Project Submission', date: 'Mar 20, 2026', type: 'deadline' },
        { title: 'PTM Meeting', date: 'Mar 25, 2026', type: 'event' },
    ];

    const typeColors = { exam: 'var(--danger-500)', deadline: 'var(--warning-500)', event: 'var(--primary-500)' };

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
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={attendanceData}>
                            <defs>
                                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} domain={[70, 100]} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px' }} />
                            <Area type="monotone" dataKey="percentage" stroke="#6366f1" fill="url(#attendanceGradient)" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6, fill: '#6366f1' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Attendance Pie */}
                <motion.div variants={itemVariants} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-display)', alignSelf: 'flex-start' }}>Overall</h3>
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
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />{p.name}: {p.value}%
                        </div>)}
                    </div>
                </motion.div>
            </div>

            {/* Upcoming Events */}
            <motion.div variants={itemVariants} className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
                    <Calendar size={18} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--primary-400)' }} />
                    Upcoming Events
                </h3>
                {upcomingEvents.map((ev, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < upcomingEvents.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <div style={{ width: '4px', height: '32px', borderRadius: '4px', background: typeColors[ev.type] }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ev.date}</p>
                        </div>
                        <span className="badge" style={{ background: `${typeColors[ev.type]}15`, color: typeColors[ev.type], textTransform: 'capitalize' }}>{ev.type}</span>
                    </motion.div>
                ))}
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
