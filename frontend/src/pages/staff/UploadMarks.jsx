import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Save, Check } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function UploadMarks() {
    const [selectedDept, setSelectedDept] = useState('CSE');
    const [selectedYear, setSelectedYear] = useState('2');
    const [examType, setExamType] = useState('internal');
    const [subject, setSubject] = useState('');
    const [saved, setSaved] = useState(false);

    const [students, setStudents] = useState([
        { id: 1, name: 'Arun Kumar', reg_no: 'CSE2024001', internal: '', external: '' },
        { id: 2, name: 'Deepa Lakshmi', reg_no: 'CSE2024002', internal: '', external: '' },
        { id: 3, name: 'Karthik Raj', reg_no: 'CSE2024003', internal: '', external: '' },
        { id: 4, name: 'Sneha Patel', reg_no: 'CSE2024004', internal: '', external: '' },
        { id: 5, name: 'Ravi Shankar', reg_no: 'CSE2024005', internal: '', external: '' },
        { id: 6, name: 'Meera Nair', reg_no: 'CSE2024006', internal: '', external: '' },
    ]);

    const updateMark = (id, field, value) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Upload Marks</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Enter internal and external marks</p>
            </motion.div>

            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                <div><label className="input-label">Department</label><select className="input-field" value={selectedDept} onChange={e => setSelectedDept(e.target.value)} style={{ width: '160px' }}>
                    <option value="CSE">CSE</option><option value="ECE">ECE</option><option value="MECH">MECH</option>
                </select></div>
                <div><label className="input-label">Year</label><select className="input-field" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ width: '120px' }}>
                    <option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option>
                </select></div>
                <div><label className="input-label">Exam Type</label><select className="input-field" value={examType} onChange={e => setExamType(e.target.value)} style={{ width: '160px' }}>
                    <option value="internal">Internal</option><option value="external">External</option><option value="semester">Semester</option>
                </select></div>
                <div><label className="input-label">Subject</label><input className="input-field" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject name" style={{ width: '200px' }} /></div>
            </motion.div>

            <motion.div variants={itemVariants} className="card" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead><tr><th>Student</th><th>Reg No</th><th>Internal (50)</th><th>External (50)</th><th>Total (100)</th></tr></thead>
                        <tbody>
                            {students.map((s, i) => {
                                const total = (parseInt(s.internal) || 0) + (parseInt(s.external) || 0);
                                return (
                                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                                        <td><span style={{ fontFamily: 'monospace', color: 'var(--primary-400)' }}>{s.reg_no}</span></td>
                                        <td><input type="number" className="input-field" value={s.internal} onChange={e => updateMark(s.id, 'internal', e.target.value)} min={0} max={50} placeholder="0" style={{ width: '80px', padding: '8px 12px' }} /></td>
                                        <td><input type="number" className="input-field" value={s.external} onChange={e => updateMark(s.id, 'external', e.target.value)} min={0} max={50} placeholder="0" style={{ width: '80px', padding: '8px 12px' }} /></td>
                                        <td><span style={{ fontWeight: 700, color: total >= 50 ? 'var(--accent-500)' : total > 0 ? 'var(--warning-500)' : 'var(--text-muted)', fontSize: '16px', fontFamily: 'var(--font-display)' }}>{total || '—'}</span></td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <motion.button className="btn btn-primary btn-lg" onClick={handleSave} whileHover={{ scale: 1.03 }}>
                    <Save size={18} /> Save Marks
                </motion.button>
            </div>

            {saved && <motion.div className="toast toast-success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><Check size={18} /> Marks saved successfully!</motion.div>}
        </motion.div>
    );
}
