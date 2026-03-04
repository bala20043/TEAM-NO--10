import { motion } from 'framer-motion';
import { Database, Download, Clock, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function BackupPage() {
    const [backups] = useState([
        { id: 1, date: '2026-03-03 10:00 AM', size: '24.5 MB', status: 'completed' },
        { id: 2, date: '2026-03-02 10:00 AM', size: '24.3 MB', status: 'completed' },
        { id: 3, date: '2026-03-01 10:00 AM', size: '24.1 MB', status: 'completed' },
    ]);
    const [backing, setBacking] = useState(false);

    const triggerBackup = () => {
        setBacking(true);
        setTimeout(() => setBacking(false), 3000);
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Database Backup</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage and trigger database backups</p>
            </motion.div>

            <motion.div variants={itemVariants} className="card" style={{ marginTop: '28px', maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-xl)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary-500)' }}>
                    <Database size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Cloud D1 Database</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Create a manual backup snapshot of the D1 database</p>
                <motion.button className={`btn ${backing ? 'btn-secondary' : 'btn-primary'} btn-lg`} onClick={triggerBackup} disabled={backing} whileHover={!backing ? { scale: 1.03 } : {}} style={{ width: '100%' }}>
                    {backing ? <><div className="login-spinner" style={{ width: '18px', height: '18px', borderColor: 'var(--text-muted)', borderTopColor: 'var(--text-primary)' }} /> Backing up...</> : <><Database size={18} /> Create Backup Now</>}
                </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="card" style={{ marginTop: '20px', maxWidth: '500px', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Recent Backups</h3>
                </div>
                {backups.map((b, i) => (
                    <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < backups.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle size={16} style={{ color: 'var(--accent-500)' }} />
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{b.date}</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.size}</p>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-sm"><Download size={14} /></button>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}
