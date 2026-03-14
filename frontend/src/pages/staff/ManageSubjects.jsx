import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subjectsAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Save, AlertCircle, CheckCircle, ChevronRight, Book } from 'lucide-react';

export default function ManageSubjects() {
  const { user } = useAuth();

  // Logic for allowed semesters: 
  // Basic Engineering (ID: 1) -> Sem 1 & 2
  // Others -> Sem 3 to 8
  const isBasicEng = user?.department?.name?.toLowerCase().includes('basic');
  const allowedSemesters = isBasicEng ? [1, 2] : [3, 4, 5, 6, 7, 8];

  const [semester, setSemester] = useState(allowedSemesters[0]);
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Sync semester if department changes or component mounts
  useEffect(() => {
    if (!allowedSemesters.includes(semester)) {
      setSemester(allowedSemesters[0]);
    }
  }, [user?.department_id]);

  useEffect(() => {
    fetchSubjects();
  }, [semester, user?.department_id]);

  const fetchSubjects = async () => {
    if (!user?.department_id || !user?.year) return;
    setLoading(true);
    try {
      const data = await subjectsAPI.getSubjects({
        deptId: user.department_id,
        year: user.year,
        semester
      });
      setSubjects(data.subjects.map(s => s.name));
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setMessage({ type: 'error', text: 'Failed to load subjects' });
    } finally {
      setLoading(false);
    }
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    if (subjects.includes(newSubject.trim())) {
      setMessage({ type: 'error', text: 'Subject already exists' });
      return;
    }
    setSubjects([...subjects, newSubject.trim()]);
    setNewSubject('');
  };

  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await subjectsAPI.syncSubjects({
        department_id: user.department_id,
        year: user.year,
        semester,
        subjects
      });
      setMessage({ type: 'success', text: 'Subjects updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save subjects' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="manage-subjects-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <BookOpen size={24} />
          </div>
          <div>
            <h1>Curriculum Management</h1>
            <p>Define subjects for {user?.department_name || 'your department'}, Year {user?.year}</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        {/* Semester Selection */}
        <div className="sidebar-card">
          <div className="sidebar-header">
            <h3>Select Semester</h3>
            <span className={`dept-tag ${isBasicEng ? 'be' : 'core'}`}>
              {isBasicEng ? 'Basic Engineering' : 'Core Dept'}
            </span>
          </div>

          <div className="semester-grid">
            {allowedSemesters.map((s) => (
              <button
                key={s}
                className={`sem-btn ${semester === s ? 'active' : ''}`}
                onClick={() => setSemester(s)}
              >
                Sem {s}
              </button>
            ))}
          </div>

          <div className="info-box">
            <AlertCircle size={16} />
            <p>
              {isBasicEng
                ? "Basic Engineering staff manage 1st & 2nd sem only."
                : "Core department staff manage 3rd to 8th sem."}
            </p>
          </div>
        </div>

        {/* Subjects List */}
        <div className="main-card">
          <div className="card-header">
            <h3>Subjects for Semester {semester}</h3>
            <span className="count-badge">{subjects.length} Subjects</span>
          </div>

          <div className="add-subject-form">
            <input
              type="text"
              placeholder="Enter subject name (e.g. Data Structures)"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSubject()}
            />
            <button className="add-btn" onClick={addSubject}>
              <Plus size={18} />
              Add
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="loader-state"
              >
                <div className="spinner" />
                <p>Loading subjects...</p>
              </motion.div>
            ) : subjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="empty-state"
              >
                <Book size={48} />
                <p>No subjects defined for this semester yet.</p>
              </motion.div>
            ) : (
              <div className="subjects-list">
                {subjects.map((subject, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="subject-item"
                  >
                    <div className="subject-info">
                      <ChevronRight size={16} className="text-muted" />
                      <span>{subject}</span>
                    </div>
                    <button className="delete-btn" onClick={() => removeSubject(index)}>
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          <div className="card-footer">
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`status-message ${message.type}`}
                >
                  {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              className="save-btn"
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? <div className="spinner-sm" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .manage-subjects-container {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, var(--primary-600), #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
        }

        .page-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .page-header p {
          color: var(--text-muted);
          font-size: 14px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
        }

        .main-card, .sidebar-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 24px;
        }

        .sidebar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .sidebar-card h3 {
          font-size: 16px;
          font-weight: 600;
        }

        .dept-tag {
            font-size: 10px;
            font-weight: 800;
            padding: 4px 8px;
            border-radius: 4px;
            text-transform: uppercase;
        }
        .dept-tag.be { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .dept-tag.core { background: rgba(168, 85, 247, 0.1); color: #a855f7; }

        .semester-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 24px;
        }

        .sem-btn {
          padding: 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-secondary);
          font-weight: 600;
          transition: all 0.2s;
        }

        .sem-btn:hover {
          background: var(--primary-50);
          color: var(--primary-600);
          border-color: var(--primary-200);
        }

        .sem-btn.active {
          background: var(--primary-600);
          color: white;
          border-color: var(--primary-600);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .info-box {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: rgba(99, 102, 241, 0.05);
          border-radius: var(--radius-md);
          color: var(--primary-700);
          font-size: 13px;
          line-height: 1.5;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .count-badge {
          padding: 4px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .add-subject-form {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .add-subject-form input {
          flex: 1;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 20px;
          background: var(--primary-600);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          transition: background 0.2s;
        }

        .add-btn:hover {
          background: var(--primary-700);
        }

        .subjects-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .subject-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          transition: transform 0.2s;
        }

        .subject-item:hover {
          border-color: var(--primary-200);
          transform: translateX(4px);
        }

        .subject-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }

        .delete-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
          border-radius: var(--radius-md);
          transition: background 0.2s;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .card-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-message {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .status-message.success { color: #10b981; }
        .status-message.error { color: #ef4444; }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #10b981;
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          transition: background 0.2s;
        }

        .save-btn:hover { background: #059669; }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 60px 0;
          color: var(--text-muted);
        }

        .loader-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px 0;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-color);
          border-top-color: var(--primary-600);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner-sm {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
