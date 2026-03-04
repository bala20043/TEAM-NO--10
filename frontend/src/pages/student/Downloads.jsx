import { motion } from 'framer-motion';
import { Download, FileText, Award, File } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Downloads() {
    const documents = [
        { id: 1, name: 'Semester 5 Marksheet', type: 'Marksheet', format: 'PDF', size: '1.2 MB', date: '2026-02-20', icon: FileText, color: '#6366f1' },
        { id: 2, name: 'Semester 4 Marksheet', type: 'Marksheet', format: 'PDF', size: '1.1 MB', date: '2025-08-15', icon: FileText, color: '#6366f1' },
        { id: 3, name: 'Transfer Certificate', type: 'Certificate', format: 'PDF', size: '0.8 MB', date: '2024-06-10', icon: Award, color: '#10b981' },
        { id: 4, name: 'Bonafide Certificate', type: 'Certificate', format: 'PDF', size: '0.5 MB', date: '2025-01-05', icon: Award, color: '#10b981' },
        { id: 5, name: 'Aadhar Card Copy', type: 'Document', format: 'PDF', size: '2.1 MB', date: '2024-07-20', icon: File, color: '#f59e0b' },
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Downloads</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Download your certificates, marksheets, and documents</p>
            </motion.div>

            <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '28px' }}>
                {documents.map((doc, i) => {
                    const Icon = doc.icon;
                    return (
                        <motion.div key={doc.id} className="card" variants={itemVariants}
                            whileHover={{ y: -4, boxShadow: '0 20px 40px var(--shadow-color)' }}
                            style={{ cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: `${doc.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: doc.color, flexShrink: 0 }}>
                                    <Icon size={24} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{doc.name}</h3>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <span className="badge badge-primary">{doc.type}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.format} · {doc.size}</span>
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Uploaded: {doc.date}</p>
                                </div>
                            </div>
                            <motion.button
                                className="btn btn-primary btn-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ width: '100%', marginTop: '16px' }}
                            >
                                <Download size={14} /> Download
                            </motion.button>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
