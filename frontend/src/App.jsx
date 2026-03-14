import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import DashboardShell from './components/layout/DashboardShell';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

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
import HODAttendance from './pages/staff/HODAttendance';
import UploadMarks from './pages/staff/UploadMarks';
import HODMarks from './pages/staff/HODMarks';
import Reports from './pages/staff/Reports';
import UploadDocuments from './pages/staff/UploadDocuments';
import HODStudents from './pages/staff/HODStudents';
import HODAnnouncements from './pages/staff/HODAnnouncements';
import CollegeAnnouncements from './pages/staff/CollegeAnnouncements';
import StaffChat from './pages/staff/StaffChat';
import ManageSubjects from './pages/staff/ManageSubjects';
import StaffProfile from './pages/staff/StaffProfile';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import MyAttendance from './pages/student/MyAttendance';
import MyMarks from './pages/student/MyMarks';
import MyProfile from './pages/student/MyProfile';
import StudentAnnouncements from './pages/student/StudentAnnouncements';
import Downloads from './pages/student/Downloads';
import ParentChat from './pages/student/ParentChat';

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
  const userRole = user.role?.toLowerCase();
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to role-specific dashboard
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (['principal', 'hod', 'staff'].includes(userRole)) return <Navigate to="/staff" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
}

// Auto-redirect based on role
function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role?.toLowerCase();
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (['principal', 'hod', 'staff'].includes(role)) return <Navigate to="/staff" replace />;
  return <Navigate to="/student" replace />;
}

// Helper to switch between Staff and HOD components
function StaffRoleRouter({ staffElement, hodElement }) {
  const { user } = useAuth();
  if (user?.role?.toLowerCase() === 'hod') return hodElement;
  return staffElement;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
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
              <Route path="attendance" element={<StaffRoleRouter staffElement={<TakeAttendance />} hodElement={<HODAttendance />} />} />
              <Route path="marks" element={<ProtectedRoute allowedRoles={['hod', 'staff']}><StaffRoleRouter staffElement={<UploadMarks />} hodElement={<HODMarks />} /></ProtectedRoute>} />
              <Route path="subjects" element={<ProtectedRoute allowedRoles={['hod', 'principal', 'staff']}><ManageSubjects /></ProtectedRoute>} />
              <Route path="students" element={<ProtectedRoute allowedRoles={['hod', 'principal']}><StaffRoleRouter staffElement={<ManageStudents />} hodElement={<HODStudents />} /></ProtectedRoute>} />
              <Route path="announcements" element={<ProtectedRoute allowedRoles={['hod', 'principal', 'staff']}><StaffRoleRouter staffElement={<AdminAnnouncements />} hodElement={<HODAnnouncements />} /></ProtectedRoute>} />
              <Route path="college-announcements" element={<CollegeAnnouncements />} />
              <Route path="reports" element={<ProtectedRoute allowedRoles={['hod', 'principal']}><Reports /></ProtectedRoute>} />
              <Route path="documents" element={<ProtectedRoute allowedRoles={['hod', 'principal', 'staff']}><UploadDocuments /></ProtectedRoute>} />
              <Route path="chat" element={<StaffChat />} />
              <Route path="profile" element={<StaffProfile />} />
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
              <Route path="college-announcements" element={<CollegeAnnouncements />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="downloads" element={<Downloads />} />
              <Route path="chat" element={<ParentChat />} />
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
