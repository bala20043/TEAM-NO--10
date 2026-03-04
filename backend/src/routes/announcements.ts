// Announcement route handlers
import { Env, JWTPayload } from '../types';
import { validateRequired, sanitizeString } from '../utils/validation';

function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// GET /api/announcements
export async function getAnnouncements(request: Request, env: Env, user: JWTPayload): Promise<Response> {
    try {
        let query: string;
        let bindings: any[] = [];

        if (user.role === 'admin' || user.role === 'principal') {
            // Admin/Principal see all
            query = `SELECT a.*, u.name as created_by_name FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id ORDER BY a.created_at DESC LIMIT 50`;
        } else if (user.role === 'student') {
            // Students see announcements targeted at them or all
            query = `SELECT a.*, u.name as created_by_name FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        WHERE a.target_role IS NULL OR a.target_role = 'all' OR a.target_role = 'student'
        OR (a.target_role = 'department' AND a.department_id = ?)
        ORDER BY a.created_at DESC LIMIT 50`;
            bindings.push(user.department_id);
        } else {
            // Staff/HOD see staff-targeted or all
            query = `SELECT a.*, u.name as created_by_name FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        WHERE a.target_role IS NULL OR a.target_role = 'all' OR a.target_role = 'staff'
        OR (a.target_role = 'department' AND a.department_id = ?)
        ORDER BY a.created_at DESC LIMIT 50`;
            bindings.push(user.department_id);
        }

        const stmt = bindings.length ? env.DB.prepare(query).bind(...bindings) : env.DB.prepare(query);
        const { results } = await stmt.all();
        return json({ announcements: results });
    } catch {
        return json({ error: 'Failed to fetch announcements' }, 500);
    }
}

// POST /api/announcements
export async function createAnnouncement(request: Request, env: Env, user: JWTPayload): Promise<Response> {
    try {
        const body = await request.json() as { title: string; message: string; target_role?: string; department_id?: number };
        const error = validateRequired(body, ['title', 'message']);
        if (error) return json({ error }, 400);

        const result = await env.DB.prepare(
            'INSERT INTO announcements (title, message, target_role, department_id, created_by) VALUES (?, ?, ?, ?, ?)'
        ).bind(
            sanitizeString(body.title),
            sanitizeString(body.message),
            body.target_role || 'all',
            body.department_id || null,
            user.id
        ).run();

        return json({ message: 'Announcement created', id: result.meta.last_row_id }, 201);
    } catch {
        return json({ error: 'Failed to create announcement' }, 500);
    }
}

// DELETE /api/announcements/:id
export async function deleteAnnouncement(id: string, env: Env): Promise<Response> {
    try {
        await env.DB.prepare('DELETE FROM announcements WHERE id = ?').bind(parseInt(id)).run();
        return json({ message: 'Announcement deleted' });
    } catch {
        return json({ error: 'Failed to delete announcement' }, 500);
    }
}
