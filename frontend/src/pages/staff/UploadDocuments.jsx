import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Trash2, Eye, Check } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function UploadDocuments() {
    const [documents, setDocuments] = useState([
        { id: 1, student: 'Arun Kumar', type: 'Aadhar Card', fileName: 'arun_aadhar.pdf', date: '2026-03-01' },
        { id: 2, student: 'Deepa Lakshmi', type: 'Community Certificate', fileName: 'deepa_community.pdf', date: '2026-02-28' },
        { id: 3, student: 'Karthik Raj', type: 'Passport', fileName: 'karthik_passport.pdf', date: '2026-02-25' },
    ]);
    const [dragOver, setDragOver] = useState(false);
    const [uploaded, setUploaded] = useState(false);

    const handleUpload = () => { setUploaded(true); setTimeout(() => setUploaded(false), 3000); };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Upload Documents</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Upload student documents to cloud storage (R2)</p>
            </motion.div>

            {/* Upload Zone */}
            <motion.div variants={itemVariants}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(); }}
                style={{
                    marginTop: '28px', padding: '48px', borderRadius: 'var(--radius-xl)',
                    border: `2px dashed ${dragOver ? 'var(--primary-500)' : 'var(--border-color)'}`,
                    background: dragOver ? 'rgba(99,102,241,0.05)' : 'var(--bg-secondary)',
                    textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease',
                }}
                onClick={() => document.getElementById('file-input').click()}
            >
                <input id="file-input" type="file" multiple hidden onChange={handleUpload} />
                <motion.div animate={dragOver ? { scale: 1.1 } : { scale: 1 }}
                    style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-xl)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary-500)' }}>
                    <Upload size={28} />
                </motion.div>
                <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {dragOver ? 'Drop files here...' : 'Drag & drop files or click to upload'}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Supports PDF, JPG, PNG (Max 10MB)
                </p>
            </motion.div>

            {/* Document selectors */}
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label className="input-label">Student</label>
                    <select className="input-field"><option>Select student...</option><option>Arun Kumar</option><option>Deepa Lakshmi</option></select>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label className="input-label">Document Type</label>
                    <select className="input-field"><option>Select type...</option><option>Aadhar Card</option><option>Passport</option><option>Community Certificate</option><option>Marksheet</option><option>Transfer Certificate</option></select>
                </div>
            </motion.div>

            {/* Documents List */}
            <motion.div variants={itemVariants} className="card" style={{ marginTop: '24px', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Recent Uploads</h3>
                </div>
                {documents.map((doc, i) => (
                    <motion.div key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < documents.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FileText size={20} style={{ color: 'var(--primary-400)' }} />
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{doc.fileName}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.student} · {doc.type} · {doc.date}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-ghost btn-sm"><Eye size={14} /></button>
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-400)' }}><Trash2 size={14} /></button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {uploaded && <motion.div className="toast toast-success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><Check size={18} /> Document uploaded successfully!</motion.div>}
        </motion.div>
    );
}
