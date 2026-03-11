import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Loader2, Award, Percent, ClipboardCheck } from 'lucide-react';
import { marksAPI } from '../../services/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function MyMarks() {
    const [loading, setLoading] = useState(true);
    const [allMarks, setAllMarks] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('1');
    const [viewMode, setViewMode] = useState('semester'); // 'internal' or 'semester'
    const [summary, setSummary] = useState({ average: 0, highest: { total: 0, name: '' }, count: 0 });

    useEffect(() => {
        fetchMarks();
    }, []);

    const fetchMarks = async () => {
        try {
            const res = await marksAPI.getMyMarks();
            if (res.marks) {
                setAllMarks(res.marks);
                // Set default semester to the highest one available
                const semesters = [...new Set(res.marks.map(m => m.semester))];
                if (semesters.length > 0) {
                    setSelectedSemester(Math.max(...semesters).toString());
                }
                updateSummary(res.marks);
            }
        } catch (err) {
            console.error('Failed to fetch marks:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateSummary = (marks) => {
        if (marks.length === 0) {
            setSummary({ average: 0, highest: { total: 0, name: '' }, count: 0 });
            return;
        }
        const marksList = marks.map(m => ({
            total: (m.internal_marks || 0) + (m.external_marks || 0),
            name: m.subject
        }));
        const avg = marksList.reduce((sum, m) => sum + m.total, 0) / marksList.length;
        const highest = marksList.reduce((max, m) => m.total > max.total ? m : max, marksList[0]);
        setSummary({ average: Math.round(avg * 10) / 10, highest: { total: highest.total, name: highest.name }, count: marks.length });
    };

    const getGrade = (total) => {
        if (total >= 90) return 'A+';
        if (total >= 80) return 'A';
        if (total >= 70) return 'B+';
        if (total >= 60) return 'B';
        if (total >= 50) return 'C';
        return 'F';
    };

    const gradeColors = { 'A+': '#10b981', 'A': '#06b6d4', 'B+': '#6366f1', 'B': '#f59e0b', 'C': '#94a3b8', 'F': '#ef4444' };
    const semestersPresent = [...new Set(allMarks.map(m => m.semester))].sort((a, b) => a - b);

    // Deduplicate marks by subject for the selected semester
    const semesterMarks = allMarks.filter(m => m.semester?.toString() === selectedSemester);
    const subjectMap = {};
    semesterMarks.forEach(m => {
        // Prefer 'semester' exam type or the one with external marks if duplicates exist
        const existing = subjectMap[m.subject];
        if (!existing || m.exam_type === 'semester' || (m.external_marks && !existing.external_marks)) {
            subjectMap[m.subject] = m;
        }
    });
    const filteredMarks = Object.values(subjectMap);

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '400px' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary-500)" />
            </div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="my-marks-page">
            <div className="page-header-premium">
                <motion.div variants={itemVariants}>
                    <h1 className="display-title">My Performance</h1>
                    <p className="text-muted">Track your academic progress across semesters</p>
                </motion.div>

                <div className="header-controls">
                    <div className="toggle-group-premium">
                        <button
                            className={viewMode === 'internal' ? 'active' : ''}
                            onClick={() => setViewMode('internal')}
                        >
                            <ClipboardCheck size={16} />
                            Internals
                        </button>
                        <button
                            className={viewMode === 'semester' ? 'active' : ''}
                            onClick={() => setViewMode('semester')}
                        >
                            <Award size={16} />
                            Final Results
                        </button>
                    </div>

                    <div className="sem-picker-premium">
                        {semestersPresent.map(sem => (
                            <button
                                key={sem}
                                className={selectedSemester === sem.toString() ? 'active' : ''}
                                onClick={() => setSelectedSemester(sem.toString())}
                            >
                                Sem {sem}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {allMarks.length === 0 ? (
                <motion.div variants={itemVariants} className="card-empty">
                    <FileText size={48} />
                    <h3>Awaiting Results</h3>
                    <p>Your marks haven't been uploaded for any semester yet.</p>
                </motion.div>
            ) : (
                <>
                    <motion.div variants={itemVariants} className="stats-grid-premium">
                        <div className="stat-card-premium">
                            <div className="stat-icon purple"><Percent size={20} /></div>
                            <div className="stat-info">
                                <span>CGPA / Avg</span>
                                <h3>{summary.average}%</h3>
                            </div>
                        </div>
                        <div className="stat-card-premium">
                            <div className="stat-icon green"><Award size={20} /></div>
                            <div className="stat-info">
                                <span>Best Subject</span>
                                <h3>{summary.highest.name}</h3>
                            </div>
                        </div>
                        <div className="stat-card-premium">
                            <div className="stat-icon blue"><FileText size={20} /></div>
                            <div className="stat-info">
                                <span>Credits/Courses</span>
                                <h3>{summary.count}</h3>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="marks-card-premium">
                        <div className="card-header">
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{viewMode === 'internal' ? 'Internal Assessment' : 'Semester Final Results'}</h3>
                            <button className="btn-icon-text hide-mobile">
                                <Download size={16} />
                                Export PDF
                            </button>
                        </div>
                        
                        {/* Desktop View */}
                        <div className="table-responsive hide-mobile">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Subject Name</th>
                                        {viewMode === 'internal' ? (
                                            <>
                                                <th className="text-center">Internal (50)</th>
                                                <th className="text-center">Status</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="text-center">Internal</th>
                                                <th className="text-center">External</th>
                                                <th className="text-center">Total (100)</th>
                                                <th className="text-center">Grade</th>
                                                <th className="text-center">Result</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="wait">
                                        {filteredMarks.length > 0 ? filteredMarks.map((m, i) => {
                                            const total = (m.internal_marks || 0) + (m.external_marks || 0);
                                            const grade = getGrade(total);
                                            return (
                                                <motion.tr
                                                    key={`${m.subject}-${selectedSemester}-${viewMode}-${i}`}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    transition={{ delay: i * 0.05 }}
                                                >
                                                    <td className="subject-cell">{m.subject}</td>
                                                    {viewMode === 'internal' ? (
                                                        <>
                                                            <td className="text-center font-bold">{m.internal_marks || 0}</td>
                                                            <td className="text-center">
                                                                <span className={`badge-status ${m.internal_marks >= 25 ? 'success' : 'warning'}`}>
                                                                    {m.internal_marks >= 25 ? 'Ready' : 'In Progress'}
                                                                </span>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="text-center text-muted">{m.internal_marks || 0}</td>
                                                            <td className="text-center text-muted">{m.external_marks || '—'}</td>
                                                            <td className="text-center">
                                                                <span className={`total-score ${total >= 50 ? 'pass' : 'fail'}`}>
                                                                    {total || '—'}
                                                                </span>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className="grade-badge" style={{ background: `${gradeColors[grade]}20`, color: gradeColors[grade] }}>
                                                                    {grade}
                                                                </span>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className={`status-pill ${total >= 50 ? 'pass' : 'fail'}`}>
                                                                    {total >= 50 ? 'PASS' : 'FAIL'}
                                                                </span>
                                                            </td>
                                                        </>
                                                    )}
                                                </motion.tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={viewMode === 'internal' ? 3 : 6} className="text-center py-8 text-muted">
                                                    No marks found for Semester {selectedSemester}
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                            {filteredMarks.map((m, i) => {
                                const total = (m.internal_marks || 0) + (m.external_marks || 0);
                                const grade = getGrade(total);
                                return (
                                    <motion.div 
                                        key={i} 
                                        className="card" 
                                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '16px' }}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', maxWidth: '70%' }}>{m.subject}</h4>
                                            {viewMode === 'semester' && (
                                                <span className="grade-badge" style={{ background: `${gradeColors[grade]}20`, color: gradeColors[grade] }}>
                                                    {grade}
                                                </span>
                                            )}
                                            {viewMode === 'internal' && (
                                                <span className={`badge-status ${m.internal_marks >= 25 ? 'success' : 'warning'}`}>
                                                    {m.internal_marks >= 25 ? 'Ready' : 'Entry'}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Internal</p>
                                                <p style={{ fontSize: '16px', fontWeight: 700 }}>{m.internal_marks || 0}</p>
                                            </div>
                                            {viewMode === 'semester' && (
                                                <>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>External</p>
                                                        <p style={{ fontSize: '16px', fontWeight: 700 }}>{m.external_marks || '—'}</p>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</p>
                                                        <p className={`total-score ${total >= 50 ? 'pass' : 'fail'}`} style={{ fontSize: '20px' }}>{total || '—'}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                            
                            {filteredMarks.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No marks found for Semester {selectedSemester}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}

            <style>{`
                .my-marks-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px;
                }

                .page-header-premium {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 32px;
                    gap: 24px;
                }

                .display-title {
                    font-size: 32px;
                    font-weight: 800;
                    font-family: var(--font-display);
                    background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-controls {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 16px;
                }

                .toggle-group-premium {
                    background: var(--bg-card);
                    padding: 4px;
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--border-color);
                    display: flex;
                }

                .toggle-group-premium button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: var(--radius-lg);
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-muted);
                    transition: all 0.2s;
                }

                .toggle-group-premium button.active {
                    background: var(--primary-600);
                    color: white;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                .sem-picker-premium {
                    display: flex;
                    gap: 6px;
                    background: var(--bg-tertiary);
                    padding: 4px;
                    border-radius: var(--radius-lg);
                }

                .sem-picker-premium button {
                    padding: 6px 14px;
                    border-radius: var(--radius-md);
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .sem-picker-premium button.active {
                    background: var(--bg-card);
                    color: var(--primary-500);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .stats-grid-premium {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .stat-card-premium {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl);
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .stat-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stat-icon.purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
                .stat-icon.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .stat-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

                .stat-info span { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
                .stat-info h3 { font-size: 24px; font-weight: 800; font-family: var(--font-display); }

                .marks-card-premium {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-2xl);
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                }

                .card-header {
                    padding: 24px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .card-header h3 { font-size: 18px; font-weight: 700; }

                .premium-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .premium-table th {
                    padding: 16px 24px;
                    background: var(--bg-tertiary);
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    text-align: left;
                }

                .premium-table td {
                    padding: 18px 24px;
                    border-bottom: 1px solid var(--border-color);
                    font-size: 15px;
                }

                .subject-cell { font-weight: 700; color: var(--text-primary); }

                .total-score { font-size: 18px; font-weight: 800; font-family: var(--font-display); }
                .total-score.pass { color: var(--accent-500); }
                .total-score.fail { color: #f59e0b; }

                .grade-badge {
                    padding: 4px 10px;
                    border-radius: var(--radius-md);
                    font-weight: 800;
                    font-size: 13px;
                }

                .status-pill {
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                }

                .status-pill.pass { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill.fail { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

                .badge-status {
                    padding: 4px 10px;
                    border-radius: var(--radius-md);
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .badge-status.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .badge-status.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

                .btn-icon-text {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-lg);
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .card-empty {
                    padding: 80px 24px;
                    text-align: center;
                    color: var(--text-muted);
                }

                .card-empty h3 { margin-top: 16px; color: var(--text-primary); }

                .flex-center { display: flex; align-items: center; justify-content: center; }

                @media (max-width: 768px) {
                    .page-header-premium { flex-direction: column; align-items: flex-start; }
                    .header-controls { align-items: flex-start; width: 100%; }
                    .toggle-group-premium { width: 100%; }
                    .toggle-group-premium button { flex: 1; justify-content: center; }
                    .sem-picker-premium { width: 100%; overflow-x: auto; }
                }
            `}</style>
        </motion.div>
    );
}
