import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Save, Check, Loader2, Search, User,
    ChevronRight, X, AlertCircle, BookOpen, HardDrive
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI, marksAPI, subjectsAPI } from '../../services/api';

export default function UploadMarks() {
    const { user } = useAuth();

    const isBasicEng = user?.department?.name?.toLowerCase().includes('basic');
    const allowedSemesters = isBasicEng ? [1, 2] : [3, 4, 5, 6, 7, 8];

    const [semester, setSemester] = useState(allowedSemesters[0]);
    const [examType, setExamType] = useState('internal');
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentMarks, setStudentMarks] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Sync semester if department changes
    useEffect(() => {
        if (!allowedSemesters.includes(parseInt(semester))) {
            setSemester(allowedSemesters[0]);
        }
    }, [user?.department_id]);

    useEffect(() => {
        if (user?.department_id && user?.year) {
            fetchData();
        }
    }, [semester, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentRes, subjectRes] = await Promise.all([
                studentAPI.getAll(user.department_id, user.year),
                subjectsAPI.getSubjects({
                    deptId: user.department_id,
                    year: user.year,
                    semester: parseInt(semester)
                })
            ]);
            setStudents(studentRes.students || []);
            setSubjects(subjectRes.subjects || []);
        } catch (err) {
            setError('Failed to load class data');
        } finally {
            setLoading(false);
        }
    };

    const openMarkSheet = async (student) => {
        setSelectedStudent(student);
        setLoading(true);
        setError(null);
        try {
            const res = await marksAPI.getStudentSemesterMarks(student.id, parseInt(semester));
            const marksMap = {};
            // Initialize with subjects
            subjects.forEach(sub => {
                const existing = (res.marks || []).find(m => m.subject === sub.name);
                marksMap[sub.name] = {
                    internal: existing?.internal_marks || '',
                    external: existing?.external_marks || '',
                    existingExamType: existing?.exam_type
                };
            });
            setStudentMarks(marksMap);
        } catch (err) {
            setError('Failed to load student marks');
        } finally {
            setLoading(false);
        }
    };

    const updateMark = (subjectName, field, value) => {
        setStudentMarks(prev => ({
            ...prev,
            [subjectName]: { ...prev[subjectName], [field]: value }
        }));
    };

    const saveStudentMarks = async () => {
        setSaving(true);
        try {
            const records = subjects.map(sub => ({
                student_id: selectedStudent.id,
                subject: sub.name,
                internal_marks: parseFloat(studentMarks[sub.name]?.internal) || 0,
                external_marks: parseFloat(studentMarks[sub.name]?.external) || 0,
                exam_type: examType,
                semester: parseInt(semester)
            }));
            await marksAPI.uploadSemesterMarks(records);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            setSelectedStudent(null);
        } catch (err) {
            setError('Failed to save marks');
        } finally {
            setSaving(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.reg_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user?.department_id || !user?.year) {
        return (
            <div className="empty-state-container">
                <AlertCircle size={48} className="text-muted" />
                <h3>Class Assignment Required</h3>
                <p>You must be assigned to a specific department and year to manage marks.</p>
            </div>
        );
    }

    return (
        <div className="upload-marks-v2">
            <div className="page-header">
                <div>
                    <h1>Marks Entry</h1>
                    <p>{user.department_name} • Year {user.year} • Semester {semester}</p>
                </div>
                <div className="header-actions">
                    <select
                        className="select-premium"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                    >
                        {allowedSemesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                    <div className="exam-mode-toggle">
                        <button
                            className={examType === 'internal' ? 'active' : ''}
                            onClick={() => setExamType('internal')}
                        >
                            Internal
                        </button>
                        <button
                            className={examType === 'semester' ? 'active' : ''}
                            onClick={() => setExamType('semester')}
                        >
                            Semester
                        </button>
                    </div>
                </div>
            </div>

            <div className="students-grid-container">
                <div className="search-bar-premium">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search student by name or Reg No..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading && !selectedStudent ? (
                    <div className="loading-overlay-inline">
                        <Loader2 className="animate-spin" />
                        <p>Loading class list...</p>
                    </div>
                ) : (
                    <div className="students-list-grid">
                        {filteredStudents.map(student => (
                            <motion.div
                                key={student.id}
                                className="student-card-premium"
                                whileHover={{ y: -4, shadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                                onClick={() => openMarkSheet(student)}
                            >
                                <div className="student-avatar-small">
                                    {student.name.charAt(0)}
                                </div>
                                <div className="student-info-small">
                                    <h4>{student.name}</h4>
                                    <p>{student.reg_no}</p>
                                </div>
                                <ChevronRight size={18} className="arrow-icon" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Mark Updating Sheet Modal */}
            <AnimatePresence>
                {selectedStudent && (
                    <div className="modal-overlay">
                        <motion.div
                            className="mark-sheet-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        >
                            <div className="modal-header">
                                <div className="modal-title-group">
                                    <div className="student-avatar-large">
                                        {selectedStudent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3>{selectedStudent.name}</h3>
                                        <p>{selectedStudent.reg_no} • Sem {semester} • {examType === 'internal' ? 'Internal Entry' : 'Final Exam Entry'}</p>
                                    </div>
                                </div>
                                <button className="close-btn" onClick={() => setSelectedStudent(null)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="modal-body">
                                {subjects.length === 0 ? (
                                    <div className="no-subjects-warning">
                                        <BookOpen size={32} />
                                        <p>No subjects defined for this semester. Please add subjects first.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="mark-entry-table">
                                            <thead>
                                                <tr>
                                                    <th>Subject</th>
                                                    <th className="text-center">Internal (50)</th>
                                                    <th className="text-center">External (50)</th>
                                                    <th className="text-center">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {subjects.map(sub => {
                                                    const marks = studentMarks[sub.name] || {};
                                                    const total = (parseFloat(marks.internal) || 0) + (parseFloat(marks.external) || 0);
                                                    const isSemesterMode = examType === 'semester';
                                                    const internalDisabled = isSemesterMode && marks.existingExamType === 'internal';

                                                    return (
                                                        <tr key={sub.id}>
                                                            <td className="subject-name-cell">{sub.name}</td>
                                                            <td className="input-cell px-4">
                                                                <input
                                                                    type="number"
                                                                    min="0" max="50"
                                                                    value={marks.internal}
                                                                    onChange={(e) => updateMark(sub.name, 'internal', e.target.value)}
                                                                    disabled={isSemesterMode}
                                                                    placeholder="—"
                                                                />
                                                            </td>
                                                            <td className="input-cell px-4">
                                                                <input
                                                                    type="number"
                                                                    min="0" max="50"
                                                                    value={marks.external}
                                                                    onChange={(e) => updateMark(sub.name, 'external', e.target.value)}
                                                                    disabled={!isSemesterMode}
                                                                    placeholder="—"
                                                                />
                                                            </td>
                                                            <td className="total-cell text-center">
                                                                <span className={total >= 50 ? 'pass' : total > 0 ? 'fail' : ''}>
                                                                    {total || '—'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                {error && <div className="modal-error"><AlertCircle size={16} /> {error}</div>}
                                <div className="flex-spacer" />
                                <button className="btn-secondary" onClick={() => setSelectedStudent(null)}>Cancel</button>
                                <button
                                    className="btn-primary"
                                    onClick={saveStudentMarks}
                                    disabled={saving || subjects.length === 0}
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    {saving ? 'Saving...' : 'Save Marks'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {showSuccess && (
                <motion.div
                    className="toast toast-success"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                >
                    <Check size={18} /> Marks updated successfully
                </motion.div>
            )}

            <style>{`
        .upload-marks-v2 {
          padding: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .header-actions {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .select-premium {
          padding: 10px 16px;
          border-radius: var(--radius-md);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-weight: 600;
          cursor: pointer;
        }

        .exam-mode-toggle {
          display: flex;
          background: var(--bg-tertiary);
          padding: 4px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }

        .exam-mode-toggle button {
          padding: 8px 16px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          color: var(--text-muted);
        }

        .exam-mode-toggle button.active {
          background: var(--bg-card);
          color: var(--primary-600);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .search-bar-premium {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          margin-bottom: 24px;
          color: var(--text-muted);
        }

        .search-bar-premium input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 15px;
          outline: none;
        }

        .students-list-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .student-card-premium {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.2s;
        }

        .student-card-premium:hover {
          border-color: var(--primary-300);
          background: var(--bg-secondary);
        }

        .student-avatar-small {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--primary-500), #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 18px;
        }

        .student-info-small h4 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .student-info-small p {
          font-size: 12px;
          color: var(--text-muted);
          font-family: monospace;
        }

        .arrow-icon {
          margin-left: auto;
          color: var(--text-muted);
          opacity: 0.5;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .mark-sheet-modal {
          background: var(--bg-card);
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          border-radius: var(--radius-2xl);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .student-avatar-large {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--primary-600), #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 24px;
        }

        .modal-title-group h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .modal-title-group p {
          font-size: 13px;
          color: var(--text-muted);
        }

        .close-btn {
          color: var(--text-muted);
          transition: color 0.2s;
        }

        .close-btn:hover { color: var(--text-primary); }

        .modal-body {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }

        .mark-entry-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 8px;
        }

        .mark-entry-table th {
          text-align: left;
          padding: 12px;
          font-size: 13px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .mark-entry-table tr td {
          padding: 16px;
          background: var(--bg-tertiary);
        }

        .mark-entry-table tr td:first-child { border-radius: var(--radius-lg) 0 0 var(--radius-lg); }
        .mark-entry-table tr td:last-child { border-radius: 0 var(--radius-lg) var(--radius-lg) 0; }

        .subject-name-cell {
          font-weight: 600;
          color: var(--text-primary);
        }

        .mark-entry-table input {
          width: 80px;
          padding: 8px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          text-align: center;
          color: var(--text-primary);
          font-weight: 700;
        }

        .total-cell span {
          font-size: 18px;
          font-weight: 800;
          font-family: var(--font-display);
        }

        .total-cell span.pass { color: #10b981; }
        .total-cell span.fail { color: #f59e0b; }

        .modal-footer {
          padding: 24px;
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .no-subjects-warning {
          text-align: center;
          padding: 60px 20px;
          color: #f59e0b;
        }

        .no-subjects-warning p {
          margin-top: 12px;
          font-size: 15px;
          font-weight: 500;
        }

        .modal-error {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ef4444;
          font-size: 14px;
          font-weight: 500;
        }

        .loading-overlay-inline {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px 0;
          color: var(--text-muted);
        }

        /* Utils */
        .text-center { text-align: center; }
        .flex-spacer { flex: 1; }
        .px-4 { padding-left: 16px; padding-right: 16px; }

        .toast-success {
          position: fixed;
          bottom: 32px;
          right: 32px;
          background: #10b981;
          color: white;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
          z-index: 2000;
        }
      `}</style>
        </div>
    );
}
