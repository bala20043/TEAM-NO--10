import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, FileDown, GraduationCap, Loader2, Award, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { marksAPI, departmentAPI } from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function HODMarks() {
    const { user } = useAuth();
    const [selectedYear, setSelectedYear] = useState('2');
    const [selectedSemester, setSelectedSemester] = useState('3');
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deptName, setDeptName] = useState('');
    const [search, setSearch] = useState('');

    const semesterOptions = { '2': [3, 4], '3': [5, 6] };

    useEffect(() => {
        if (user?.department_id) { fetchDeptName(); fetchMarks(); }
    }, [user, selectedYear, selectedSemester]);

    useEffect(() => {
        const validSems = semesterOptions[selectedYear] || [];
        if (!validSems.includes(parseInt(selectedSemester))) {
            setSelectedSemester(validSems[0]?.toString() || '3');
        }
    }, [selectedYear]);

    const fetchDeptName = async () => {
        try {
            const res = await departmentAPI.getAll();
            const dept = res.departments?.find(d => d.id === user.department_id);
            if (dept) setDeptName(dept.name);
        } catch (err) { console.error(err); }
    };

    const fetchMarks = async () => {
        setLoading(true);
        try {
            // Fetch all marks for this year (both internal and semester)
            const res = await marksAPI.getDeptMarks(user.department_id, selectedYear, null);
            let data = res.marks || [];
            // Filter by semester
            data = data.filter(m => m.semester?.toString() === selectedSemester);
            // Filter out entries with no marks (students with no marks show as null subject)
            data = data.filter(m => m.subject);
            setMarks(data);
        } catch (err) {
            console.error('Failed to fetch marks:', err);
        }
        setLoading(false);
    };

    // Find top performer (highest total across all subjects)
    const getTopPerformer = () => {
        if (marks.length === 0) return null;
        const studentTotals = {};
        marks.forEach(m => {
            const key = m.student_id || m.reg_no;
            if (!studentTotals[key]) studentTotals[key] = { name: m.name, reg_no: m.reg_no, total: 0, subjects: 0 };
            studentTotals[key].total += (m.total || 0);
            studentTotals[key].subjects++;
        });
        return Object.values(studentTotals).sort((a, b) => b.total - a.total)[0];
    };

    const topPerformer = getTopPerformer();

    const generatePDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text(`${deptName} — Semester Result`, 14, 22);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Year ${selectedYear} | Semester ${selectedSemester}`, 14, 30);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);

        if (topPerformer) {
            doc.text(`Top Performer: ${topPerformer.name} (${topPerformer.reg_no}) — Total: ${topPerformer.total}`, 14, 42);
        }

        const tableColumn = ["Reg No", "Student Name", "Subject", "Internal", "External", "Total"];
        const tableRows = marks.map(m => [
            m.reg_no, m.name, m.subject, m.internal_marks, m.external_marks || '—', m.total
        ]);

        doc.autoTable({
            head: [tableColumn], body: tableRows,
            startY: topPerformer ? 48 : 42,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241], textColor: 255 },
            styles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
        });

        doc.save(`${deptName.replace(/\s+/g, '_')}_Year${selectedYear}_Sem${selectedSemester}_Results.pdf`);
    };

    const filteredMarks = marks.filter(m =>
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.reg_no?.toLowerCase().includes(search.toLowerCase()) ||
        m.subject?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Award className="text-primary-400" /> Dept Marks Report
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Semester results for Year 2 & 3</p>
                </div>
                <motion.button
                    className="btn btn-primary" onClick={generatePDF}
                    disabled={marks.length === 0 || loading}
                    whileHover={{ scale: 1.05 }}
                    style={{ padding: '12px 24px', borderRadius: '12px' }}
                >
                    <FileDown size={18} /> Export Results PDF
                </motion.button>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="filter-panel">
                <div className="filter-group">
                    <label><GraduationCap size={14} /> Select Year & Semester</label>
                    <div className="year-sem-selector">
                        <select className="input-field" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                            <option value="2">Year 2 (Sem 3-4)</option>
                            <option value="3">Year 3 (Sem 5-6)</option>
                        </select>
                        <select className="input-field" value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
                            {(semesterOptions[selectedYear] || []).map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="filter-group" style={{ flex: 2 }}>
                    <label><Search size={14} /> Search</label>
                    <div className="search-wrapper">
                        <Search size={16} className="search-icon" />
                        <input type="text" className="input-field search-input" placeholder="Student name, Reg No or Subject..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
            </motion.div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary-500)" />
                </div>
            ) : (
                <div className="card no-padding" style={{ marginTop: '24px' }}>
                    <div className="table-header-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Showing {filteredMarks.length} records — Year {selectedYear}, Semester {selectedSemester}</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{deptName}</p>
                        </div>
                        {topPerformer && (
                            <div className="top-performer-badge">
                                <div className="tp-icon"><Award size={16} /></div>
                                <div>
                                    <p className="tp-label">Top Performer</p>
                                    <p className="tp-name">{topPerformer.name} <span className="tp-score">({topPerformer.total} marks)</span></p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Reg No</th>
                                    <th>Name</th>
                                    <th>Subject</th>
                                    <th>Internal</th>
                                    <th>External</th>
                                    <th style={{ textAlign: 'center' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMarks.map((m, i) => (
                                    <tr key={`${m.student_id}-${m.subject}-${i}`}>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--primary-400)', fontWeight: 600 }}>{m.reg_no}</td>
                                        <td>{m.name}</td>
                                        <td>{m.subject}</td>
                                        <td>{m.internal_marks}</td>
                                        <td>{m.external_marks || '—'}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`score-badge ${m.total >= 50 ? 'pass' : 'fail'}`}>{m.total}</span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredMarks.length === 0 && (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No semester results found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style>{`
                .filter-panel {
                    background: var(--bg-card); border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl); padding: 24px; margin-top: 28px;
                    display: flex; gap: 24px; flex-wrap: wrap;
                }
                .filter-group { display: flex; flex-direction: column; gap: 10px; min-width: 250px; }
                .filter-group label { font-size: 13px; font-weight: 700; color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
                .year-sem-selector { display: flex; gap: 8px; }
                .search-wrapper { position: relative; display: flex; align-items: center; }
                .search-icon { position: absolute; left: 12px; color: var(--text-muted); pointer-events: none; }
                .search-input { padding-left: 40px !important; }
                .table-header-info { padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
                .table-header-info h3 { font-size: 15px; font-weight: 700; color: var(--text-primary); }
                .top-performer-badge {
                    background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);
                    padding: 8px 16px; border-radius: 12px; display: flex; align-items: center; gap: 10px;
                }
                .tp-icon {
                    width: 32px; height: 32px; border-radius: 50%;
                    background: var(--success-500, #10b981); display: flex;
                    align-items: center; justify-content: center; color: white;
                }
                .tp-label { font-size: 10px; font-weight: 700; color: var(--success-600, #059669); text-transform: uppercase; margin-bottom: 2px; }
                .tp-name { font-size: 14px; font-weight: 800; color: var(--text-primary); }
                .tp-score { font-size: 12px; font-weight: 600; color: var(--text-muted); }
                .score-badge { display: inline-block; min-width: 44px; padding: 4px 8px; border-radius: 8px; font-weight: 800; font-size: 14px; }
                .score-badge.pass { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .score-badge.fail { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
            `}</style>
        </motion.div>
    );
}
