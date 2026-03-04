// Smart College Management System - Cloudflare Worker Entry Point
// Main router with CORS, auth middleware, and all API routes

import { Env, JWTPayload } from './types';
import { authenticate, requireRole } from './middleware/auth';

// Auth routes
import { handleLogin, handleRefreshToken, handleSetup } from './routes/auth';

// Admin routes
import { getStats, getUsers, createUser, deleteUser, resetPassword } from './routes/admin';

// Department routes
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from './routes/departments';

// Student routes
import { getStudents, getMyProfile, getStudentById, archiveStudent } from './routes/students';

// Attendance routes
import { markAttendance, getStudentAttendance, getMyAttendance, getAttendanceStats, getDeptAttendance } from './routes/attendance';

// Marks routes
import { uploadMarks, getStudentMarks, getMyMarks } from './routes/marks';

// Announcement routes
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from './routes/announcements';

// Document routes
import { uploadDocument, getStudentDocuments, downloadDocument, deleteDocument } from './routes/documents';

// ===== CORS Headers =====
function corsHeaders(origin: string): Record<string, string> {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
    };
}

function addCors(response: Response, origin: string): Response {
    const newResponse = new Response(response.body, response);
    Object.entries(corsHeaders(origin)).forEach(([k, v]) => {
        newResponse.headers.set(k, v);
    });
    return newResponse;
}

function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// ===== Route Matching =====
function matchRoute(method: string, pathname: string, targetMethod: string, pattern: string): Record<string, string> | null {
    if (method !== targetMethod) return null;

    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
            params[patternParts[i].slice(1)] = pathParts[i];
        } else if (patternParts[i] !== pathParts[i]) {
            return null;
        }
    }
    return params;
}

