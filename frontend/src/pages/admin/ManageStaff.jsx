import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Search, Filter, Mail, Building2, ChevronDown, X } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export default function ManageStaff() {
    const [staff, setStaff] = useState([
        { id: 1, name: 'Dr. Priya Sharma', email: 'priya@college.edu', role: 'hod', department: 'Computer Science', status: 'active' },
        { id: 2, name: 'Prof. Rajesh Kumar', email: 'rajesh@college.edu', role: 'staff', department: 'Electronics', status: 'active' },
        { id: 3, name: 'Dr. Anita Desai', email: 'anita@college.edu', role: 'staff', department: 'Mechanical', status: 'active' },
        { id: 4, name: 'Prof. Vikram Singh', email: 'vikram@college.edu', role: 'hod', department: 'Civil', status: 'active' },
        { id: 5, name: 'Dr. Meera Patel', email: 'meera@college.edu', role: 'staff', department: 'Computer Science', status: 'active' },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'staff', department: '' });

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddStaff = (e) => {
        e.preventDefault();
        setStaff(prev => [...prev, { ...newStaff, id: Date.now(), status: 'active' }]);
        setNewStaff({ name: '', email: '', role: 'staff', department: '' });
        setShowAddModal(false);
    };

    const handleDelete = (id) => {
        setStaff(prev => prev.filter(s => s.id !== id));
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

            {/* Staff Table */}
            <motion.div variants={itemVariants} className="card" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Department</th>
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
                                        <span className={`badge ${member.role === 'hod' ? 'badge-primary' : 'badge-success'}`}>
                                            {member.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{member.department}</td>
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
            </motion.div>

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
                                    <input className="input-field" placeholder="Enter department" value={newStaff.department}
                                        onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })} required />
                                </div>
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
