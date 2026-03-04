import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, GraduationCap, Building2, Bell, FileText,
    ClipboardList, BarChart3, Upload, Settings, LogOut, ChevronLeft,
    ChevronRight, UserPlus, Database, Shield, BookOpen, Calendar,
    Download, User, Menu, X
} from 'lucide-react';

const roleMenus = {
    admin: [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/admin/staff', icon: Users, label: 'Manage Staff' },
        { path: '/admin/students', icon: GraduationCap, label: 'Manage Students' },
        { path: '/admin/departments', icon: Building2, label: 'Departments' },
        { path: '/admin/announcements', icon: Bell, label: 'Alerts & Notices' },
        { path: '/admin/reset-password', icon: Shield, label: 'Reset Password' },
        { path: '/admin/backup', icon: Database, label: 'Database Backup' },
    ],
    principal: [
        { path: '/staff', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/staff/attendance', icon: ClipboardList, label: 'Attendance' },
        { path: '/staff/marks', icon: FileText, label: 'Marks' },
        { path: '/staff/students', icon: GraduationCap, label: 'Students' },
        { path: '/staff/announcements', icon: Bell, label: 'Announcements' },
        { path: '/staff/reports', icon: BarChart3, label: 'Reports' },
        { path: '/staff/documents', icon: Upload, label: 'Documents' },
    ],
    hod: [
        { path: '/staff', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/staff/attendance', icon: ClipboardList, label: 'Attendance' },
        { path: '/staff/marks', icon: FileText, label: 'Marks' },
        { path: '/staff/students', icon: GraduationCap, label: 'Students' },
        { path: '/staff/announcements', icon: Bell, label: 'Announcements' },
        { path: '/staff/reports', icon: BarChart3, label: 'Reports' },
        { path: '/staff/documents', icon: Upload, label: 'Documents' },
    ],
    staff: [
        { path: '/staff', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/staff/attendance', icon: ClipboardList, label: 'Attendance' },
        { path: '/staff/marks', icon: FileText, label: 'Marks' },
        { path: '/staff/students', icon: GraduationCap, label: 'Students' },
        { path: '/staff/announcements', icon: Bell, label: 'Announcements' },
        { path: '/staff/reports', icon: BarChart3, label: 'Reports' },
        { path: '/staff/documents', icon: Upload, label: 'Documents' },
    ],
    student: [
        { path: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/student/attendance', icon: ClipboardList, label: 'My Attendance' },
        { path: '/student/marks', icon: FileText, label: 'My Marks' },
        { path: '/student/announcements', icon: Bell, label: 'Notices' },
        { path: '/student/profile', icon: User, label: 'My Profile' },
        { path: '/student/downloads', icon: Download, label: 'Downloads' },
    ],
};

export default function Sidebar() {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const role = user?.role || 'student';
    const menuItems = roleMenus[role] || roleMenus.student;

    const sidebarContent = (
        <>
            {/* Logo / Brand */}
            <div className="sidebar-brand">
                <motion.div
                    className="sidebar-logo"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                >
                    <GraduationCap size={collapsed ? 28 : 32} color="white" />
                </motion.div>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="sidebar-brand-text"
                    >
                        <h2>SmartCMS</h2>
                        <span>{role.charAt(0).toUpperCase() + role.slice(1)} Panel</span>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = item.end
                        ? location.pathname === item.path
                        : location.pathname.startsWith(item.path);

                    return (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <NavLink
                                to={item.path}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <motion.div
                                    className="sidebar-link-icon"
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Icon size={20} />
                                </motion.div>
                                {!collapsed && <span className="sidebar-link-text">{item.label}</span>}
                                {isActive && (
                                    <motion.div
                                        className="sidebar-active-indicator"
                                        layoutId="activeIndicator"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </NavLink>
                        </motion.div>
                    );
                })}
            </nav>

            {/* User Info + Logout */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    {!collapsed && (
                        <div className="sidebar-user-info">
                            <p className="sidebar-user-name">{user?.name || 'User'}</p>
                            <p className="sidebar-user-role">{role}</p>
                        </div>
                    )}
                </div>
                <motion.button
                    className="sidebar-logout"
                    onClick={logout}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Logout"
                >
                    <LogOut size={18} />
                    {!collapsed && <span>Logout</span>}
                </motion.button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Toggle */}
            <button
                className="mobile-menu-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="sidebar-mobile-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.aside
                className={`sidebar desktop-sidebar ${collapsed ? 'collapsed' : ''}`}
                animate={{ width: collapsed ? 80 : 280 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                {sidebarContent}
                <button
                    className="sidebar-collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </motion.aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.aside
                        className="sidebar mobile-sidebar"
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>

            <style>{`
        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 60;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px var(--shadow-color);
        }

        .sidebar-mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 45;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          background: var(--bg-sidebar);
          display: flex;
          flex-direction: column;
          z-index: 50;
          overflow: hidden;
          border-right: 1px solid rgba(255,255,255,0.06);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .sidebar-logo {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--primary-600), #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }

        .sidebar-brand-text h2 {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #c7d2fe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
        }

        .sidebar-brand-text span {
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 11px 14px;
          border-radius: var(--radius-md);
          color: rgba(255,255,255,0.55);
          font-size: 14px;
          font-weight: 500;
          position: relative;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .sidebar-link:hover {
          color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.06);
        }

        .sidebar-link.active {
          color: white;
          background: rgba(99, 102, 241, 0.15);
        }

        .sidebar-link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-link-text {
          overflow: hidden;
        }

        .sidebar-active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: linear-gradient(180deg, var(--primary-400), #7c3aed);
          border-radius: 0 var(--radius-full) var(--radius-full) 0;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .sidebar-avatar {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--primary-500), #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 15px;
          flex-shrink: 0;
        }

        .sidebar-user-name {
          color: rgba(255,255,255,0.9);
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        .sidebar-user-role {
          color: rgba(255,255,255,0.4);
          font-size: 11px;
          text-transform: capitalize;
        }

        .sidebar-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          font-size: 13px;
          font-weight: 600;
          transition: all var(--transition-fast);
        }

        .sidebar-logout:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .sidebar-collapse-btn {
          position: absolute;
          top: 28px;
          right: -12px;
          width: 24px;
          height: 24px;
          border-radius: var(--radius-full);
          background: var(--primary-600);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all var(--transition-fast);
          z-index: 10;
        }

        .sidebar-collapse-btn:hover {
          background: var(--primary-500);
          transform: scale(1.1);
        }

        .mobile-sidebar {
          width: 280px !important;
        }

        @media (max-width: 768px) {
          .desktop-sidebar { display: none; }
          .mobile-menu-toggle { display: flex; }
          .sidebar-mobile-overlay { display: block; }
          .sidebar-collapse-btn { display: none; }
        }
      `}</style>
        </>
    );
}
