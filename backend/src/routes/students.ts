// Student route handlers
import { Env, JWTPayload } from '../types';

function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// GET /api/students?department_id=1&year=2&status=active
export async function getStudents(request: Request, env: Env): Promise<Response> {
    try {
        const url = new URL(request.url);
        const deptId = url.searchParams.get('department_id');
        const year = url.searchParams.get('year');
        const status = url.searchParams.get('status') || 'active';
        const search = url.searchParams.get('search');

        let query = `SELECT s.*, u.name, u.email, d.name as department_name, d.unique_code as dept_code
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON s.department_id = d.id
      WHERE 1=1`;
        const bindings: any[] = [];

        if (status) { query += ' AND s.status = ?'; bindings.push(status); }
        if (deptId) { query += ' AND s.department_id = ?'; bindings.push(parseInt(deptId)); }
        if (year) { query += ' AND s.year = ?'; bindings.push(parseInt(year)); }
        if (search) {
            query += ' AND (u.name LIKE ? OR s.reg_no LIKE ?)';
            bindings.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY u.name LIMIT 200';

        const stmt = bindings.length ? env.DB.prepare(query).bind(...bindings) : env.DB.prepare(query);
        const { results } = await stmt.all();
        return json({ students: results });
    } catch {
        return json({ error: 'Failed to fetch students' }, 500);
    }
}

// GET /api/students/profile - Get own student profile
export async function getMyProfile(env: Env, user: JWTPayload): Promise<Response> {
    try {
        const profile = await env.DB.prepare(`
      SELECT s.*, u.name, u.email, d.name as department_name, d.unique_code as dept_code
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON s.department_id = d.id
      WHERE s.user_id = ?
    `).bind(user.id).first();

        if (!profile) return json({ error: 'Student profile not found' }, 404);
        return json({ profile });
    } catch {
        return json({ error: 'Failed to fetch profile' }, 500);
    }
}

// GET /api/students/:id
export async function getStudentById(id: string, env: Env): Promise<Response> {
    try {
        const student = await env.DB.prepare(`
      SELECT s.*, u.name, u.email, d.name as department_name, d.unique_code as dept_code
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON s.department_id = d.id
      WHERE s.id = ?
    `).bind(parseInt(id)).first();

        if (!student) return json({ error: 'Student not found' }, 404);
        return json({ student });
    } catch {
        return json({ error: 'Failed to fetch student' }, 500);
    }
}

// PUT /api/students/:id/archive
export async function archiveStudent(id: string, env: Env): Promise<Response> {
    try {
        const studentId = parseInt(id);
        const student = await env.DB.prepare('SELECT status FROM students WHERE id = ?').bind(studentId).first<{ status: string }>();
        if (!student) return json({ error: 'Student not found' }, 404);

        const newStatus = student.status === 'active' ? 'archived' : 'active';
        await env.DB.prepare('UPDATE students SET status = ? WHERE id = ?').bind(newStatus, studentId).run();

        return json({ message: `Student ${newStatus === 'archived' ? 'archived' : 'restored'} successfully` });
    } catch {
        return json({ error: 'Failed to update student' }, 500);
    }
}
