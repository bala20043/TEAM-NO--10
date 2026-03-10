import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, FileDown, Calendar, GraduationCap, Loader2, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI, studentAPI, departmentAPI } from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function HODAttendance() {
    const { user } = useAuth();
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [selectedCalYear, setSelectedCalYear] = useState(now.getFullYear());
    const [summaryData, setSummaryData] = useState({ year2: [], year3: [] });
    const [loading, setLoading] = useState(false);
    const [deptName, setDeptName] = useState('');

    useEffect(() => {
        if (user?.department_id) fetchDeptName();
    }, [user]);

    useEffect(() => {
        if (user?.department_id) fetchMonthSummary();
    }, [user, selectedMonth, selectedCalYear]);

    const fetchDeptName = async () => {
        try {
            const res = await departmentAPI.getAll();
            const dept = res.departments?.find(d => d.id === user.department_id);
            if (dept) setDeptName(dept.name);
        } catch (err) { console.error(err); }
    };

    const fetchMonthSummary = async () => {
        setLoading(true);
        try {
            // Get students for year 2 and year 3
            const [res2, res3] = await Promise.all([
                studentAPI.getAll(user.department_id, 2),
                studentAPI.getAll(user.department_id, 3)
            ]);

            const students2 = (res2.students || []).filter(s => s.status === 'active');
            const students3 = (res3.students || []).filter(s => s.status === 'active');

            // For each student, get their attendance stats
            const buildSummary = async (studentList) => {
                const results = await Promise.all(studentList.map(async (student) => {
                    try {
                        const statsRes = await attendanceAPI.getStats(student.id);
                        const stats = statsRes.stats || {};
                        return {
                            ...student,
                            presentDays: stats.present_days || 0,
                            absentDays: stats.absent_days || 0,
                            totalDays: stats.total_days || 0,
                            percentage: stats.percentage || 0,
                            isLow: (stats.percentage || 0) < 75
                        };
                    } catch {
                        return {
                            ...student,
                            presentDays: 0,
                            absentDays: 0,
                            totalDays: 0,
                            percentage: 0,
                            isLow: false
                        };
                    }
                }));
                return results;
            };

            const [summary2, summary3] = await Promise.all([
                buildSummary(students2),
                buildSummary(students3)
            ]);

            setSummaryData({ year2: summary2, year3: summary3 });
        } catch (err) {
            console.error('Failed to fetch attendance summary:', err);
        }
        setLoading(false);
    };

    const generatePDF = (year) => {
        const doc = new jsPDF();
        const students = year === 2 ? summaryData.year2 : summaryData.year3;

        doc.setFontSize(20);
        doc.setTextColor(30, 41, 59);
        doc.text(`${deptName} — Year ${year} Attendance`, 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Overall Attendance Summary`, 14, 30);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);

        const tableColumn = ["Reg No", "Student Name", "Present", "Absent", "Total Days", "Attendance %"];
        const tableRows = students.map(s => [
            s.reg_no, s.name, s.presentDays, s.absentDays, s.totalDays, `${s.percentage}%`
        ]);

        doc.autoTable({
            head: [tableColumn], body: tableRows, startY: 44,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241], textColor: 255 },
            styles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 5) {
                    const pct = parseInt(data.cell.text[0]);
                    if (pct < 75) { data.cell.styles.textColor = [239, 68, 68]; data.cell.styles.fontStyle = 'bold'; }
                }
            }
        });

        const lowStudents = students.filter(s => s.isLow);
        if (lowStudents.length > 0) {
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(11);
            doc.setTextColor(239, 68, 68);
            doc.text(`Warning: ${lowStudents.length} student(s) below 75% attendance`, 14, finalY);
        }

        doc.save(`${deptName.replace(/\s+/g, '_')}_Year${year}_Attendance.pdf`);
    };

    const prevMonth = () => {
        if (selectedMonth === 0) { setSelectedMonth(11); setSelectedCalYear(y => y - 1); }
        else setSelectedMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (selectedMonth === 11) { setSelectedMonth(0); setSelectedCalYear(y => y + 1); }
        else setSelectedMonth(m => m + 1);
    };

    const renderStudentTable = (students, year) => (
        <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className="section-title"><GraduationCap size={20} /> Year {year} Students ({students.length})</h2>
                <motion.button className="btn btn-secondary" onClick={() => generatePDF(year)} disabled={students.length === 0} whileHover={{ scale: 1.03 }} style={{ fontSize: '13px' }}>
                    <FileDown size={14} /> Download Year {year} PDF
                </motion.button>
            </div>
            <div className="card no-padding">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Reg No</th>
                                <th>Student Name</th>
                                <th>Present</th>
                                <th>Absent</th>
                                <th>Total Days</th>
                                <th>Attendance %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id} className={s.isLow ? 'low-attendance-row' : ''}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-400)' }}>{s.reg_no}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {s.name}
                                            {s.isLow && <AlertTriangle size={14} color="#ef4444" />}
                                        </div>
                                    </td>
                                    <td><span className="att-tag present">{s.presentDays}</span></td>
                                    <td><span className="att-tag absent">{s.absentDays}</span></td>
                                    <td>{s.totalDays}</td>
                                    <td>
                                        <span className={`pct-badge ${s.isLow ? 'low' : 'ok'}`}>{s.percentage}%</span>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No students found for Year {year}.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const lowCount2 = summaryData.year2.filter(s => s.isLow).length;
    const lowCount3 = summaryData.year3.filter(s => s.isLow).length;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ClipboardList className="text-accent" /> Dept Attendance
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Overall attendance summary for Year 2 & 3 students</p>
            </motion.div>

            {/* Calendar Header */}
            <motion.div variants={itemVariants} className="month-selector-card">
                <button className="month-nav-btn" onClick={prevMonth}><ChevronLeft size={20} /></button>
                <div className="month-display">
                    <Calendar size={18} />
                    <span className="month-text">{MONTHS[selectedMonth]} {selectedCalYear}</span>
                </div>
                <button className="month-nav-btn" onClick={nextMonth}><ChevronRight size={20} /></button>

                {!loading && (
                    <div className="low-attendance-summary">
                        {lowCount2 > 0 && <span className="low-badge"><AlertTriangle size={12} /> Year 2: {lowCount2} below 75%</span>}
                        {lowCount3 > 0 && <span className="low-badge"><AlertTriangle size={12} /> Year 3: {lowCount3} below 75%</span>}
                        {lowCount2 === 0 && lowCount3 === 0 && summaryData.year2.length + summaryData.year3.length > 0 && (
                            <span className="ok-badge"><CheckCircle2 size={12} /> All students above 75%</span>
                        )}
                    </div>
                )}
            </motion.div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary-500)" />
                </div>
            ) : (
                <>
                    {renderStudentTable(summaryData.year2, 2)}
                    {renderStudentTable(summaryData.year3, 3)}
                </>
            )}

            <style>{`
                .month-selector-card {
                    background: var(--bg-card); border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl); padding: 20px 24px; margin-top: 28px;
                    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
                }
                .month-nav-btn {
                    width: 36px; height: 36px; border-radius: 50%;
                    background: var(--bg-primary); border: 1px solid var(--border-color);
                    color: var(--text-primary); display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s;
                }
                .month-nav-btn:hover { background: var(--primary-600); color: white; }
                .month-display {
                    display: flex; align-items: center; gap: 10px;
                    font-size: 18px; font-weight: 800; font-family: var(--font-display);
                    color: var(--text-primary); min-width: 200px;
                }
                .month-text { white-space: nowrap; }
                .low-attendance-summary { display: flex; gap: 12px; margin-left: auto; flex-wrap: wrap; }
                .low-badge {
                    display: flex; align-items: center; gap: 6px;
                    padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;
                    background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);
                }
                .ok-badge {
                    display: flex; align-items: center; gap: 6px;
                    padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;
                    background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);
                }
                .section-title {
                    display: flex; align-items: center; gap: 10px;
                    font-size: 18px; font-weight: 700; color: var(--text-primary);
                }
                .low-attendance-row { background: rgba(239, 68, 68, 0.05) !important; }
                .att-tag {
                    display: inline-block; padding: 2px 10px; border-radius: 6px;
                    font-weight: 700; font-size: 13px;
                }
                .att-tag.present { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .att-tag.absent { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .pct-badge {
                    display: inline-block; padding: 4px 12px; border-radius: 8px;
                    font-weight: 800; font-size: 14px;
                }
                .pct-badge.ok { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .pct-badge.low { background: rgba(239, 68, 68, 0.15); color: #ef4444; animation: pulse-low 2s infinite; }
                @keyframes pulse-low {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </motion.div>
    );
}
