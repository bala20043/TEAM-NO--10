import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Users, GraduationCap, Building2, Clock, Loader2, Megaphone } from 'lucide-react';
import { announcementAPI } from '../../services/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function CollegeAnnouncements() {
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await announcementAPI.getAll();
            if (res.announcements) {
                // Filter only global announcements (where department_id is null)
                const global = res.announcements.filter(a => !a.department_id);
                setAnnouncements(global);
            }
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTimeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `${diffMins} min ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    const targetIcons = { all: Users, student: GraduationCap, staff: Users };
    const targetColors = { all: '#6366f1', student: '#f59e0b', staff: '#10b981' };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary-500)" />
            </div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-500)' }}>
                    <Megaphone size={22} />
                </div>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>College Notice Board</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>Global announcements from the Principal & Admin</p>
                </div>
            </motion.div>

            {announcements.length === 0 ? (
                <motion.div variants={itemVariants} className="card" style={{ marginTop: '28px', textAlign: 'center', padding: '40px' }}>
                    <Bell size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.3 }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No Global Announcements</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>There are no college-wide notices at the moment.</p>
                </motion.div>
            ) : (
                <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '28px' }}>
                    {announcements.map((ann) => {
                        const target = ann.target_role || 'all';
                        const Icon = targetIcons[target] || Users;
                        return (
                            <motion.div key={ann.id} className="card" variants={itemVariants}
                                whileHover={{ x: 4, boxShadow: '0 10px 30px var(--shadow-color)' }}
                                style={{
                                    borderLeft: `4px solid ${targetColors[target] || '#6366f1'}`,
                                    position: 'relative', overflow: 'hidden',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{ann.title}</h3>
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '12px' }}>{ann.message}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} /> {getTimeAgo(ann.created_at)}
                                    </div>
                                    <span>By <strong>{ann.created_by_name || 'Admin'}</strong></span>
                                    <span className="badge" style={{ background: `${targetColors[target]}15`, color: targetColors[target] }}>
                                        <Icon size={10} /> {target === 'all' ? 'Everyone' : target.charAt(0).toUpperCase() + target.slice(1)}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
}