// ===== Main Worker =====
export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const pathname = url.pathname;
        const method = request.method;
        const origin = env.CORS_ORIGIN || '*';

        // Handle CORS preflight
        if (method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders(origin) });
        }

        // Health check
        if (pathname === '/api/health') {
            return addCors(json({ status: 'ok', timestamp: new Date().toISOString() }), origin);
        }

        try {
            let response: Response;

            // ===== PUBLIC ROUTES (no auth required) =====
            if (matchRoute(method, pathname, 'POST', '/api/auth/login')) {
                response = await handleLogin(request, env);
                return addCors(response, origin);
            }

            if (matchRoute(method, pathname, 'POST', '/api/auth/refresh')) {
                response = await handleRefreshToken(request, env);
                return addCors(response, origin);
            }

            if (matchRoute(method, pathname, 'POST', '/api/auth/setup')) {
                response = await handleSetup(request, env);
                return addCors(response, origin);
            }

            // ===== AUTHENTICATED ROUTES =====
            const user = await authenticate(request, env);
            if (!user) {
                return addCors(json({ error: 'Unauthorized. Please login.' }, 401), origin);
            }

            // --- Admin Routes (admin only) ---
            const isAdmin = requireRole('admin');
            const isAdminOrPrincipal = requireRole('admin', 'principal');
            const isStaff = requireRole('admin', 'principal', 'hod', 'staff');
            const isStudent = requireRole('student');

            if (matchRoute(method, pathname, 'GET', '/api/admin/stats')) {
                if (!isAdmin(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await getStats(env);
                return addCors(response, origin);
            }

            if (matchRoute(method, pathname, 'GET', '/api/admin/users')) {
                if (!isAdmin(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await getUsers(request, env);
                return addCors(response, origin);
            }

            if (matchRoute(method, pathname, 'POST', '/api/admin/users')) {
                if (!isAdmin(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await createUser(request, env);
                return addCors(response, origin);
            }

            let params = matchRoute(method, pathname, 'DELETE', '/api/admin/users/:id');
            if (params) {
                if (!isAdmin(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await deleteUser(params.id, env);
                return addCors(response, origin);
            }

            if (matchRoute(method, pathname, 'POST', '/api/admin/reset-password')) {
                if (!isAdmin(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await resetPassword(request, env);
                return addCors(response, origin);
            }

            // --- Department Routes ---
            if (matchRoute(method, pathname, 'GET', '/api/departments')) {
                response = await getAllDepartments(env);
                return addCors(response, origin);
            }

            if (matchRoute(method, pathname, 'POST', '/api/departments')) {
                if (!isAdmin(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await createDepartment(request, env);
                return addCors(response, origin);
            }

            params = matchRoute(method, pathname, 'PUT', '/api/departments/:id');
            if (params) {
                if (!isAdmin(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await updateDepartment(params.id, request, env);
                return addCors(response, origin);
            }

            params = matchRoute(method, pathname, 'DELETE', '/api/departments/:id');
            if (params) {
                if (!isAdmin(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await deleteDepartment(params.id, env);
                return addCors(response, origin);
            }

            // --- Student Routes ---
            if (matchRoute(method, pathname, 'GET', '/api/students')) {
                if (!isStaff(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await getStudents(request, env);
                return addCors(response, origin);
            }

            if (matchRoute(method, pathname, 'GET', '/api/students/profile')) {
                if (!isStudent(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await getMyProfile(env, user);
                return addCors(response, origin);
            }

            params = matchRoute(method, pathname, 'GET', '/api/students/:id');
            if (params) {
                if (!isStaff(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await getStudentById(params.id, env);
                return addCors(response, origin);
            }

            params = matchRoute(method, pathname, 'PUT', '/api/students/:id/archive');
            if (params) {
                if (!isAdminOrPrincipal(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await archiveStudent(params.id, env);
                return addCors(response, origin);
            }

            // --- Attendance Routes ---
            if (matchRoute(method, pathname, 'POST', '/api/attendance')) {
                if (!isStaff(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await markAttendance(request, env, user);
                return addCors(response, origin);
            }

            if (matchRoute(method, pathname, 'GET', '/api/attendance/me')) {
                if (!isStudent(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await getMyAttendance(env, user);
                return addCors(response, origin);
            }

            params = matchRoute(method, pathname, 'GET', '/api/attendance/student/:studentId');
            if (params) {
                if (!isStaff(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await getStudentAttendance(params.studentId, env);
                return addCors(response, origin);
            }

            params = matchRoute(method, pathname, 'GET', '/api/attendance/stats/:studentId');
            if (params) {
                response = await getAttendanceStats(params.studentId, env);
                return addCors(response, origin);
            }

            params = matchRoute(method, pathname, 'GET', '/api/attendance/department/:deptId');
            if (params) {
                if (!isStaff(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await getDeptAttendance(params.deptId, request, env);
                return addCors(response, origin);
            }

            // --- Marks Routes ---
            if (matchRoute(method, pathname, 'POST', '/api/marks')) {
                if (!isStaff(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await uploadMarks(request, env, user);
                return addCors(response, origin);
            }

            if (matchRoute(method, pathname, 'GET', '/api/marks/me')) {
                if (!isStudent(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await getMyMarks(env, user);
                return addCors(response, origin);
            }

            params = matchRoute(method, pathname, 'GET', '/api/marks/student/:studentId');
            if (params) {
                if (!isStaff(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await getStudentMarks(params.studentId, env);
                return addCors(response, origin);
            }

            // --- Announcement Routes ---
            if (matchRoute(method, pathname, 'GET', '/api/announcements')) {
                response = await getAnnouncements(request, env, user);
                return addCors(response, origin);
            }

            if (matchRoute(method, pathname, 'POST', '/api/announcements')) {
                if (!isStaff(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await createAnnouncement(request, env, user);
                return addCors(response, origin);
            }

            params = matchRoute(method, pathname, 'DELETE', '/api/announcements/:id');
            if (params) {
                if (!isAdminOrPrincipal(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await deleteAnnouncement(params.id, env);
                return addCors(response, origin);
            }

            // --- Document Routes ---
            if (matchRoute(method, pathname, 'POST', '/api/documents/upload')) {
                if (!isStaff(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await uploadDocument(request, env, user);
                return addCors(response, origin);
            }

            params = matchRoute(method, pathname, 'GET', '/api/documents/student/:studentId');
            if (params) {
                response = await getStudentDocuments(params.studentId, env);
                return addCors(response, origin);
            }

            params = matchRoute(method, pathname, 'GET', '/api/documents/download/:id');
            if (params) {
                response = await downloadDocument(params.id, env);
                return addCors(response, origin);
            }

            params = matchRoute(method, pathname, 'DELETE', '/api/documents/:id');
            if (params) {
                if (!isStaff(user)) return addCors(json({ error: 'Forbidden' }, 403), origin);
                response = await deleteDocument(params.id, env);
                return addCors(response, origin);
            }

            // ===== 404 =====
            return addCors(json({ error: 'Not found', path: pathname }, 404), origin);

        } catch (err: any) {
            console.error('Unhandled error:', err);
            return addCors(json({ error: 'Internal server error' }, 500), origin);
        }
    },
};
