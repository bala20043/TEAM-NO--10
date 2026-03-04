import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Check, X, Save, Calendar, Building2 } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function TakeAttendance() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDept, setSelectedDept] = useState('CSE');
    const [selectedYear, setSelectedYear] = useState('2');
    const [saved, setSaved] = useState(false);

    const [students, setStudents] = useState([
        { id: 1, name: 'Arun Kumar', reg_no: 'CSE2024001', status: null },
        { id: 2, name: 'Deepa Lakshmi', reg_no: 'CSE2024002', status: null },
        { id: 3, name: 'Karthik Raj', reg_no: 'CSE2024003', status: null },
        { id: 4, name: 'Sneha Patel', reg_no: 'CSE2024004', status: null },
        { id: 5, name: 'Ravi Shankar', reg_no: 'CSE2024005', status: null },
        { id: 6, name: 'Meera Nair', reg_no: 'CSE2024006', status: null },
        { id: 7, name: 'Vikram Das', reg_no: 'CSE2024007', status: null },
        { id: 8, name: 'Priya Mohan', reg_no: 'CSE2024008', status: null },
    ]);

    const markAll = (status) => setStudents(prev => prev.map(s => ({ ...s, status })));
    const toggleStudent = (id) => setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s));

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const presentCount = students.filter(s => s.status === 'present').length;
    const absentCount = students.filter(s => s.status === 'absent').length;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Take Attendance</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Mark student attendance by department and year</p>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                <div>
                    <label className="input-label">Date</label>
                    <input type="date" className="input-field" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: '180px' }} />
                </div>
                <div>
                    <label className="input-label">Department</label>
                    <select className="input-field" value={selectedDept} onChange={e => setSelectedDept(e.target.value)} style={{ width: '180px' }}>
                        <option value="CSE">CSE</option><option value="ECE">ECE</option><option value="MECH">MECH</option><option value="CIVIL">CIVIL</option>
                    </select>
                </div>
                <div>
                    <label className="input-label">Year</label>
                    <select className="input-field" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ width: '120px' }}>
                        <option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option>
                    </select>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', marginTop: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <motion.button className="btn btn-success btn-sm" onClick={() => markAll('present')} whileHover={{ scale: 1.05 }}>
                    <Check size={14} /> Mark All Present
                </motion.button>
                <motion.button className="btn btn-danger btn-sm" onClick={() => markAll('absent')} whileHover={{ scale: 1.05 }}>
                    <X size={14} /> Mark All Absent
                </motion.button>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--accent-500)' }}>Present: {presentCount}</span>
                    <span style={{ color: 'var(--danger-500)' }}>Absent: {absentCount}</span>
                    <span style={{ color: 'var(--text-muted)' }}>Total: {students.length}</span>
                </div>
            </motion.div>

            {/* Student List */}
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginTop: '20px' }}>
                {students.map((s, i) => (
                    <motion.div key={s.id} className="card" variants={itemVariants}
                        onClick={() => toggleStudent(s.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            cursor: 'pointer', padding: '16px',
                            borderColor: s.status === 'present' ? 'var(--accent-500)' : s.status === 'absent' ? 'var(--danger-500)' : 'var(--border-color)',
                            background: s.status === 'present' ? 'rgba(16,185,129,0.05)' : s.status === 'absent' ? 'rgba(239,68,68,0.05)' : 'var(--bg-card)',
                            transition: 'all 0.2s ease',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '38px', height: '38px', borderRadius: 'var(--radius-full)',
                                    background: s.status === 'present' ? 'var(--accent-500)' : s.status === 'absent' ? 'var(--danger-500)' : 'var(--gray-600)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                }}>
                                    {s.status === 'present' ? <Check size={18} /> : s.status === 'absent' ? <X size={18} /> : s.name.charAt(0)}
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.reg_no}</p>
                                </div>
                            </div>
                            <span className={`badge ${s.status === 'present' ? 'badge-success' : s.status === 'absent' ? 'badge-danger' : ''}`} style={!s.status ? { background: 'var(--bg-tertiary)', color: 'var(--text-muted)' } : {}}>
                                {s.status || 'not marked'}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Save */}
            <motion.div variants={itemVariants} style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button className="btn btn-primary btn-lg" onClick={handleSave} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Save size={18} /> Save Attendance
                </motion.button>
            </motion.div>

            {saved && (
                <motion.div className="toast toast-success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                    <Check size={18} /> Attendance saved successfully!
                </motion.div>
            )}
        </motion.div>
    );
}
