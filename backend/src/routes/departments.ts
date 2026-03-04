// Department route handlers
import { Env } from '../types';
import { validateRequired, sanitizeString } from '../utils/validation';

function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// GET /api/departments
export async function getAllDepartments(env: Env): Promise<Response> {
    try {
        const { results } = await env.DB.prepare(`
      SELECT d.*,
        (SELECT COUNT(*) FROM students s WHERE s.department_id = d.id AND s.status = 'active') as student_count,
        (SELECT COUNT(*) FROM users u WHERE u.department_id = d.id AND u.role IN ('staff','hod')) as staff_count
      FROM departments d ORDER BY d.name
    `).all();
        return json({ departments: results });
    } catch {
        return json({ error: 'Failed to fetch departments' }, 500);
    }
}

// POST /api/departments
export async function createDepartment(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json() as { name: string; unique_code: string };
        const error = validateRequired(body, ['name', 'unique_code']);
        if (error) return json({ error }, 400);

        const result = await env.DB.prepare(
            'INSERT INTO departments (name, unique_code) VALUES (?, ?)'
        ).bind(sanitizeString(body.name), body.unique_code.toUpperCase().trim()).run();

        return json({ message: 'Department created', id: result.meta.last_row_id }, 201);
    } catch (err: any) {
        if (err.message?.includes('UNIQUE')) return json({ error: 'Department code already exists' }, 400);
        return json({ error: 'Failed to create department' }, 500);
    }
}

// PUT /api/departments/:id
export async function updateDepartment(id: string, request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json() as { name?: string; unique_code?: string };
        const deptId = parseInt(id);

        if (body.name) {
            await env.DB.prepare('UPDATE departments SET name = ? WHERE id = ?').bind(sanitizeString(body.name), deptId).run();
        }
        if (body.unique_code) {
            await env.DB.prepare('UPDATE departments SET unique_code = ? WHERE id = ?').bind(body.unique_code.toUpperCase().trim(), deptId).run();
        }

        return json({ message: 'Department updated' });
    } catch (err: any) {
        if (err.message?.includes('UNIQUE')) return json({ error: 'Department code already exists' }, 400);
        return json({ error: 'Failed to update department' }, 500);
    }
}

// DELETE /api/departments/:id
export async function deleteDepartment(id: string, env: Env): Promise<Response> {
    try {
        const deptId = parseInt(id);

        // Check for linked students/staff
        const linked = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM students WHERE department_id = ? AND status = \'active\''
        ).bind(deptId).first<{ count: number }>();

        if (linked && linked.count > 0) {
            return json({ error: `Cannot delete: ${linked.count} active students in this department` }, 400);
        }

        await env.DB.prepare('DELETE FROM departments WHERE id = ?').bind(deptId).run();
        return json({ message: 'Department deleted' });
    } catch {
        return json({ error: 'Failed to delete department' }, 500);
    }
}
