import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Sun, Moon, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Demo accounts for testing
  const demoAccounts = [
    { role: 'admin', email: 'admin@college.edu', password: 'admin123', icon: '🛠', color: '#6366f1' },
    { role: 'principal', email: 'principal@college.edu', password: 'password123', icon: '👨‍💼', color: '#8b5cf6' },
    { role: 'hod', email: 'hod@college.edu', password: 'password123', icon: '🧑‍💼', color: '#06b6d4' },
    { role: 'staff', email: 'staff@college.edu', password: 'password123', icon: '👩‍🏫', color: '#10b981' },
    { role: 'student', email: 'student@college.edu', password: 'password123', icon: '👨‍🎓', color: '#f59e0b' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      // Wait for the AuthContext onAuthStateChange to fetch the profile and update the user state.
      // We will handle navigation in a useEffect based on the `user` state.
      if (!result.success) {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  // Listen for user role changes to navigate
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (['principal', 'hod', 'staff'].includes(user.role)) navigate('/staff');
      else navigate('/student');
    }
  }, [user, navigate]);

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setSelectedRole(account.role);
    setError('');
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-orb orb-1"></div>
        <div className="login-bg-orb orb-2"></div>
        <div className="login-bg-orb orb-3"></div>
        <div className="login-bg-grid"></div>
      </div>

      {/* Theme toggle */}
      <motion.button
        className="login-theme-toggle"
        onClick={toggleTheme}
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </motion.button>

      <div className="login-container">
        {/* Left - Branding */}
        <motion.div
          className="login-brand-section"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="login-logo"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="login-logo-inner">
              <GraduationCap size={48} color="white" />
            </div>
          </motion.div>

          <h1 className="login-brand-title">
            Smart<span>CMS</span>
          </h1>
          <p className="login-brand-subtitle">
            Cloud-Based College Management System
          </p>

          <div className="login-features">
            {['Attendance Tracking', 'Marks Management', 'Smart Announcements', 'Secure & Scalable'].map((feat, i) => (
              <motion.div
                key={feat}
                className="login-feature-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Sparkles size={14} />
                <span>{feat}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right - Login Form */}
        <motion.div
          className="login-form-section"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="login-form-card">
            <div className="login-form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your account to continue</p>
            </div>

            {/* Demo Role Selector */}
            <div className="demo-roles">
              <p className="demo-roles-label">Quick Demo Login:</p>
              <div className="demo-roles-grid">
                {demoAccounts.map((acc, i) => (
                  <motion.button
                    key={acc.role}
                    className={`demo-role-btn ${selectedRole === acc.role ? 'active' : ''}`}
                    onClick={() => fillDemo(acc)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    style={{ '--role-color': acc.color }}
                  >
                    <span className="demo-role-icon">{acc.icon}</span>
                    <span className="demo-role-name">{acc.role}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    className="input-field input-with-icon"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field input-with-icon"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    className="login-error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="login-links" style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                <Link to="/register" style={{ fontSize: '14px', color: 'var(--primary-500)', fontWeight: 600, textDecoration: 'none' }}>
                  New Student? Register here
                </Link>
              </div>

              <motion.button
                type="submit"
                className="btn btn-primary btn-lg login-submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="login-spinner"></div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        .login-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
        }

        .login-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
        }

        .orb-1 {
          width: 500px; height: 500px;
          background: var(--primary-600);
          top: -10%; left: -10%;
          animation: float 8s ease-in-out infinite;
        }

        .orb-2 {
          width: 400px; height: 400px;
          background: #7c3aed;
          bottom: -10%; right: -5%;
          animation: float 10s ease-in-out infinite reverse;
        }

        .orb-3 {
          width: 300px; height: 300px;
          background: #06b6d4;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: float 12s ease-in-out infinite;
        }

        .login-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .login-theme-toggle {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 20;
          width: 44px; height: 44px;
          border-radius: var(--radius-md);
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-container {
          display: flex;
          align-items: center;
          gap: 60px;
          max-width: 1000px;
          width: 100%;
          position: relative;
          z-index: 10;
        }

        .login-brand-section {
          flex: 1;
          max-width: 420px;
        }

        .login-logo {
          margin-bottom: 24px;
        }

        .login-logo-inner {
          width: 80px; height: 80px;
          border-radius: var(--radius-xl);
          background: linear-gradient(135deg, var(--primary-600), #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 40px rgba(99, 102, 241, 0.4);
        }

        .login-brand-title {
          font-family: var(--font-display);
          font-size: 48px;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .login-brand-title span {
          background: linear-gradient(135deg, var(--primary-400), #7c3aed, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-brand-subtitle {
          color: var(--text-muted);
          font-size: 16px;
          margin-top: 8px;
          margin-bottom: 32px;
        }

        .login-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .login-feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
        }

        .login-feature-item svg {
          color: var(--primary-400);
        }

        .login-form-section {
          flex: 1;
          max-width: 440px;
        }

        .login-form-card {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: 36px;
          box-shadow: 0 20px 60px var(--shadow-color);
        }

        .login-form-header h2 {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .login-form-header p {
          color: var(--text-muted);
          font-size: 14px;
          margin-top: 4px;
          margin-bottom: 24px;
        }

        .demo-roles {
          margin-bottom: 24px;
        }

        .demo-roles-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .demo-roles-grid {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .demo-role-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--radius-md);
          background: var(--bg-tertiary);
          border: 1.5px solid var(--border-color);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: capitalize;
          transition: all var(--transition-fast);
        }

        .demo-role-btn:hover {
          border-color: var(--role-color);
          color: var(--text-primary);
        }

        .demo-role-btn.active {
          border-color: var(--role-color);
          background: color-mix(in srgb, var(--role-color) 10%, transparent);
          color: var(--text-primary);
          box-shadow: 0 0 12px color-mix(in srgb, var(--role-color) 25%, transparent);
        }

        .demo-role-icon {
          font-size: 16px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-with-icon {
          padding-left: 42px !important;
        }

        .input-toggle-password {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          color: var(--text-muted);
          padding: 4px;
          transition: color var(--transition-fast);
        }

        .input-toggle-password:hover {
          color: var(--text-primary);
        }

        .login-error {
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--danger-400);
          font-size: 13px;
          font-weight: 500;
        }

        .login-submit {
          width: 100%;
          margin-top: 4px;
          padding: 14px;
          font-size: 15px;
        }

        .login-spinner {
          width: 22px; height: 22px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin-slow 0.8s linear infinite;
        }

        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
            gap: 32px;
          }
          .login-brand-section {
            text-align: center;
            max-width: 100%;
          }
          .login-logo {
            display: flex;
            justify-content: center;
          }
          .login-features { display: none; }
          .login-brand-title { font-size: 36px; }
          .login-form-section { max-width: 100%; }
          .login-form-card { padding: 24px; }
        }

        @media (max-width: 480px) {
          .login-brand-title { font-size: 28px; }
          .login-form-card { padding: 20px; }
          .demo-roles-grid { gap: 6px; }
          .demo-role-btn { padding: 6px 10px; font-size: 11px; }
        }
      `}</style>
    </div>
  );
}
