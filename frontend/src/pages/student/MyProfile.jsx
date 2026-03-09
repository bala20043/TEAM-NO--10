import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, Calendar, Hash, GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function MyProfile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await studentAPI.getProfile();
            if (res.profile) {
                setProfile(res.profile);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const getYearLabel = (y) => {
        if (y === 1) return '1st Year';
        if (y === 2) return '2nd Year';
        if (y === 3) return '3rd Year';
        if (y === 4) return '4th Year';
        return `Year ${y}`;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary-500)" />
            </div>
        );
    }

    const displayProfile = profile || {};
    const displayName = displayProfile.name || user?.name || 'Student';
    const displayEmail = displayProfile.email || user?.email || '';
    const displayDept = displayProfile.department_name || 'Not Assigned';
    const displayYear = displayProfile.year ? getYearLabel(displayProfile.year) : 'Not Assigned';
    const displayRegNo = displayProfile.reg_no || 'Not Assigned';
    const displayMobile = displayProfile.mobile || 'Not Available';
    const displayParentMobile = displayProfile.parent_mobile || 'Not Available';
    const displayBatch = displayProfile.batch || 'Not Assigned';

    const fields = [
        { label: 'Full Name', value: displayName, icon: User },
        { label: 'Register Number', value: displayRegNo, icon: Hash },
        { label: 'Department', value: displayDept, icon: Building2 },
        { label: 'Year', value: displayYear, icon: GraduationCap },
        { label: 'Batch', value: displayBatch, icon: Calendar },
        { label: 'Email', value: displayEmail, icon: Mail },
        { label: 'Mobile', value: displayMobile, icon: Phone },
        { label: 'Parent Mobile', value: displayParentMobile, icon: Phone },
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
                        {displayName.charAt(0)}
                    </motion.div>
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{displayName}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{displayDept}</p>
                        <span className={`badge ${profile?.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '6px' }}>
                            {profile?.status === 'active' ? 'Active Student' : profile?.status || 'Pending'}
                        </span>
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
