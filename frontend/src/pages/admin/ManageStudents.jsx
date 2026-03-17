import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Archive, CheckCircle2, UserX, X, Loader2, Building2, Trash2 } from 'lucide-react';
import { adminAPI, studentAPI, departmentAPI } from '../../services/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ManageStudents() {
    const { user } = useAuth();
    const isPrincipal = user?.role?.toLowerCase() === 'principal';
    const location = useLocation();
    const [tab, setTab] = useState(location.state?.initialTab || 'active'); // 'active' or 'pending'
    const [students, setStudents] = useState([]);
    const [pendingStudents, setPendingStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('all');
    const [viewStudent, setViewStudent] = useState(null);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        if (tab === 'active') fetchData();
        else fetchPending();
    }, [tab, filterDept, search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterDept !== 'all') params.append('department_id', filterDept);
            if (search) params.append('search', search);

            const [studentRes, deptRes] = await Promise.all([
                studentAPI.getAll(params.toString()),
                departmentAPI.getAll()
            ]);

            if (studentRes.students) setStudents(studentRes.students);
            if (deptRes.departments) setDepartments(deptRes.departments);
        } catch (err) {
            setApiError('Failed to fetch students');
        }
        setLoading(false);
    };

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getPendingStudents();
            if (res.students) setPendingStudents(res.students);

            // Also fetch departments if not already fetched
            if (departments.length === 0) {
                const deptRes = await departmentAPI.getAll();
                if (deptRes.departments) setDepartments(deptRes.departments);
            }
        } catch (err) {
            setApiError('Failed to fetch pending students');
        }
        setLoading(false);
    };

    const handleApprove = async (id) => {
        try {
            const res = await adminAPI.approveStudent(id);
            if (res.message) fetchPending();
        } catch (err) {
            alert('Approval failed');
        }
    };

    const handleReject = async (id) => {
        if (!confirm('Are you sure you want to reject and delete this registration?')) return;
        try {
            const res = await adminAPI.rejectStudent(id);
            if (res.message) fetchPending();
        } catch (err) {
            alert('Rejection failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this student account? This cannot be undone.')) return;
        try {
            const res = await adminAPI.deleteStudent(id);
            if (res.message) fetchData();
        } catch (err) {
            alert('Deletion failed: ' + (err.message || 'Unknown error'));
        }
    };


    const handleArchive = async (id) => {
        try {
            const result = await studentAPI.archive(id);
            if (result.message) {
                fetchData();
            } else {
                alert(result.error || 'Failed to update student');
            }
        } catch (err) {
            alert('Connection error');
        }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>Student Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                        {tab === 'active' ? `${students.filter(s => s.status === 'active').length} active students` : `${pendingStudents.length} pending approval requests`}
                    </p>
                </div>
            </motion.div>

            {/* Principal: Departmental Breakdown */}
            {isPrincipal && departments.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <Building2 size={18} style={{ color: 'var(--primary-400)' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Departmental Strength</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {departments.map((dept, i) => {
                            const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#14b8a6'];
                            const color = colors[i % colors.length];
                            const colorNext = colors[(i + 1) % colors.length];

                            return (
                                <motion.div key={i} className="card" variants={itemVariants}
                                    whileHover={{ y: -4, boxShadow: '0 15px 30px var(--shadow-color)' }}
                                    style={{ position: 'relative', overflow: 'hidden', padding: '20px' }}>

                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                                        background: `linear-gradient(90deg, ${color}, ${colorNext})`
                                    }} />

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                                            background: `${color}15`, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', color: color
                                        }}>
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{dept.name}</h3>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                                                {dept.unique_code || 'DEPT'}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex', gap: '20px', marginTop: '16px',
                                        paddingTop: '12px', borderTop: '1px solid var(--border-color)'
                                    }}>
                                        <div>
                                            <p style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                                {dept.student_count || 0}
                                            </p>
                                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                                                Students
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                                {dept.staff_count || 0}
                                            </p>
                                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                                                Faculty
                                            </p>
                                        </div>
                                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                            <p style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
                                                {dept.staff_count > 0 ? (dept.student_count / dept.staff_count).toFixed(1) : dept.student_count}
                                            </p>
                                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                                                Ratio
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '24px', marginTop: '24px', borderBottom: '1px solid var(--border-color)' }}>
                <button
                    onClick={() => setTab('active')}
                    style={{
                        padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
                        color: tab === 'active' ? 'var(--primary-400)' : 'var(--text-muted)',
                        fontWeight: 600, fontSize: '15px', position: 'relative'
                    }}
                >
                    Active Students
                    {tab === 'active' && <motion.div layoutId="activeTab" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--primary-400)' }} />}
                </button>
                {!isPrincipal && (
                    <button
                        onClick={() => setTab('pending')}
                        style={{
                            padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
                            color: tab === 'pending' ? 'var(--primary-400)' : 'var(--text-muted)',
                            fontWeight: 600, fontSize: '15px', position: 'relative', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        Approval Requests
                        {pendingStudents.length > 0 && (
                            <span style={{
                                background: 'var(--danger-500)', color: 'white', fontSize: '10px',
                                padding: '2px 6px', borderRadius: '10px'
                            }}>
                                {pendingStudents.length}
                            </span>
                        )}
                        {tab === 'pending' && <motion.div layoutId="activeTab" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--primary-400)' }} />}
                    </button>
                )}
            </motion.div>

            {/* Filters (only for active tab) */}
            {tab === 'active' && (
                <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input-field" placeholder="Search by name or reg no..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '42px' }} />
                    </div>
                    <select className="input-field" value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: '180px' }}>
                        <option value="all">All Departments</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </motion.div>
            )}

            {loading && (tab === 'active' ? students.length === 0 : pendingStudents.length === 0) && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Loader2 className="spin" size={32} style={{ color: 'var(--primary-500)' }} />
                </div>
            )}

            {/* Desktop Table & Mobile Cards */}
            <motion.div variants={itemVariants} style={{ marginTop: tab === 'active' ? '20px' : '32px' }}>
                {/* Desktop View (Table) */}
                <div className="card hide-mobile" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Reg No</th>
                                    <th>Dept</th>
                                    <th>Year</th>
                                    <th>Batch</th>
                                    <th>{tab === 'active' ? 'Status' : 'Date'}</th>
                                    {!isPrincipal && <th>Actions</th>}
                                    {isPrincipal && <th>Profile</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {(tab === 'active' ? students : pendingStudents).map((s, i) => (
                                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-full)', background: s.status === 'active' ? 'linear-gradient(135deg,#10b981,#06b6d4)' : tab === 'pending' ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'var(--gray-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{s.name}</p>
                                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-400)' }}>{s.reg_no}</span></td>
                                        <td><span className="badge badge-primary">{s.dept_code || s.department_name}</span></td>
                                        <td>Year {s.year}</td>
                                        <td style={{ fontSize: '13px' }}>{s.batch}</td>
                                        <td>
                                            {tab === 'active' ? (
                                                <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleDateString()}</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <motion.button className="btn btn-ghost btn-sm" whileHover={{ scale: 1.1 }} onClick={() => setViewStudent(s)} title="View"><Eye size={15} style={{ color: 'var(--primary-400)' }} /></motion.button>
                                                {!isPrincipal && (
                                                    tab === 'active' ? (
                                                        <>
                                                            <motion.button className="btn btn-ghost btn-sm" whileHover={{ scale: 1.1 }} onClick={() => handleArchive(s.id)} title={s.status === 'active' ? 'Archive' : 'Restore'}>
                                                                <Archive size={15} style={{ color: s.status === 'active' ? 'var(--warning-500)' : 'var(--accent-500)' }} />
                                                            </motion.button>
                                                            <motion.button className="btn btn-ghost btn-sm" whileHover={{ scale: 1.1 }} onClick={() => handleDelete(s.id)} title="Delete Permanently">
                                                                <Trash2 size={15} style={{ color: 'var(--danger-500)' }} />
                                                            </motion.button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <motion.button
                                                                className="btn btn-ghost btn-sm"
                                                                whileHover={{ scale: 1.1 }}
                                                                onClick={() => handleApprove(s.id)}
                                                                title="Approve"
                                                            >
                                                                <CheckCircle2 size={15} style={{ color: 'var(--accent-500)' }} />
                                                            </motion.button>
                                                            <motion.button
                                                                className="btn btn-ghost btn-sm"
                                                                whileHover={{ scale: 1.1 }}
                                                                onClick={() => handleReject(s.id)}
                                                                title="Reject"
                                                            >
                                                                <UserX size={15} style={{ color: 'var(--danger-500)' }} />
                                                            </motion.button>
                                                        </>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile View (Cards) */}
                <div className="mobile-only" style={{ display: 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(tab === 'active' ? students : pendingStudents).map((s, i) => (
                            <motion.div 
                                key={s.id} 
                                className="card" 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ delay: i * 0.04 }}
                                style={{ padding: '16px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: s.status === 'active' ? 'linear-gradient(135deg,#10b981,#06b6d4)' : tab === 'pending' ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'var(--gray-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '15px' }}>
                                            {s.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{s.name}</h4>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.email}</p>
                                        </div>
                                    </div>
                                    <span className={`badge ${tab === 'active' ? (s.status === 'active' ? 'badge-success' : 'badge-warning') : 'badge-primary'}`}>
                                        {tab === 'active' ? s.status : 'Pending'}
                                    </span>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', marginBottom: '12px' }}>
                                    <div>
                                        <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Reg No</p>
                                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-400)' }}>{s.reg_no}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Department</p>
                                        <p style={{ fontSize: '13px', fontWeight: 600 }}>{s.dept_code || s.department_name}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Year</p>
                                        <p style={{ fontSize: '13px', fontWeight: 600 }}>Year {s.year}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Batch</p>
                                        <p style={{ fontSize: '13px', fontWeight: 600 }}>{s.batch}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setViewStudent(s)}>
                                        <Eye size={14} /> View Details
                                    </button>
                                    {!isPrincipal && (
                                        tab === 'active' ? (
                                            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                                                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleArchive(s.id)}>
                                                    <Archive size={14} style={{ color: s.status === 'active' ? 'var(--warning-500)' : 'var(--accent-500)' }} />
                                                    {s.status === 'active' ? 'Archive' : 'Restore'}
                                                </button>
                                                <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleDelete(s.id)}>
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                                                <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => handleApprove(s.id)}>
                                                    <CheckCircle2 size={14} /> Approve
                                                </button>
                                                <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleReject(s.id)}>
                                                    <UserX size={14} /> Reject
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {(tab === 'active' ? students : pendingStudents).length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                        <p>{tab === 'active' ? 'No students found matching your filters.' : 'No pending registration requests.'}</p>
                    </div>
                )}
            </motion.div>

            <style>{`
                @media (max-width: 768px) {
                    .hide-mobile { display: none !important; }
                    .mobile-only { display: block !important; }
                }
            `}</style>


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
                            {[['Department', viewStudent.department_name], ['Year', `Year ${viewStudent.year}`], ['Batch', viewStudent.batch], ['Email', viewStudent.email], ['Mobile', viewStudent.mobile], ['Parent Mobile', viewStudent.parent_mobile], ['Status', viewStudent.status]].map(([label, val]) => (
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
