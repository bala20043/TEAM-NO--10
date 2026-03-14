import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building2, GraduationCap, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function StaffProfile() {
    const { user } = useAuth();
    
    if (!user) return null;

    const displayName = user.name || 'Staff Member';
    const displayEmail = user.email || '';
    const displayDept = user.department_name || user.department?.name || 'Not Assigned';
    const displayYear = user.year ? `Year ${user.year}` : 'Not a Class Teacher';
    const displayRole = user.role?.toUpperCase() || 'STAFF';

    const fields = [
        { label: 'Full Name', value: displayName, icon: User },
        { label: 'System Role', value: displayRole, icon: Shield },
        { label: 'Department', value: displayDept, icon: Building2 },
        { label: 'Assigned Class', value: displayYear, icon: GraduationCap },
        { label: 'Email Address', value: displayEmail, icon: Mail },
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>My Profile</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Your staff profile information</p>
            </motion.div>

            <motion.div variants={itemVariants} className="card" style={{ maxWidth: '600px', marginTop: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--primary-500), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-display)', boxShadow: '0 8px 25px rgba(99,102,241,0.3)' }}>
                        {displayName.charAt(0).toUpperCase()}
                    </motion.div>
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{displayName}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{displayDept}</p>
                        <span className={`badge ${user.role === 'hod' || user.role === 'principal' ? 'badge-primary' : 'badge-success'}`} style={{ marginTop: '6px' }}>
                            {displayRole}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {fields.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <motion.div key={f.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
                                style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: i < fields.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '180px', flexShrink: 0 }}>
                                    <Icon size={16} style={{ color: 'var(--primary-400)' }} />
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{f.label}</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{f.value}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
}
