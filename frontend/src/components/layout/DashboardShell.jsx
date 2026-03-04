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
          margin-left: 280px;
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
      `}</style>
        </div>
    );
}
