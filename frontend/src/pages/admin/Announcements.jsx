import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, Send, X, Users, Building2, GraduationCap } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([
        { id: 1, title: 'Mid-Semester Exam Schedule', message: 'Mid-semester exams will begin from March 15th. Please check the department notice board for detailed schedule.', target: 'all', created: '2 hours ago', by: 'Admin' },
        { id: 2, title: 'Library Timings Updated', message: 'Library will remain open till 9 PM on weekdays starting next week.', target: 'student', created: '1 day ago', by: 'Admin' },
        { id: 3, title: 'Staff Meeting - March 10', message: 'All staff members are requested to attend the quarterly meeting at 10 AM in the conference hall.', target: 'staff', created: '2 days ago', by: 'Principal' },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', target: 'all' });

    const targetIcons = { all: Users, student: GraduationCap, staff: Users, department: Building2 };
    const targetColors = { all: '#6366f1', student: '#f59e0b', staff: '#10b981', department: '#06b6d4' };

    const handleCreate = (e) => {
        e.preventDefault();
        setAnnouncements(prev => [{ ...form, id: Date.now(), created: 'Just now', by: 'Admin' }, ...prev]);
        setForm({ title: '', message: '', target: 'all' });
        setShowModal(false);
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Announcements</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Broadcast alerts and notices</p>
                </div>
                <motion.button className="btn btn-primary" onClick={() => setShowModal(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Plus size={16} /> New Announcement
                </motion.button>
            </motion.div>

            <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '28px' }}>
                {announcements.map((ann, i) => {
                    const Icon = targetIcons[ann.target] || Users;
                    return (
                        <motion.div key={ann.id} className="card" variants={itemVariants}
                            whileHover={{ x: 4 }}
                            style={{ position: 'relative', overflow: 'hidden', borderLeft: `4px solid ${targetColors[ann.target] || '#6366f1'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{ann.title}</h3>
                                        <span className="badge" style={{ background: `${targetColors[ann.target]}15`, color: targetColors[ann.target] }}>
                                            <Icon size={12} /> {ann.target === 'all' ? 'Everyone' : ann.target}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ann.message}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
                                        Posted by <strong>{ann.by}</strong> · {ann.created}
                                    </p>
                                </div>
                                <motion.button className="btn btn-ghost btn-sm" whileHover={{ scale: 1.1 }}
                                    onClick={() => setAnnouncements(prev => prev.filter(a => a.id !== ann.id))}
                                    style={{ color: 'var(--danger-400)', flexShrink: 0 }}>
                                    <Trash2 size={15} />
                                </motion.button>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            <AnimatePresence>
                {showModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
                        <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>New Announcement</h3>
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
                            </div>
                            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div><label className="input-label">Title</label><input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Announcement title" /></div>
                                <div><label className="input-label">Message</label><textarea className="input-field" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required placeholder="Write your announcement..." style={{ resize: 'vertical' }} /></div>
                                <div><label className="input-label">Target Audience</label>
                                    <select className="input-field" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}>
                                        <option value="all">Everyone</option>
                                        <option value="student">Students Only</option>
                                        <option value="staff">Staff Only</option>
                                    </select>
                                </div>
                                <motion.button type="submit" className="btn btn-primary" whileHover={{ scale: 1.02 }} style={{ marginTop: '8px' }}>
                                    <Send size={16} /> Publish Announcement
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
