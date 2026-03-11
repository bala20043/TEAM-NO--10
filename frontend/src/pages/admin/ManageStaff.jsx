import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Search, Filter, Mail, Building2, ChevronDown, X, Loader2 } from 'lucide-react';
import { adminAPI, departmentAPI } from '../../services/api';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export default function ManageStaff() {
    const [staff, setStaff] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'staff', department_id: '', year: '' });
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffRes, deptRes] = await Promise.all([
                adminAPI.getUsers('staff'),
                departmentAPI.getAll()
            ]);

            console.log('Fetch Data Success:', { staffCount: staffRes.users?.length, deptsCount: deptRes.departments?.length });
            if (staffRes.users) setStaff(staffRes.users);
            if (deptRes.departments) setDepartments(deptRes.departments);
        } catch (err) {
            console.error('Fetch Data Error:', err);
            setApiError('Failed to fetch data: ' + (err.message || 'Check connection'));
        }
        setLoading(false);
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.department_name && s.department_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setApiError('');
        try {
            const result = await adminAPI.createUser(newStaff);
            if (result.id || result.message) {
                fetchData();
                setNewStaff({ name: '', email: '', password: '', role: 'staff', department_id: '', year: '' });
                setShowAddModal(false);
            } else {
                setApiError(result.error || 'Failed to add staff');
            }
        } catch (err) {
            console.error('Create staff error:', err);
            setApiError(err.message || 'Connection error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) return;
        try {
            const result = await adminAPI.deleteUser(id);
            if (result.message) {
                fetchData();
            } else {
                alert(result.error || 'Failed to delete user');
            }
        } catch (err) {
            alert('Connection error');
        }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants} className="page-header">
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Manage Staff
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                        Add, edit, or remove staff members
                    </p>
                </div>
                <motion.button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <UserPlus size={16} />
                    Add Staff
                </motion.button>
            </motion.div>

            {/* Search */}
            <motion.div variants={itemVariants} style={{ marginTop: '24px' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search staff by name, email, or department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '42px' }}
                    />
                </div>
            </motion.div>

            {/* Staff List (Desktop Table & Mobile Cards) */}
            <motion.div variants={itemVariants} style={{ marginTop: '20px' }}>
                {/* Desktop View (Table) */}
                <div className="card hide-mobile" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Department / Class</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.map((member, i) => (
                                    <motion.tr
                                        key={member.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '34px', height: '34px', borderRadius: 'var(--radius-full)',
                                                    background: 'linear-gradient(135deg, var(--primary-500), #7c3aed)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: 700, fontSize: '13px', flexShrink: 0,
                                                }}>
                                                    {member.name.charAt(0)}
                                                </div>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{member.name}</span>
                                            </div>
                                        </td>
                                        <td>{member.email}</td>
                                        <td>
                                            <span className={`badge ${member.role === 'hod' ? 'badge-primary' : member.role === 'principal' ? 'badge-warning' : 'badge-success'}`}>
                                                {member.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {member.dept_code || member.department_name || 'N/A'}
                                            {member.year && <span style={{ marginLeft: '8px', color: 'var(--primary-500)', fontWeight: 600 }}>Year {member.year}</span>}
                                        </td>
                                        <td><span className="badge badge-success">Active</span></td>
                                        <td>
                                            <motion.button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => handleDelete(member.id)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                style={{ color: 'var(--danger-500)' }}
                                            >
                                                <Trash2 size={15} />
                                            </motion.button>
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
                        {filteredStaff.map((member, i) => (
                            <motion.div 
                                key={member.id} 
                                className="card" 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ delay: i * 0.05 }}
                                style={{ padding: '16px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: 'var(--radius-full)',
                                            background: 'linear-gradient(135deg, var(--primary-500), #7c3aed)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 700, fontSize: '15px'
                                        }}>
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{member.name}</h4>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.email}</p>
                                        </div>
                                    </div>
                                    <span className={`badge ${member.role === 'hod' ? 'badge-primary' : member.role === 'principal' ? 'badge-warning' : 'badge-success'}`}>
                                        {member.role.toUpperCase()}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', marginBottom: '12px' }}>
                                    <div>
                                        <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Department / Class</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{member.dept_code || member.department_name || 'N/A'}</span>
                                            {member.year && <span className="badge badge-primary" style={{ fontSize: '10px' }}>Year {member.year}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="badge badge-success">Active</span>
                                    </div>
                                    <button 
                                        className="btn btn-danger btn-sm" 
                                        onClick={() => handleDelete(member.id)}
                                        style={{ minWidth: '100px' }}
                                    >
                                        <Trash2 size={14} /> Remove
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {filteredStaff.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                        <p>No staff members found matching your search.</p>
                    </div>
                )}
            </motion.div>

            <style>{`
                @media (max-width: 768px) {
                    .hide-mobile { display: none !important; }
                    .mobile-only { display: block !important; }
                }
            `}</style>

            {/* Add Staff Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>Add New Staff</h3>
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            {apiError && <div className="badge badge-warning" style={{ marginBottom: '16px', width: '100%', padding: '10px' }}>{apiError}</div>}
                            <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label className="input-label">Full Name</label>
                                    <input className="input-field" placeholder="Enter full name" value={newStaff.name}
                                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="input-label">Email</label>
                                    <input className="input-field" type="email" placeholder="Enter email address" value={newStaff.email}
                                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="input-label">Password</label>
                                    <input className="input-field" type="password" placeholder="Min 6 characters" value={newStaff.password}
                                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })} required minLength={6} />
                                </div>
                                <div>
                                    <label className="input-label">Role</label>
                                    <select className="input-field" value={newStaff.role}
                                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}>
                                        <option value="staff">Staff</option>
                                        <option value="hod">HOD</option>
                                        <option value="principal">Principal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Department</label>
                                    <select className="input-field" value={newStaff.department_id}
                                        onChange={(e) => setNewStaff({ ...newStaff, department_id: e.target.value })} required>
                                        <option value="">Select Department</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {newStaff.role === 'staff' && (
                                    <div>
                                        <label className="input-label">Assign Year (Class Teacher)</label>
                                        <select className="input-field" value={newStaff.year}
                                            onChange={(e) => setNewStaff({ ...newStaff, year: e.target.value })}>
                                            <option value="">No Class Assigned</option>
                                            <option value="1">Year 1</option>
                                            <option value="2">Year 2</option>
                                            <option value="3">Year 3</option>
                                            <option value="4">Year 4</option>
                                        </select>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        <UserPlus size={16} /> Add Staff
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
