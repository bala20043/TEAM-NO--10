import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Building2, Bell, TrendingUp, UserPlus, Shield, Activity } from 'lucide-react';
import { adminAPI, departmentAPI } from '../../services/api';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalStudents: 1247,
        totalStaff: 86,
        totalDepartments: 8,
        activeAlerts: 5,
        attendanceRate: 87.5,
        newEnrollments: 34,
    });

    const statCards = [
        { label: 'Total Students', value: stats.totalStudents, icon: GraduationCap, color: '#6366f1', change: '+12%' },
        { label: 'Total Staff', value: stats.totalStaff, icon: Users, color: '#8b5cf6', change: '+3%' },
        { label: 'Departments', value: stats.totalDepartments, icon: Building2, color: '#06b6d4', change: '0' },
        { label: 'Active Alerts', value: stats.activeAlerts, icon: Bell, color: '#f59e0b', change: '-2' },
        { label: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: TrendingUp, color: '#10b981', change: '+1.2%' },
        { label: 'New Enrollments', value: stats.newEnrollments, icon: UserPlus, color: '#ec4899', change: '+8' },
    ];

    const recentActivity = [
        { action: 'New staff added', detail: 'Dr. Priya Sharma - CSE Department', time: '10 min ago', type: 'success' },
        { action: 'Student archived', detail: 'Reg No: CSE2023045', time: '1 hour ago', type: 'warning' },
        { action: 'Marks uploaded', detail: 'Internal Marks - ECE 3rd Year', time: '2 hours ago', type: 'info' },
        { action: 'Attendance alert', detail: '15 students below 75% in CSE', time: '3 hours ago', type: 'danger' },
        { action: 'System backup', detail: 'Automated backup completed', time: 'Yesterday', type: 'success' },
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            {/* Page Header */}
            <motion.div variants={itemVariants} className="page-header">
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                        Overview of the entire college management system
                    </p>
                </div>
                <motion.button
                    className="btn btn-primary"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <Shield size={16} />
                    System Status: Online
                </motion.button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px',
                marginTop: '28px',
            }}>
                {statCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            className="stat-card"
                            variants={itemVariants}
                            whileHover={{ y: -4, boxShadow: '0 20px 40px var(--shadow-color)' }}
                            style={{ cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {card.label}
                                    </p>
                                    <p style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginTop: '8px' }}>
                                        {card.value}
                                    </p>
                                </div>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                                    background: `${card.color}15`, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: card.color,
                                }}>
                                    <Icon size={24} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                                <span style={{
                                    fontSize: '12px', fontWeight: 700,
                                    color: card.change.startsWith('+') ? 'var(--accent-500)' : card.change.startsWith('-') ? 'var(--danger-500)' : 'var(--text-muted)',
                                }}>
                                    {card.change}
                                </span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>from last month</span>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants} style={{ marginTop: '32px' }}>
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                            <Activity size={20} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--primary-400)' }} />
                            Recent Activity
                        </h3>
                        <button className="btn btn-ghost btn-sm">View All</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {recentActivity.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.08 }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '14px 0',
                                    borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-color)' : 'none',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: item.type === 'success' ? 'var(--accent-500)' :
                                            item.type === 'warning' ? 'var(--warning-500)' :
                                                item.type === 'danger' ? 'var(--danger-500)' : 'var(--primary-500)',
                                        flexShrink: 0,
                                    }} />
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.action}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.detail}</p>
                                    </div>
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.time}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            <style>{`
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .page-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
        </motion.div>
    );
}
