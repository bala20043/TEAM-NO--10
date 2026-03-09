import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, GraduationCap, Building2, Calendar, Hash, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authAPI, departmentAPI } from '../../services/api';

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

export default function RegisterPage() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        reg_no: '',
        department_id: '',
        year: '1',
        batch: ''
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await departmentAPI.getAll();
            if (res.departments) {
                setDepartments(res.departments);
            }
        } catch (err) {
            console.error('Failed to fetch departments');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await authAPI.register({
                ...formData,
                department_id: parseInt(formData.department_id),
                year: parseInt(formData.year)
            });
            if (res.success) {
                setSuccess(true);
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', padding: '40px' }}
                >
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                        Registration Successful!
                    </h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
                        Your account has been created and is currently **pending approval** by the administrator.
                        You will be able to log in once your request is approved.
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                        Go to Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <motion.div
                className="auth-card"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ width: '100%', maxWidth: '500px' }}
            >
                <div className="auth-header">
                    <div className="auth-logo">
                        <UserPlus size={28} />
                    </div>
                    <h1 className="auth-title">Student Registration</h1>
                    <p className="auth-subtitle">Fill in your details to request access</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="alert alert-danger"
                        style={{ marginBottom: '24px' }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <motion.div variants={itemVariants} className="form-group">
                            <label>Full Name</label>
                            <div className="input-group">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="form-group">
                            <label>Email Address</label>
                            <div className="input-group">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </motion.div>
                    </div>

                    <motion.div variants={itemVariants} className="form-group">
                        <label>Password</label>
                        <div className="input-group">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </motion.div>

                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <motion.div variants={itemVariants} className="form-group">
                            <label>Registration No</label>
                            <div className="input-group">
                                <Hash className="input-icon" size={18} />
                                <input
                                    type="text"
                                    name="reg_no"
                                    placeholder="REG12345"
                                    value={formData.reg_no}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="form-group">
                            <label>Department</label>
                            <div className="input-group">
                                <Building2 className="input-icon" size={18} />
                                <select
                                    name="department_id"
                                    value={formData.department_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Dept</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        </motion.div>
                    </div>

                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <motion.div variants={itemVariants} className="form-group">
                            <label>Academic Year</label>
                            <div className="input-group">
                                <GraduationCap className="input-icon" size={18} />
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    required
                                >
                                    {[1, 2, 3, 4].map(y => (
                                        <option key={y} value={y}>Year {y}</option>
                                    ))}
                                </select>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="form-group">
                            <label>Batch / Section</label>
                            <div className="input-group">
                                <Calendar className="input-icon" size={18} />
                                <input
                                    type="text"
                                    name="batch"
                                    placeholder="2022-2026"
                                    value={formData.batch}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </motion.div>
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '8px' }}
                        disabled={loading}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? 'Processing...' : (
                            <>
                                Submit Registration <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </motion.div>

            <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          padding: 24px;
        }
        .auth-card {
          background: var(--bg-card);
          padding: 40px;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-color);
          box-shadow: 0 20px 50px var(--shadow-color);
        }
        .auth-header { text-align: center; margin-bottom: 32px; }
        .auth-logo {
          width: 56px; height: 56px; background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
          border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; color: white; box-shadow: 0 8px 16px rgba(99, 102, 241, 0.25);
        }
        .auth-title { font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; font-family: var(--font-display); }
        .auth-subtitle { color: var(--text-muted); font-size: 14px; }
        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
        .input-group { position: relative; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .input-group input, .input-group select {
          width: 100%; padding: 12px 14px 12px 42px; background: var(--bg-tertiary); border: 1px solid var(--border-color);
          border-radius: var(--radius-md); color: var(--text-primary); font-size: 14px; transition: all 0.2s;
        }
        .input-group input:focus, .input-group select:focus { border-color: var(--primary-500); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); outline: none; }
        .auth-footer { margin-top: 32px; text-align: center; font-size: 14px; color: var(--text-muted); }
        .auth-footer a { color: var(--primary-500); font-weight: 600; text-decoration: none; }
        .auth-footer a:hover { text-decoration: underline; }

        @media (max-width: 480px) {
          .auth-card { padding: 24px; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    );
}
