import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardShell() {
    return (
        <div className="dashboard-shell">
            <Sidebar />
            <main className="dashboard-main">
                <Navbar />
                <div className="dashboard-content">
                    <Outlet />
                </div>
            </main>

            <style>{`
        .dashboard-shell {
          display: flex;
          min-height: 100vh;
        }

        .dashboard-main {
          flex: 1;
          margin-left: 280px; /* This will be overridden by .main-content if applied to the same element */
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: margin-left 0.3s ease;
        }

        .dashboard-content {
          flex: 1;
          padding: 28px 32px;
          animation: fadeIn 0.4s ease-out;
        }

        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
          }
          .dashboard-content {
            padding: 16px;
          }
        }

        /* New styles for SaaS look */
        .main-content {
          margin-left: 260px;
          min-height: 100vh;
          background: transparent;
          position: relative;
          z-index: 10;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dashboard-container {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .glass-card {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .glass-card:hover {
          transform: translateY(-8px);
          background: rgba(30, 41, 59, 0.7);
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.1);
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-title {
          font-family: 'Poppins', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 15px;
        }
      `}</style>
        </div>
    );
}
