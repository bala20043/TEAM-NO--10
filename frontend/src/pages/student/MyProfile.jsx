import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, Calendar, Hash, GraduationCap } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function MyProfile() {
    const profile = {
        name: 'Arun Kumar',
        reg_no: 'CSE2024001',
        department: 'Computer Science & Engineering',
        year: 3,
        batch: '2022-2026',
        email: 'arun@college.edu',
        mobile: '9876543210',
        parentMobile: '9876543200',
        status: 'active',
    };

    const fields = [
        { label: 'Full Name', value: profile.name, icon: User },
        { label: 'Register Number', value: profile.reg_no, icon: Hash },
        { label: 'Department', value: profile.department, icon: Building2 },
        { label: 'Year', value: `${profile.year}rd Year`, icon: GraduationCap },
        { label: 'Batch', value: profile.batch, icon: Calendar },
        { label: 'Email', value: profile.email, icon: Mail },
        { label: 'Mobile', value: profile.mobile, icon: Phone },
        { label: 'Parent Mobile', value: profile.parentMobile, icon: Phone },
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>My Profile</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Your student profile information</p>
            </motion.div>

            <motion.div variants={itemVariants} className="card" style={{ maxWidth: '600px', marginTop: '28px' }}>
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--primary-500), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-display)', boxShadow: '0 8px 25px rgba(99,102,241,0.3)' }}>
                        {profile.name.charAt(0)}
                    </motion.div>
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{profile.name}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{profile.department}</p>
                        <span className="badge badge-success" style={{ marginTop: '6px' }}>Active Student</span>
                    </div>
                </div>

                {/* Fields */}
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
