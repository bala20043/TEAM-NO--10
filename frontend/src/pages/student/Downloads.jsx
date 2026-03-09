import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Award, File, Loader2, AlertCircle } from 'lucide-react';
import { documentAPI } from '../../services/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const getDocIcon = (type) => {
    switch (type) {
        case 'Marksheet': return { icon: FileText, color: '#6366f1' };
        case 'Community Certificate':
        case 'Transfer Certificate': return { icon: Award, color: '#10b981' };
        default: return { icon: File, color: '#f59e0b' };
    }
};

export default function Downloads() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const res = await documentAPI.getMyDocuments();
            if (res.documents) {
                setDocuments(res.documents);
            }
        } catch (err) {
            setError('Failed to load your documents. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
                <Loader2 className="animate-spin" size={48} style={{ marginBottom: '16px', color: 'var(--primary-500)' }} />
                <p>Loading your documents...</p>
            </div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Downloads</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Download your certificates, marksheets, and documents uploaded by staff</p>
            </motion.div>

            {error && (
                <motion.div variants={itemVariants} className="badge badge-warning" style={{ marginTop: '20px', padding: '12px', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> {error}
                </motion.div>
            )}

            {documents.length === 0 && !error ? (
                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '80px', color: 'var(--text-muted)' }}>
                    <File size={64} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 600 }}>No Documents Found</h3>
                    <p>When staff members upload your certificates or marksheets, they will appear here.</p>
                </motion.div>
            ) : (
                <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '28px' }}>
                    {documents.map((doc, i) => {
                        const { icon: Icon, color } = getDocIcon(doc.doc_type);
                        return (
                            <motion.div key={doc.id} className="card" variants={itemVariants}
                                whileHover={{ y: -4, boxShadow: '0 20px 40px var(--shadow-color)' }}
                                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0 }}>
                                        <Icon size={24} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {doc.file_name}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <span className="badge badge-primary" style={{ fontSize: '11px' }}>{doc.doc_type}</span>
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                            Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <motion.a
                                    href={documentAPI.download(doc.id)}
                                    className="btn btn-primary btn-sm"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                                    download
                                >
                                    <Download size={14} /> Download
                                </motion.a>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
}
