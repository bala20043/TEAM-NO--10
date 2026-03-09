import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Users, GraduationCap, Building2, Loader2, X } from 'lucide-react';
import { studentAPI, departmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function HODStudents() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewStudent, setViewStudent] = useState(null);
    const [stats, setStats] = useState({ year2: 0, year3: 0 });

    useEffect(() => {
        if (user?.department_id) fetchStudents();
    }, [user]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await studentAPI.getAll(user.department_id);
            if (res.students) {
                // Filter for active students in Year 2 and Year 3
                const relevantStudents = res.students.filter(s => s.status === 'active' && (s.year === 2 || s.year === 3));
                setStudents(relevantStudents);

                setStats({
                    year2: relevantStudents.filter(s => s.year === 2).length,
                    year3: relevantStudents.filter(s => s.year === 3).length
                });
            }
        } catch (err) {
            console.error('Failed to fetch students:', err);
        }
        setLoading(false);
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.reg_no.toLowerCase().includes(search.toLowerCase())
    );

    const year2Students = filteredStudents.filter(s => s.year === 2);
    const year3Students = filteredStudents.filter(s => s.year === 3);

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Department Students</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Managing Year 2 and Year 3 students of your department</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="stat-card-mini">
                        <span className="label">Year 2</span>
                        <span className="value">{stats.year2}</span>
                    </div>
                    <div className="stat-card-mini">
                        <span className="label">Year 3</span>
                        <span className="value">{stats.year3}</span>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="search-bar-container">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by name or registration number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
            </motion.div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary-500)" />
                </div>
            ) : (
                <>
                    {/* Year 2 Students */}
                    <div style={{ marginTop: '32px' }}>
                        <h2 className="section-title"><GraduationCap size={20} /> Second Year Students ({year2Students.length})</h2>
                        <div className="student-grid">
                            {year2Students.map(student => (
                                <StudentCard key={student.id} student={student} onView={() => setViewStudent(student)} />
                            ))}
                            {year2Students.length === 0 && <p className="empty-msg">No Year 2 students found.</p>}
                        </div>
                    </div>

                    {/* Year 3 Students */}
                    <div style={{ marginTop: '48px' }}>
                        <h2 className="section-title"><GraduationCap size={20} /> Third Year Students ({year3Students.length})</h2>
                        <div className="student-grid">
                            {year3Students.map(student => (
                                <StudentCard key={student.id} student={student} onView={() => setViewStudent(student)} />
                            ))}
                            {year3Students.length === 0 && <p className="empty-msg">No Year 3 students found.</p>}
                        </div>
                    </div>
                </>
            )}

            {/* Modal */}
            <AnimatePresence>
                {viewStudent && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewStudent(null)}>
                        <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Student Profile</h3>
                                <button className="close-btn" onClick={() => setViewStudent(null)}><X size={20} /></button>
                            </div>
                            <div className="profile-header">
                                <div className="avatar">{viewStudent.name.charAt(0)}</div>
                                <div>
                                    <h4>{viewStudent.name}</h4>
                                    <p>{viewStudent.reg_no}</p>
                                </div>
                            </div>
                            <div className="info-grid">
                                <InfoItem label="Email" value={viewStudent.email} />
                                <InfoItem label="Batch" value={viewStudent.batch} />
                                <InfoItem label="Mobile" value={viewStudent.mobile || 'Not provided'} />
                                <InfoItem label="Parent Mobile" value={viewStudent.parent_mobile || 'Not provided'} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .stat-card-mini {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    padding: 10px 20px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .stat-card-mini .label { font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }
                .stat-card-mini .value { font-size: 20px; font-weight: 800; color: var(--primary-400); }

                .search-bar-container {
                    position: relative;
                    margin-top: 32px;
                }
                .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
                .search-input {
                    width: 100%;
                    padding: 14px 14px 14px 48px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl);
                    color: var(--text-primary);
                    font-size: 15px;
                    box-shadow: 0 4px 20px var(--shadow-color);
                }
                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    color: var(--text-primary);
                    padding-bottom: 8px;
                    border-bottom: 2px solid var(--primary-500)20;
                }
                .student-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 16px;
                }
                .empty-msg { color: var(--text-muted); font-style: italic; font-size: 14px; }

                /* Student Card */
                .student-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .student-card:hover { border-color: var(--primary-500); background: var(--primary-500)05; transform: translateY(-2px); }
                .card-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: var(--radius-md);
                    background: linear-gradient(135deg, var(--primary-500), #7c3aed);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 18px;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                .modal-content {
                    background: var(--bg-card);
                    width: 100%;
                    max-width: 500px;
                    border-radius: var(--radius-2xl);
                    border: 1px solid var(--border-color);
                    padding: 32px;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                }
                .modal-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
                .modal-header h3 { font-size: 20px; font-weight: 800; }
                .profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
                .profile-header .avatar {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: var(--primary-500);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 28px;
                    font-weight: 800;
                }
                .info-grid { display: grid; gap: 16px; }
                .info-item { display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border-color); }
                .info-item .label { color: var(--text-muted); font-size: 13px; }
                .info-item .value { font-weight: 600; font-size: 14px; }
            `}</style>
        </motion.div>
    );
}

function StudentCard({ student, onView }) {
    return (
        <div className="student-card" onClick={onView}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="card-avatar">{student.name.charAt(0)}</div>
                <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{student.name}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{student.reg_no}</p>
                </div>
            </div>
            <Eye size={18} color="var(--primary-400)" />
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="info-item">
            <span className="label">{label}</span>
            <span className="value">{value}</span>
        </div>
    );
}
