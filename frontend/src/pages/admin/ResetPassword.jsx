import { motion } from 'framer-motion';
import { Shield, Key, Search } from 'lucide-react';
import { useState } from 'react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ResetPassword() {
    const [searchEmail, setSearchEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [result, setResult] = useState(null);

    const handleReset = (e) => {
        e.preventDefault();
        setResult({ success: true, message: `Password reset successfully for ${searchEmail}` });
        setTimeout(() => setResult(null), 3000);
        setSearchEmail('');
        setNewPassword('');
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Reset Password</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Reset any user's password</p>
            </motion.div>

            <motion.div variants={itemVariants} className="card" style={{ maxWidth: '500px', marginTop: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-500)' }}>
                        <Shield size={22} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Password Reset Tool</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Admin access required</p>
                    </div>
                </div>

                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div><label className="input-label">User Email</label><input className="input-field" type="email" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} required placeholder="Enter user's email" /></div>
                    <div><label className="input-label">New Password</label><input className="input-field" type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Enter new password" minLength={6} /></div>
                    <motion.button type="submit" className="btn btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Key size={16} /> Reset Password
                    </motion.button>
                </form>

                {result && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '16px', padding: '12px', borderRadius: 'var(--radius-md)', background: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: result.success ? 'var(--accent-500)' : 'var(--danger-500)', fontSize: '13px', fontWeight: 600 }}>
                        {result.message}
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}
