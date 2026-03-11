import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, Search, X } from 'lucide-react';

export default function Navbar() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <header className="navbar">
            <div className="navbar-left">
                <div className="navbar-greeting">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="navbar-title"
                    >
                        Welcome back, <span className="gradient-text">{user?.name || 'User'}</span> 👋
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="navbar-subtitle"
                    >
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </motion.p>
                </div>
            </div>

            <div className="navbar-right">
                {/* Search */}
                <AnimatePresence>
                    {searchOpen && (
                        <motion.div
                            className="navbar-search"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 240, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <input
                                type="text"
                                placeholder="Search..."
                                className="navbar-search-input"
                                autoFocus
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    className="navbar-icon-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchOpen(!searchOpen)}
                >
                    {searchOpen ? <X size={20} /> : <Search size={20} />}
                </motion.button>

                {/* Notification Bell */}
                <motion.button
                    className="navbar-icon-btn notification-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                >
                    <Bell size={20} />
                    <span className="notification-badge">3</span>
                </motion.button>

                {/* Theme Toggle */}
                <motion.button
                    className="navbar-icon-btn theme-toggle"
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={theme}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </motion.div>
                    </AnimatePresence>
                </motion.button>
            </div>

            {/* Notifications Dropdown */}
            <AnimatePresence>
                {showNotifications && (
                    <>
                        <motion.div
                            className="notifications-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNotifications(false)}
                        />
                        <motion.div
                            className="notifications-dropdown"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        >
                            <div className="notifications-header">
                                <h3>Notifications</h3>
                                <button className="btn btn-ghost btn-sm">Mark all read</button>
                            </div>
                            <div className="notifications-list">
                                <div className="notification-item unread">
                                    <div className="notification-dot"></div>
                                    <div>
                                        <p className="notification-text">New attendance report available</p>
                                        <span className="notification-time">2 min ago</span>
                                    </div>
                                </div>
                                <div className="notification-item unread">
                                    <div className="notification-dot"></div>
                                    <div>
                                        <p className="notification-text">Marks uploaded for CSE Batch 2024</p>
                                        <span className="notification-time">1 hour ago</span>
                                    </div>
                                </div>
                                <div className="notification-item">
                                    <div>
                                        <p className="notification-text">System backup completed successfully</p>
                                        <span className="notification-time">Yesterday</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          background: rgba(15, 23, 42, 0.4); /* Transparent with background showing through */
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          position: sticky;
          top: 0;
          z-index: 30;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .navbar-title {
          font-family: 'Poppins', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: white;
        }

        .navbar-title span {
          font-size: 24px;
        }

        .navbar-subtitle {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .navbar-icon-btn {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          position: relative;
        }

        .navbar-icon-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border-color: var(--primary-400);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          border-radius: var(--radius-full);
          background: var(--danger-500);
          color: white;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bounce-in 0.5s ease-out;
        }

        .navbar-search {
          overflow: hidden;
        }

        .navbar-search-input {
          width: 100%;
          padding: 10px 14px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 14px;
        }

        .navbar-search-input:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .notifications-overlay {
          position: fixed;
          inset: 0;
          z-index: 35;
        }

        .notifications-dropdown {
          position: absolute;
          top: 70px;
          right: 32px;
          width: 360px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 60px var(--shadow-color);
          z-index: 40;
          overflow: hidden;
        }

        .notifications-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .notifications-header h3 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .notifications-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border-color);
          transition: background var(--transition-fast);
          cursor: pointer;
        }

        .notification-item:hover {
          background: var(--bg-secondary);
        }

        .notification-item.unread {
          background: rgba(99, 102, 241, 0.04);
        }

        .notification-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--primary-500);
          flex-shrink: 0;
          margin-top: 6px;
        }

        .notification-text {
          font-size: 13px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .notification-time {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 16px 16px 16px 64px;
          }
          .navbar-title {
            font-size: 16px;
          }
          .navbar-title span {
            font-size: 17px;
          }
          .notifications-dropdown {
            right: 8px;
            left: 8px;
            width: auto;
          }
        }

        @media (max-width: 480px) {
          .navbar-greeting { display: none; }
        }
      `}</style>
        </header>
    );
}
