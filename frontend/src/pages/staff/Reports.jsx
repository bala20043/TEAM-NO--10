import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, FileSpreadsheet, FileText, Loader2, AlertCircle } from 'lucide-react';
// import { reportAPI } from '../../services/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Reports() {
    const [generating, setGenerating] = useState(null); // title of report being generated
    const [error, setError] = useState('');

    const handleGenerate = async (report) => {
        setGenerating(report.title);
        setError('');
        try {
            // Briefly pause to simulate generation
            await new Promise(resolve => setTimeout(resolve, 800));
            throw new Error('Report generation is temporarily unavailable while we optimize our new Supabase Postgres database. Please check back later.');
        } catch (err) {
            console.error('Report generation failed:', err);
            setError(err.message || `Failed to generate ${report.title}. Please try again.`);
        } finally {
            setGenerating(null);
        }
    };

    const reportTypes = [
        { title: 'Attendance Report', desc: 'Generate department-wise or student-wise attendance reports', icon: FileSpreadsheet, color: '#10b981', format: 'Excel (CSV)' },
        { title: 'Marks Report', desc: 'Export marks for internal, external, or semester exams', icon: FileText, color: '#6366f1', format: 'Excel (CSV)' },
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Reports</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Generate and download reports</p>
            </motion.div>

            {error && (
                <motion.div variants={itemVariants} className="badge badge-warning" style={{ marginTop: '20px', padding: '12px', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> {error}
                </motion.div>
            )}

            <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '28px' }}>
                {reportTypes.map((r, i) => {
                    const Icon = r.icon;
                    const isGenerating = generating === r.title;
                    return (
                        <motion.div key={r.title} className="card" variants={itemVariants}
                            whileHover={r.disabled ? {} : { y: -4, boxShadow: '0 20px 40px var(--shadow-color)' }}
                            style={{ cursor: r.disabled ? 'default' : 'pointer', opacity: r.disabled ? 0.6 : 1 }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-lg)', background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color, marginBottom: '16px' }}>
                                <Icon size={26} />
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{r.title}</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>{r.desc}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="badge badge-primary" style={{ fontSize: '10px' }}>{r.format}</span>
                                {!r.disabled && (
                                    <motion.button
                                        className="btn btn-ghost btn-sm"
                                        whileHover={{ scale: 1.1 }}
                                        style={{ color: r.color, display: 'flex', alignItems: 'center', gap: '6px' }}
                                        onClick={() => handleGenerate(r)}
                                        disabled={generating !== null}
                                    >
                                        {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                                        {isGenerating ? 'Generating...' : 'Generate'}
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
