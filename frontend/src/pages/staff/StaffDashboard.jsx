import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ClipboardList, FileText, Users, Bell, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

export default function StaffDashboard() {
    const { user } = useAuth();
    const stats = [
        { label: 'Total Students', value: '320', icon: Users, color: '#6366f1', change: '+5' },
        { label: "Today's Attendance", value: '92%', icon: ClipboardList, color: '#10b981', change: '+1.5%' },
        { label: 'Pending Marks', value: '3', icon: FileText, color: '#f59e0b', change: '-2' },
        { label: 'Announcements', value: '7', icon: Bell, color: '#ec4899', change: '+1' },
    ];

    const todayClasses = [
        { time: '9:00 AM', subject: 'Data Structures', year: '2nd Year', room: 'CS Lab 1', status: 'completed' },
        { time: '10:30 AM', subject: 'Computer Networks', year: '3rd Year', room: 'Room 201', status: 'completed' },
        { time: '12:00 PM', subject: 'Database Systems', year: '2nd Year', room: 'Room 105', status: 'ongoing' },
        { time: '2:00 PM', subject: 'Operating Systems', year: '3rd Year', room: 'CS Lab 2', status: 'upcoming' },
    ];

    const statusColors = { completed: 'var(--accent-500)', ongoing: 'var(--primary-500)', upcoming: 'var(--text-muted)' };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Staff Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                    Welcome, {user?.name || 'Staff Member'} · {user?.role?.toUpperCase() || 'STAFF'}
                </p>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '28px' }}>
                {stats.map((card) => {
                    const Icon = card.icon;
                    return (
                        <motion.div key={card.label} className="stat-card" variants={itemVariants} whileHover={{ y: -4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
                                    <p style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginTop: '6px' }}>{card.value}</p>
                                </div>
                                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                                    <Icon size={22} />
                                </div>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: card.change.startsWith('+') ? 'var(--accent-500)' : card.change.startsWith('-') ? 'var(--danger-500)' : 'var(--text-muted)', marginTop: '10px', display: 'block' }}>{card.change} this week</span>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Today's Schedule */}
            <motion.div variants={itemVariants} className="card" style={{ marginTop: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <Calendar size={20} style={{ color: 'var(--primary-400)' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Today's Schedule</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {todayClasses.map((cls, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: i < todayClasses.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                            <div style={{ width: '4px', height: '40px', borderRadius: '4px', background: statusColors[cls.status] }} />
                            <div style={{ width: '80px', flexShrink: 0 }}>
                                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{cls.time}</p>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{cls.subject}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cls.year} · {cls.room}</p>
                            </div>
                            <span className={`badge ${cls.status === 'completed' ? 'badge-success' : cls.status === 'ongoing' ? 'badge-primary' : 'badge-warning'}`} style={{ textTransform: 'capitalize' }}>
                                {cls.status}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
