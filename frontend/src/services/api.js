const API_BASE = '/api';

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

// Auth
export const authAPI = {
    login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    refreshToken: (refreshToken) => request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
};

// Admin
export const adminAPI = {
    getStats: () => request('/admin/stats'),
    createUser: (userData) => request('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
    getUsers: (role) => request(`/admin/users?role=${role || ''}`),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    resetPassword: (userId, newPassword) => request('/admin/reset-password', { method: 'POST', body: JSON.stringify({ userId, newPassword }) }),
};

// Departments
export const departmentAPI = {
    getAll: () => request('/departments'),
    create: (data) => request('/departments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/departments/${id}`, { method: 'DELETE' }),
};

// Students
export const studentAPI = {
    getAll: (params = '') => request(`/students?${params}`),
    getById: (id) => request(`/students/${id}`),
    getProfile: () => request('/students/profile'),
    archive: (id) => request(`/students/${id}/archive`, { method: 'PUT' }),
    importCSV: (formData) => fetch(`${API_BASE}/students/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
    }).then(r => r.json()),
};

// Attendance
export const attendanceAPI = {
    mark: (records) => request('/attendance', { method: 'POST', body: JSON.stringify({ records }) }),
    getByStudent: (studentId) => request(`/attendance/student/${studentId}`),
    getByDept: (deptId, date) => request(`/attendance/department/${deptId}?date=${date}`),
    getMyAttendance: () => request('/attendance/me'),
    getStats: (studentId) => request(`/attendance/stats/${studentId}`),
};

// Marks
export const marksAPI = {
    upload: (marksData) => request('/marks', { method: 'POST', body: JSON.stringify(marksData) }),
    getByStudent: (studentId) => request(`/marks/student/${studentId}`),
    getMyMarks: () => request('/marks/me'),
};

// Announcements
export const announcementAPI = {
    getAll: () => request('/announcements'),
    create: (data) => request('/announcements', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/announcements/${id}`, { method: 'DELETE' }),
};

// Documents
export const documentAPI = {
    upload: (formData) => fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
    }).then(r => r.json()),
    getByStudent: (studentId) => request(`/documents/student/${studentId}`),
    getMyDocuments: () => request('/documents/me'),
    download: (id) => `${API_BASE}/documents/${id}/download?token=${localStorage.getItem('token')}`,
};
