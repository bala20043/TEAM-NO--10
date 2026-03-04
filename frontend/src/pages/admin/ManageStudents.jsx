import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Search, Archive, UserX, Eye, Upload, X } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ManageStudents() {
    const [students, setStudents] = useState([
        { id: 1, name: 'Arun Kumar', reg_no: 'CSE2024001', department: 'CSE', year: 3, batch: '2022-2026', mobile: '9876543210', email: 'arun@college.edu', status: 'active' },
        { id: 2, name: 'Deepa Lakshmi', reg_no: 'ECE2024012', department: 'ECE', year: 2, batch: '2023-2027', mobile: '9876543211', email: 'deepa@college.edu', status: 'active' },
        { id: 3, name: 'Karthik Raj', reg_no: 'MECH2024005', department: 'MECH', year: 4, batch: '2021-2025', mobile: '9876543212', email: 'karthik@college.edu', status: 'active' },
        { id: 4, name: 'Sneha Patel', reg_no: 'CSE2024015', department: 'CSE', year: 2, batch: '2023-2027', mobile: '9876543213', email: 'sneha@college.edu', status: 'active' },
        { id: 5, name: 'Ravi Shankar', reg_no: 'CIVIL2024008', department: 'CIVIL', year: 1, batch: '2024-2028', mobile: '9876543214', email: 'ravi@college.edu', status: 'archived' },
    ]);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('all');
    const [viewStudent, setViewStudent] = useState(null);

    const filtered = students.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.reg_no.toLowerCase().includes(search.toLowerCase());
        const matchDept = filterDept === 'all' || s.department === filterDept;
        return matchSearch && matchDept;
    });

    const handleArchive = (id) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'archived' : 'active' } : s));
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Manage Students</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{students.filter(s => s.status === 'active').length} active students</p>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" placeholder="Search by name or reg no..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '42px' }} />
                </div>
                <select className="input-field" value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: '180px' }}>
                    <option value="all">All Departments</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="EEE">EEE</option>
                </select>
            </motion.div>

            {/* Table */}
            <motion.div variants={itemVariants} className="card" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Reg No</th>
                                <th>Dept</th>
                                <th>Year</th>
                                <th>Batch</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, i) => (
                                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-full)', background: s.status === 'active' ? 'linear-gradient(135deg,#10b981,#06b6d4)' : 'var(--gray-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{s.name}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-400)' }}>{s.reg_no}</span></td>
                                    <td><span className="badge badge-primary">{s.department}</span></td>
                                    <td>Year {s.year}</td>
                                    <td style={{ fontSize: '13px' }}>{s.batch}</td>
                                    <td><span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <motion.button className="btn btn-ghost btn-sm" whileHover={{ scale: 1.1 }} onClick={() => setViewStudent(s)} title="View"><Eye size={15} style={{ color: 'var(--primary-400)' }} /></motion.button>
                                            <motion.button className="btn btn-ghost btn-sm" whileHover={{ scale: 1.1 }} onClick={() => handleArchive(s.id)} title={s.status === 'active' ? 'Archive' : 'Restore'}>
                                                <Archive size={15} style={{ color: s.status === 'active' ? 'var(--warning-500)' : 'var(--accent-500)' }} />
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* View Student Modal */}
            <AnimatePresence>
                {viewStudent && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewStudent(null)}>
                        <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>Student Profile</h3>
                                <button className="btn btn-ghost btn-icon" onClick={() => setViewStudent(null)}><X size={18} /></button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--primary-500), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '22px', fontWeight: 800 }}>{viewStudent.name.charAt(0)}</div>
                                <div>
                                    <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{viewStudent.name}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{viewStudent.reg_no}</p>
                                </div>
                            </div>
                            {[['Department', viewStudent.department], ['Year', `Year ${viewStudent.year}`], ['Batch', viewStudent.batch], ['Email', viewStudent.email], ['Mobile', viewStudent.mobile], ['Status', viewStudent.status]].map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
