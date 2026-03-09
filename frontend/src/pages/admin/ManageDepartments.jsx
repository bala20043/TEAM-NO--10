import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Edit2, Trash2, X, Hash, Loader2 } from 'lucide-react';
import { departmentAPI } from '../../services/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ManageDepartments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editDept, setEditDept] = useState(null);
    const [form, setForm] = useState({ name: '', unique_code: '' });
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const result = await departmentAPI.getAll();
            if (result.departments) {
                setDepartments(result.departments);
            } else {
                setApiError('Failed to load departments');
            }
        } catch (err) {
            setApiError('Connection error');
        }
        setLoading(false);
    };

    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#14b8a6'];

    const openAdd = () => { setEditDept(null); setForm({ name: '', unique_code: '' }); setShowModal(true); setApiError(''); };
    const openEdit = (dept) => { setEditDept(dept); setForm({ name: dept.name, unique_code: dept.unique_code }); setShowModal(true); setApiError(''); };

    const handleSave = async (e) => {
        e.preventDefault();
        setApiError('');
        try {
            let result;
            if (editDept) {
                result = await departmentAPI.update(editDept.id, form);
            } else {
                result = await departmentAPI.create(form);
            }

            if (result.id || result.message) {
                fetchDepartments();
                setShowModal(false);
            } else {
                setApiError(result.error || 'Failed to save department');
            }
        } catch (err) {
            setApiError('Failed to connect to server');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            const result = await departmentAPI.delete(id);
            if (result.message) {
                fetchDepartments();
            } else {
                alert(result.error || 'Failed to delete department');
            }
        } catch (err) {
            alert('Connection error');
        }
    };

    if (loading && departments.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
                <Loader2 className="spin" size={32} style={{ color: 'var(--primary-500)' }} />
            </div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants} className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Departments</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage college departments and their codes</p>
                </div>
                <motion.button className="btn btn-primary" onClick={openAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Plus size={16} /> Add Department
                </motion.button>
            </motion.div>

            {apiError && !showModal && <div className="badge badge-warning" style={{ marginTop: '16px', width: '100%', padding: '12px' }}>{apiError}</div>}

            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '28px' }}>
                {departments.map((dept, i) => (
                    <motion.div key={dept.id} className="card" variants={itemVariants}
                        whileHover={{ y: -4, boxShadow: '0 20px 40px var(--shadow-color)' }}
                        style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${colors[(i + 1) % colors.length]})` }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: `${colors[i % colors.length]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors[i % colors.length] }}>
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{dept.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                        <Hash size={12} style={{ color: 'var(--text-muted)' }} />
                                        <span className="badge badge-primary">{dept.unique_code}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <motion.button className="btn btn-ghost btn-sm" onClick={() => openEdit(dept)} whileHover={{ scale: 1.1 }} style={{ color: 'var(--primary-500)' }}><Edit2 size={14} /></motion.button>
                                <motion.button className="btn btn-ghost btn-sm" onClick={() => handleDelete(dept.id)} whileHover={{ scale: 1.1 }} style={{ color: 'var(--danger-500)' }}><Trash2 size={14} /></motion.button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                            <div>
                                <p style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{dept.student_count || 0}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Students</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{dept.staff_count || 0}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Staff</p>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {departments.length === 0 && !loading && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No departments found. Add your first department!
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {showModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
                        <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>{editDept ? 'Edit Department' : 'Add Department'}</h3>
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
                            </div>

                            {apiError && <div className="badge badge-warning" style={{ marginBottom: '16px', width: '100%', padding: '10px' }}>{apiError}</div>}

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div><label className="input-label">Department Name</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Computer Science & Engineering" /></div>
                                <div><label className="input-label">Unique Code</label><input className="input-field" value={form.unique_code} onChange={e => setForm({ ...form, unique_code: e.target.value.toUpperCase() })} required placeholder="e.g. CSE" maxLength={10} /></div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editDept ? 'Update' : 'Add'} Department</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
