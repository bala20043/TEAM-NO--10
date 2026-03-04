import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function MyMarks() {
    const subjects = [
        { name: 'Data Structures', internal: 42, external: 45, total: 87, grade: 'A' },
        { name: 'Computer Networks', internal: 38, external: 40, total: 78, grade: 'B+' },
        { name: 'Database Systems', internal: 45, external: 48, total: 93, grade: 'A+' },
        { name: 'Operating Systems', internal: 40, external: 42, total: 82, grade: 'A' },
        { name: 'Software Engineering', internal: 35, external: 38, total: 73, grade: 'B' },
        { name: 'Mathematics IV', internal: 44, external: 46, total: 90, grade: 'A+' },
    ];

    const gradeColors = { 'A+': '#10b981', 'A': '#06b6d4', 'B+': '#6366f1', 'B': '#f59e0b', 'C': '#ef4444' };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>My Marks</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>View your internal and external marks</p>
                </div>
                <motion.button className="btn btn-primary" whileHover={{ scale: 1.03 }}>
                    <Download size={16} /> Download Marksheet
                </motion.button>
            </motion.div>

            {/* Summary */}
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginTop: '24px' }}>
                {[
                    { label: 'Average', value: '83.8%', color: '#10b981' },
                    { label: 'Highest', value: '93 (DBMS)', color: '#6366f1' },
                    { label: 'Subjects', value: '6', color: '#f59e0b' },
                    { label: 'CGPA', value: '8.5', color: '#8b5cf6' },
                ].map(s => (
                    <motion.div key={s.label} className="stat-card" variants={itemVariants} whileHover={{ y: -3 }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                        <p style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color, marginTop: '6px' }}>{s.value}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Table */}
            <motion.div variants={itemVariants} className="card" style={{ marginTop: '24px', padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead><tr><th>Subject</th><th>Internal (50)</th><th>External (50)</th><th>Total (100)</th><th>Grade</th></tr></thead>
                        <tbody>
                            {subjects.map((s, i) => (
                                <motion.tr key={s.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                                    <td>{s.internal}</td>
                                    <td>{s.external}</td>
                                    <td><span style={{ fontWeight: 700, color: s.total >= 85 ? 'var(--accent-500)' : s.total >= 70 ? 'var(--warning-500)' : 'var(--danger-500)', fontFamily: 'var(--font-display)', fontSize: '16px' }}>{s.total}</span></td>
                                    <td><span className="badge" style={{ background: `${gradeColors[s.grade]}15`, color: gradeColors[s.grade], fontWeight: 700, fontSize: '13px' }}>{s.grade}</span></td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Bar visual */}
            <motion.div variants={itemVariants} className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Subject-wise Performance</h3>
                {subjects.map((s, i) => (
                    <motion.div key={s.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }}
                        style={{ marginBottom: i < subjects.length - 1 ? '14px' : 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: s.total >= 85 ? 'var(--accent-500)' : 'var(--text-secondary)' }}>{s.total}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${s.total}%` }}
                                transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                                style={{ height: '100%', borderRadius: '4px', background: `linear-gradient(90deg, ${gradeColors[s.grade]}, ${gradeColors[s.grade]}cc)` }}
                            />
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}
