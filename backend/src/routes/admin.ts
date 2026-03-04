// Admin route handlers
import { Env, JWTPayload } from '../types';
import { hashPassword } from '../utils/hash';
import { validateRequired, validateEmail, sanitizeString } from '../utils/validation';

function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// GET /api/admin/stats
export async function getStats(env: Env): Promise<Response> {
    try {
        const [students, staff, departments, announcements, attendance] = await Promise.all([
            env.DB.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'active'").first<{ count: number }>(),
            env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE role IN ('staff','hod','principal')").first<{ count: number }>(),
            env.DB.prepare("SELECT COUNT(*) as count FROM departments").first<{ count: number }>(),
            env.DB.prepare("SELECT COUNT(*) as count FROM announcements").first<{ count: number }>(),
            env.DB.prepare("SELECT ROUND(AVG(CASE WHEN status='present' THEN 100.0 ELSE 0 END), 1) as rate FROM attendance WHERE date >= date('now', '-30 days')").first<{ rate: number }>(),
        ]);

        return json({
            totalStudents: students?.count || 0,
            totalStaff: staff?.count || 0,
            totalDepartments: departments?.count || 0,
            activeAlerts: announcements?.count || 0,
            attendanceRate: attendance?.rate || 0,
        });
    } catch {
        return json({ error: 'Failed to fetch stats' }, 500);
    }
}

// GET /api/admin/users?role=staff
export async function getUsers(request: Request, env: Env): Promise<Response> {
    try {
        const url = new URL(request.url);
        const role = url.searchParams.get('role');

        let query = 'SELECT u.id, u.name, u.email, u.role, u.department_id, u.created_at, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id';
        const bindings: any[] = [];

        if (role) {
            query += ' WHERE u.role = ?';
            bindings.push(role);
        }
        query += ' ORDER BY u.created_at DESC';

        const stmt = bindings.length
            ? env.DB.prepare(query).bind(...bindings)
            : env.DB.prepare(query);

        const { results } = await stmt.all();
        return json({ users: results });
    } catch {
        return json({ error: 'Failed to fetch users' }, 500);
    }
}

// POST /api/admin/users - Create user (staff/principal/hod/student)
export async function createUser(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json() as any;
        const error = validateRequired(body, ['name', 'email', 'password', 'role']);
        if (error) return json({ error }, 400);

        if (!validateEmail(body.email)) return json({ error: 'Invalid email' }, 400);
        if (!['principal', 'hod', 'staff', 'student'].includes(body.role)) {
            return json({ error: 'Invalid role' }, 400);
        }
        if (body.password.length < 6) return json({ error: 'Password must be at least 6 characters' }, 400);

        const passwordHash = await hashPassword(body.password);

        const result = await env.DB.prepare(
            'INSERT INTO users (name, email, password_hash, role, department_id) VALUES (?, ?, ?, ?, ?)'
        ).bind(
            sanitizeString(body.name),
            body.email.toLowerCase().trim(),
            passwordHash,
            body.role,
            body.department_id || null
        ).run();

        // If student, also create student profile
        if (body.role === 'student' && body.reg_no) {
            const userId = result.meta.last_row_id;
            await env.DB.prepare(
                'INSERT INTO students (user_id, reg_no, department_id, year, batch, mobile, parent_mobile) VALUES (?, ?, ?, ?, ?, ?, ?)'
            ).bind(
                userId,
                body.reg_no,
                body.department_id || null,
                body.year || 1,
                body.batch || '',
                body.mobile || null,
                body.parent_mobile || null
            ).run();
        }

        return json({ message: 'User created successfully', id: result.meta.last_row_id }, 201);
    } catch (err: any) {
        if (err.message?.includes('UNIQUE')) return json({ error: 'Email or registration number already exists' }, 400);
        return json({ error: 'Failed to create user' }, 500);
    }
}

// DELETE /api/admin/users/:id
export async function deleteUser(id: string, env: Env): Promise<Response> {
    try {
        const userId = parseInt(id);
        if (isNaN(userId)) return json({ error: 'Invalid user ID' }, 400);

        // Don't allow deleting admin
        const user = await env.DB.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first<{ role: string }>();
        if (!user) return json({ error: 'User not found' }, 404);
        if (user.role === 'admin') return json({ error: 'Cannot delete admin account' }, 403);

        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
        return json({ message: 'User deleted successfully' });
    } catch {
        return json({ error: 'Failed to delete user' }, 500);
    }
}

// POST /api/admin/reset-password
export async function resetPassword(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json() as { userId: number; newPassword: string };
        const error = validateRequired(body, ['userId', 'newPassword']);
        if (error) return json({ error }, 400);

        if (body.newPassword.length < 6) return json({ error: 'Password must be at least 6 characters' }, 400);

        const passwordHash = await hashPassword(body.newPassword);
        const result = await env.DB.prepare(
            'UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?'
        ).bind(passwordHash, body.userId).run();

        if (result.meta.changes === 0) return json({ error: 'User not found' }, 404);
        return json({ message: 'Password reset successfully' });
    } catch {
        return json({ error: 'Failed to reset password' }, 500);
    }
}
