import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ClipboardList, FileText, Users, Bell, TrendingUp, Calendar, Loader2, Award, Star, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffAPI, marksAPI } from '../../services/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function StaffDashboard() {
    const { user } = useAuth();
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [topPerformers, setTopPerformers] = useState({ year2: null, year3: null });

    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await staffAPI.getStats();
                setStatsData(res);
                if (res.isHOD && user.department_id) {
                    fetchTopPerformersList();
                }
            } catch (err) {
                console.error('Stats fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user?.department_id, user?.role]);

    const fetchTopPerformersList = async () => {
        try {
            const [res2, res3] = await Promise.all([
                marksAPI.getDeptMarks(user.department_id, 2, null),
                marksAPI.getDeptMarks(user.department_id, 3, null)
            ]);

            const computeTop = (marks) => {
                if (!marks || marks.length === 0) return null;
                const studentTotals = {};
                marks.forEach(m => {
                    const key = m.student_id || m.reg_no;
                    if (!studentTotals[key]) studentTotals[key] = { name: m.name, reg_no: m.reg_no, total: 0, subjects: 0 };
                    studentTotals[key].total += (m.total || 0);
                    studentTotals[key].subjects++;
                });
                return Object.values(studentTotals).sort((a, b) => b.total - a.total)[0] || null;
            };

            setTopPerformers({
                year2: computeTop(res2.marks),
                year3: computeTop(res3.marks)
            });
        } catch (err) {
            console.error('Failed to fetch top performers:', err);
        }
    };

    const stats = statsData?.isPrincipal ? [
        { label: 'Total Students', value: statsData?.totalStudents || '0', icon: Users, color: '#6366f1', change: 'Across all depts' },
        { label: 'Total Faculty', value: statsData?.totalStaff || '0', icon: Award, color: '#10b981', change: 'HODs & Staff' },
        { label: 'Departments', value: statsData?.totalDepts || '0', icon: Building2, color: '#f59e0b', change: 'Academic units' },
        { label: 'Overall Attendance', value: statsData?.todayAttendance || '0%', icon: ClipboardList, color: '#8b5cf6', change: 'College-wide' },
    ] : statsData?.isHOD ? [
        { label: 'Dept Students', value: statsData?.totalStudents || '0', icon: Users, color: '#6366f1', change: 'Total enrolled' },
        { label: 'Year 2 Attendance', value: statsData?.year2Attendance || '0%', icon: ClipboardList, color: '#10b981', change: 'Today' },
        { label: 'Year 3 Attendance', value: statsData?.year3Attendance || '0%', icon: ClipboardList, color: '#8b5cf6', change: 'Today' },
        { label: 'Announcements', value: statsData?.announcements || '0', icon: Bell, color: '#ec4899', change: 'Active' },
    ] : [
        { label: 'Total Students', value: statsData?.totalStudents || '0', icon: Users, color: '#6366f1', change: statsData ? 'Real-time' : 'Updating...' },
        { label: "Today's Attendance", value: statsData?.todayAttendance || '0%', icon: ClipboardList, color: '#10b981', change: statsData ? 'Calculated' : '--' },
        { label: 'Pending Marks', value: statsData?.pendingMarks || '0', icon: FileText, color: '#f59e0b', change: 'Action Required' },
        { label: 'Announcements', value: statsData?.announcements || '0', icon: Bell, color: '#ec4899', change: 'Latest' },
    ];

    const todayClasses = [
        { time: '9:00 AM', subject: 'Data Structures', year: '2nd Year', room: 'CS Lab 1', status: 'completed' },
        { time: '10:30 AM', subject: 'Computer Networks', year: '3rd Year', room: 'Room 201', status: 'completed' },
        { time: '12:00 PM', subject: 'Database Systems', year: '2nd Year', room: 'Room 105', status: 'ongoing' },
        { time: '2:00 PM', subject: 'Operating Systems', year: '3rd Year', room: 'CS Lab 2', status: 'upcoming' },
    ];

    const statusColors = { completed: 'var(--accent-500)', ongoing: 'var(--primary-500)', upcoming: 'var(--text-muted)' };

    const TopPerformerCard = ({ year, data }) => (
        <div className="card" style={{ flex: 1, minWidth: '280px', position: 'relative', overflow: 'hidden', padding: '24px' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.06 }}>
                <Star size={120} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: year === 2 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                }}>
                    <Award size={16} />
                </div>
                <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Year {year} Top Performer
                    </p>
                </div>
            </div>
            {data ? (
                <>
                    <p style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{data.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '4px' }}>{data.reg_no}</p>
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 800, color: year === 2 ? '#10b981' : '#8b5cf6' }}>{data.total}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>total marks across {data.subjects} subject{data.subjects > 1 ? 's' : ''}</span>
                    </div>
                </>
            ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>No semester results yet</p>
            )}
        </div>
    );

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
                    {statsData?.isPrincipal ? 'College Overview' : statsData?.isHOD ? 'HOD Dashboard' : 'Staff Dashboard'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                    Welcome, {user?.name || 'Staff Member'} · {user?.role?.toUpperCase() || 'STAFF'}
                    {user?.year && <span style={{ marginLeft: '12px', padding: '2px 8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-500)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>Class Teacher: Year {user.year}</span>}
                </p>
            </motion.div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '28px' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <Loader2 className="animate-spin" size={48} color="var(--primary-500)" />
                    </div>
                ) : stats.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="stat-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
                                    <p style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginTop: '6px' }}>{card.value}</p>
                                </div>
                                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                                    <Icon size={22} />
                                </div>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '10px', display: 'block' }}>{card.change}</span>
                        </div>
                    );
                })}
            </div>


            {/* HOD Top Performers */}
            {statsData?.isHOD && (
                <div style={{ marginTop: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <Award size={20} style={{ color: 'var(--primary-400)' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Top Performers — Semester Results</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <TopPerformerCard year={2} data={topPerformers.year2} />
                        <TopPerformerCard year={3} data={topPerformers.year3} />
                    </div>
                </div>
            )}

            {/* Today's Schedule (staff only) */}
            {!statsData?.isHOD && !statsData?.isPrincipal && (
                <div className="card" style={{ marginTop: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <Calendar size={20} style={{ color: 'var(--primary-400)' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Today's Schedule</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {todayClasses.map((cls, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: i < todayClasses.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
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
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
