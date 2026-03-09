import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, Send, X, Users, GraduationCap, Building2, Loader2, Megaphone, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { announcementAPI } from '../../services/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function Announcements() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', target: 'all' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await announcementAPI.getAll();
            setAnnouncements(res.announcements || []);
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await announcementAPI.create({
                title: form.title,
                message: form.message,
                target_role: form.target,
                department_id: null // Principal posts are college-wide
            });
            setForm({ title: '', message: '', target: 'all' });
            setShowModal(false);
            fetchAnnouncements();
        } catch (err) {
            setError(err.message || 'Failed to create announcement');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            await announcementAPI.delete(id);
            fetchAnnouncements();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const targetIcons = { all: Users, student: GraduationCap, staff: Users, hod: Shield };
    const targetColors = { all: '#6366f1', student: '#f59e0b', staff: '#10b981', hod: '#f43f5e' };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Megaphone className="text-primary-400" /> College Announcements
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Broadcast notices to students and staff across the college</p>
                </div>
                <motion.button className="btn btn-primary" onClick={() => setShowModal(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Plus size={16} /> New Announcement
                </motion.button>
            </motion.div>

            <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '28px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--primary-500)" />
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                        <Bell size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '16px', margin: '0 auto' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>No college-wide announcements yet.</p>
                    </div>
                ) : announcements.map((ann) => {
                    const target = ann.target_role || 'all';
                    const Icon = targetIcons[target] || Users;
                    return (
                        <motion.div key={ann.id} className="card" variants={itemVariants}
                            whileHover={{ x: 4 }}
                            style={{ position: 'relative', overflow: 'hidden', borderLeft: `4px solid ${targetColors[target] || '#6366f1'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{ann.title}</h3>
                                        <span className="badge" style={{ background: `${targetColors[target]}15`, color: targetColors[target] }}>
                                            <Icon size={12} /> {target === 'all' ? 'Everyone' : target === 'hod' ? 'HODs' : target.charAt(0).toUpperCase() + target.slice(1)}
                                        </span>
                                        {target === 'hod' && (
                                            <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' }}>
                                                Management Memo
                                            </span>
                                        )}
                                        {ann.department_id && (
                                            <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                                                <Building2 size={12} /> Departmental
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ann.message}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
                                        Posted by <strong>{ann.created_by_name || 'Admin'}</strong> · {new Date(ann.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                {(user.role === 'admin' || user.role === 'principal' || user.id === ann.created_by) && (
                                    <motion.button className="btn btn-ghost btn-sm" whileHover={{ scale: 1.1 }}
                                        onClick={() => handleDelete(ann.id)}
                                        style={{ color: 'var(--danger-400)', flexShrink: 0 }}>
                                        <Trash2 size={15} />
                                    </motion.button>
                                )}
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
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>New College Announcement</h3>
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
                            </div>
                            {error && <div className="badge badge-warning" style={{ marginBottom: '16px', width: '100%', padding: '10px' }}>{error}</div>}
                            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label className="input-label">Title</label>
                                    <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Announcement title" />
                                </div>
                                <div>
                                    <label className="input-label">Message</label>
                                    <textarea className="input-field" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required placeholder="Write your announcement..." style={{ resize: 'vertical' }} />
                                </div>
                                <div>
                                    <label className="input-label">Target Audience</label>
                                    <select className="input-field" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}>
                                        <option value="all">Everyone</option>
                                        <option value="hod">HODs Only (Direct Communication)</option>
                                        <option value="staff">Staff Only</option>
                                        <option value="student">Students Only</option>
                                    </select>
                                </div>
                                <motion.button type="submit" className="btn btn-primary" whileHover={{ scale: 1.02 }} disabled={submitting} style={{ marginTop: '8px' }}>
                                    <Send size={16} /> {submitting ? 'Publishing...' : 'Publish Announcement'}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
