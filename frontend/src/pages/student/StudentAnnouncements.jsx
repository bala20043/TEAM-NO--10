import { motion } from 'framer-motion';
import { Bell, Users, Building2, GraduationCap, Clock } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function StudentAnnouncements() {
    const announcements = [
        { id: 1, title: 'Mid-Semester Exam Schedule Released', message: 'Mid-semester exams will begin from March 15th. Timetable is available at the department notice board. All students must carry their ID cards.', target: 'all', time: '2 hours ago', by: 'Admin', priority: 'high' },
        { id: 2, title: 'Library Timings Extended', message: 'Library will remain open till 9 PM on weekdays. Weekend hours: 10 AM to 5 PM. New books collection has been added to the CS section.', target: 'student', time: '1 day ago', by: 'Admin', priority: 'normal' },
        { id: 3, title: 'Workshop on Machine Learning', message: 'A 2-day workshop on Machine Learning with Python will be conducted on March 10-11. Register at the CS department office. Limited seats available!', target: 'department', time: '2 days ago', by: 'HOD', priority: 'normal' },
        { id: 4, title: 'Parent-Teacher Meeting', message: 'PTM scheduled for March 25th. Parents are requested to attend between 10 AM and 4 PM. Contact your class advisor for time slot.', target: 'all', time: '3 days ago', by: 'Principal', priority: 'high' },
        { id: 5, title: 'Fees Reminder', message: 'Last date for semester fees payment is March 30th. Late payment will attract a fine of Rs.500. Pay online or at the accounts office.', target: 'student', time: '1 week ago', by: 'Admin', priority: 'high' },
    ];

    const targetIcons = { all: Users, student: GraduationCap, department: Building2, staff: Users };
    const targetColors = { all: '#6366f1', student: '#f59e0b', department: '#06b6d4', staff: '#10b981' };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-500)' }}>
                    <Bell size={22} />
                </div>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Notices & Alerts</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>{announcements.length} announcements</p>
                </div>
            </motion.div>

            <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '28px' }}>
                {announcements.map((ann, i) => {
                    const Icon = targetIcons[ann.target] || Users;
                    return (
                        <motion.div key={ann.id} className="card" variants={itemVariants}
                            whileHover={{ x: 4, boxShadow: '0 10px 30px var(--shadow-color)' }}
                            style={{
                                borderLeft: `4px solid ${ann.priority === 'high' ? 'var(--danger-500)' : targetColors[ann.target]}`,
                                position: 'relative', overflow: 'hidden',
                            }}>
                            {ann.priority === 'high' && (
                                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                    <span className="badge badge-danger">Important</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', paddingRight: ann.priority === 'high' ? '80px' : 0 }}>{ann.title}</h3>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '12px' }}>{ann.message}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} /> {ann.time}
                                </div>
                                <span>By {ann.by}</span>
                                <span className="badge" style={{ background: `${targetColors[ann.target]}15`, color: targetColors[ann.target] }}>
                                    <Icon size={10} /> {ann.target === 'all' ? 'Everyone' : ann.target}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
