import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import DashboardShell from './components/layout/DashboardShell';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStaff from './pages/admin/ManageStaff';
import ManageStudents from './pages/admin/ManageStudents';
import ManageDepartments from './pages/admin/ManageDepartments';
import AdminAnnouncements from './pages/admin/Announcements';
import ResetPassword from './pages/admin/ResetPassword';
import BackupPage from './pages/admin/BackupPage';

// Staff
import StaffDashboard from './pages/staff/StaffDashboard';
import TakeAttendance from './pages/staff/TakeAttendance';
import UploadMarks from './pages/staff/UploadMarks';
import Reports from './pages/staff/Reports';
import UploadDocuments from './pages/staff/UploadDocuments';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import MyAttendance from './pages/student/MyAttendance';
import MyMarks from './pages/student/MyMarks';
import MyProfile from './pages/student/MyProfile';
import StudentAnnouncements from './pages/student/StudentAnnouncements';
import Downloads from './pages/student/Downloads';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', border: '3px solid var(--border-color)',
            borderTopColor: 'var(--primary-500)', borderRadius: '50%',
            animation: 'spin-slow 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to role-specific dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (['principal', 'hod', 'staff'].includes(user.role)) return <Navigate to="/staff" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
}

// Auto-redirect based on role
function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (['principal', 'hod', 'staff'].includes(user.role)) return <Navigate to="/staff" replace />;
  return <Navigate to="/student" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RoleRedirect />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardShell />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="staff" element={<ManageStaff />} />
              <Route path="students" element={<ManageStudents />} />
              <Route path="departments" element={<ManageDepartments />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="backup" element={<BackupPage />} />
            </Route>

            {/* Staff / HOD / Principal Routes */}
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={['principal', 'hod', 'staff']}>
                <DashboardShell />
              </ProtectedRoute>
            }>
              <Route index element={<StaffDashboard />} />
              <Route path="attendance" element={<TakeAttendance />} />
              <Route path="marks" element={<UploadMarks />} />
              <Route path="students" element={<ManageStudents />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="reports" element={<Reports />} />
              <Route path="documents" element={<UploadDocuments />} />
            </Route>

            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardShell />
              </ProtectedRoute>
            }>
              <Route index element={<StudentDashboard />} />
              <Route path="attendance" element={<MyAttendance />} />
              <Route path="marks" element={<MyMarks />} />
              <Route path="announcements" element={<StudentAnnouncements />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="downloads" element={<Downloads />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
