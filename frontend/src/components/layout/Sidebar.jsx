import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, Building2, Bell, FileText,
  ClipboardList, BarChart3, Upload, Settings, LogOut, ChevronLeft,
  ChevronRight, UserPlus, Database, Shield, BookOpen, Calendar,
  Download, User, Menu, X, MessageSquare, Megaphone
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
    { path: '/staff/chat', icon: MessageSquare, label: 'Messages' },
  ],
  principal: [
    { path: '/staff', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/staff/students', icon: GraduationCap, label: 'Students' },
    { path: '/staff/announcements', icon: Bell, label: 'Broadcast' },
    { path: '/staff/chat', icon: MessageSquare, label: 'Messages' },
  ],
  hod: [
    { path: '/staff', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/staff/college-announcements', icon: Megaphone, label: 'College Notices' },
    { path: '/staff/attendance', icon: ClipboardList, label: 'Dept Attendance' },
    { path: '/staff/marks', icon: FileText, label: 'Dept Marks' },
    { path: '/staff/students', icon: GraduationCap, label: 'Dept Students' },
    { path: '/staff/announcements', icon: Bell, label: 'My Dept Notices' },
    { path: '/staff/chat', icon: MessageSquare, label: 'Staff Communication' },
  ],
  staff: [
    { path: '/staff', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/staff/college-announcements', icon: Megaphone, label: 'College Notices' },
    { path: '/staff/attendance', icon: ClipboardList, label: 'Attendance' },
    { path: '/staff/marks', icon: FileText, label: 'Marks' },
    { path: '/staff/subjects', icon: BookOpen, label: 'Subjects' },
    { path: '/staff/students', icon: GraduationCap, label: 'Students' },
    { path: '/staff/announcements', icon: Bell, label: 'Dept Notices' },
    { path: '/staff/reports', icon: BarChart3, label: 'Reports' },
    { path: '/staff/documents', icon: Upload, label: 'Documents' },
    { path: '/staff/chat', icon: MessageSquare, label: 'Student Chat' },
  ],
  student: [
    { path: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/student/college-announcements', icon: Megaphone, label: 'College Notices' },
    { path: '/student/attendance', icon: ClipboardList, label: 'My Attendance' },
    { path: '/student/marks', icon: FileText, label: 'My Marks' },
    { path: '/student/announcements', icon: Bell, label: 'Dept Notices' },
    { path: '/student/profile', icon: User, label: 'My Profile' },
    { path: '/student/downloads', icon: Download, label: 'Downloads' },
    { path: '/student/chat', icon: MessageSquare, label: 'Teacher Chat' },
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
          <img 
            src="/logo.png" 
            alt="SmartCMS" 
            style={{ 
              width: collapsed ? '32px' : '36px', 
              height: 'auto',
              filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))' 
            }} 
          />
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
          background: #020617; /* Deep Obsidian */
          display: flex;
          flex-direction: column;
          z-index: 50;
          overflow: hidden;
          border-right: 1px solid rgba(255,255,255,0.03);
          box-shadow: 10px 0 30px rgba(0,0,0,0.5);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .sidebar-logo {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--primary-500), #06b6d4);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
        }

        .sidebar-brand-text h2 {
          font-family: 'Poppins', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: white;
          line-height: 1.2;
        }

        .sidebar-brand-text span {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-nav {
          flex: 1;
          padding: 0 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          margin-bottom: 4px;
        }

        .sidebar-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.03);
          box-shadow: inset 0 0 15px rgba(139, 92, 246, 0.05);
        }

        .sidebar-link.active {
          color: white;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .sidebar-active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 20px;
          background: #8b5cf6;
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 10px #8b5cf6;
        }

        .sidebar-footer {
          padding: 16px;
          margin-top: auto;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.02);
        }

        .sidebar-user-info {
          overflow: hidden;
        }

        .sidebar-avatar {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
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
          padding-top: env(safe-area-inset-top, 20px);
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }

        .mobile-sidebar .sidebar-brand {
          padding-top: 32px; /* Extra space for mobile brand */
          align-items: center;
        }

        .mobile-sidebar .sidebar-footer {
          padding-bottom: 32px; /* Extra space for bottom navigation */
        }

        @media (max-width: 768px) {
          .desktop-sidebar { display: none; }
          .mobile-menu-toggle { display: flex; }
          .sidebar-mobile-overlay { display: block; }
          .sidebar-collapse-btn { display: none; }
          
          /* Ensure better vertical alignment for logo and text */
          .sidebar-brand {
            gap: 16px;
          }
          
          .sidebar-brand-text h2 {
            font-size: 20px;
            margin-bottom: 2px;
          }
        }
      `}</style>
    </>
  );
}
