import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Trash2, Eye, Check, Loader2, AlertCircle, Search, Download } from 'lucide-react';
import { documentAPI, studentAPI } from '../../services/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function UploadDocuments() {
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [documents, setDocuments] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [docType, setDocType] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedStudentId) {
            fetchStudentDocs(selectedStudentId);
        } else {
            setDocuments([]);
        }
    }, [selectedStudentId]);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const res = await studentAPI.getAll(); // Staff will get their class by default on backend
            if (res.students) {
                setStudents(res.students);
            }
        } catch (err) {
            setError('Failed to load student list.');
        } finally {
            setLoadingStudents(false);
        }
    };

    const fetchStudentDocs = async (studentId) => {
        try {
            const res = await documentAPI.getByStudent(studentId);
            if (res.documents) setDocuments(res.documents);
        } catch (err) {
            console.error('Failed to fetch documents:', err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be under 10MB');
                return;
            }
            setSelectedFile(file);
            setError('');
        }
    };

    const handleUpload = async (e) => {
        if (e) e.preventDefault();
        if (!selectedStudentId || !selectedFile || !docType) {
            setError('Please select a student, document type, and file.');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('student_id', selectedStudentId);
        formData.append('doc_type', docType);

        try {
            const res = await documentAPI.upload(formData);
            if (res.message) {
                setSuccess('Document uploaded successfully!');
                setSelectedFile(null);
                setDocType('');
                if (fileInputRef.current) fileInputRef.current.value = '';
                fetchStudentDocs(selectedStudentId);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.message || 'Failed to upload document.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            const res = await documentAPI.delete(id);
            if (res.message) {
                setDocuments(prev => prev.filter(d => d.id !== id));
            }
        } catch (err) {
            setError('Failed to delete document.');
        }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Upload Documents</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Select a student and upload documents to cloud storage</p>
            </motion.div>

            {/* Upload Form - Selectors */}
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '16px', marginTop: '28px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Student {loadingStudents && <Loader2 className="animate-spin" size={12} />}
                    </label>
                    <select
                        className="input-field"
                        value={selectedStudentId}
                        onChange={e => setSelectedStudentId(e.target.value)}
                        disabled={loadingStudents}
                    >
                        <option value="">Select student...</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.reg_no})</option>
                        ))}
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: '240px' }}>
                    <label className="input-label">Document Type</label>
                    <select className="input-field" value={docType} onChange={e => setDocType(e.target.value)}>
                        <option value="">Select type...</option>
                        <option value="Aadhar Card">Aadhar Card</option>
                        <option value="Community Certificate">Community Certificate</option>
                        <option value="Passport">Passport</option>
                        <option value="Marksheet">Marksheet</option>
                        <option value="Transfer Certificate">Transfer Certificate</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </motion.div>

            {/* Drag & Drop Zone */}
            <motion.div variants={itemVariants}
                style={{
                    marginTop: '20px', padding: '40px', borderRadius: 'var(--radius-xl)',
                    border: '2px dashed var(--border-color)',
                    background: 'var(--bg-secondary)',
                    textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onClick={() => fileInputRef.current.click()}
            >
                <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                <div style={{ color: 'var(--primary-500)', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                    {uploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                </div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {selectedFile ? selectedFile.name : 'Click here to select a file'}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    PDF, JPG, PNG (Max 10MB)
                </p>

                {selectedFile && !uploading && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '16px' }}
                        onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                        disabled={!selectedStudentId || !docType}
                    >
                        Complete Upload
                    </motion.button>
                )}
            </motion.div>

            {error && (
                <div style={{ marginTop: '12px', color: 'var(--danger-500)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            {/* Documents List */}
            <motion.div variants={itemVariants} className="card" style={{ marginTop: '24px', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                        {selectedStudentId ? 'Student Documents' : 'Recent Documents'}
                    </h3>
                    {selectedStudentId && <span className="badge badge-primary">{documents.length} Files</span>}
                </div>

                {selectedStudentId && documents.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p>No documents found for this student.</p>
                    </div>
                ) : !selectedStudentId ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p>Select a student to view and manage their documents.</p>
                    </div>
                ) : (
                    documents.map((doc, i) => (
                        <motion.div key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < documents.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FileText size={20} style={{ color: 'var(--primary-400)' }} />
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{doc.file_name}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.doc_type} · {new Date(doc.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <a href={documentAPI.download(doc.id)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon btn-sm"><Download size={14} /></a>
                                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => handleDelete(doc.id)}><Trash2 size={14} /></button>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {success && (
                <motion.div className="toast toast-success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Check size={18} /> {success}
                </motion.div>
            )}
        </motion.div>
    );
}
