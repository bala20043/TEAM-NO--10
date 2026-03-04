// Attendance route handlers
import { Env, JWTPayload } from '../types';

function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// POST /api/attendance - Mark attendance (bulk)
export async function markAttendance(request: Request, env: Env, user: JWTPayload): Promise<Response> {
    try {
        const body = await request.json() as { records: { student_id: number; date: string; status: string }[] };
        if (!body.records || !Array.isArray(body.records) || body.records.length === 0) {
            return json({ error: 'Records array is required' }, 400);
        }

        const stmt = env.DB.prepare(
            'INSERT OR REPLACE INTO attendance (student_id, date, status, marked_by) VALUES (?, ?, ?, ?)'
        );

        const batch = body.records.map(r =>
            stmt.bind(r.student_id, r.date, r.status, user.id)
        );

        await env.DB.batch(batch);
        return json({ message: `Attendance marked for ${body.records.length} students` });
    } catch (err) {
        return json({ error: 'Failed to mark attendance' }, 500);
    }
}

// GET /api/attendance/student/:studentId
export async function getStudentAttendance(studentId: string, env: Env): Promise<Response> {
    try {
        const { results } = await env.DB.prepare(
            'SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 100'
        ).bind(parseInt(studentId)).all();
        return json({ attendance: results });
    } catch {
        return json({ error: 'Failed to fetch attendance' }, 500);
    }
}

// GET /api/attendance/me - Student's own attendance
export async function getMyAttendance(env: Env, user: JWTPayload): Promise<Response> {
    try {
        const student = await env.DB.prepare(
            'SELECT id FROM students WHERE user_id = ?'
        ).bind(user.id).first<{ id: number }>();

        if (!student) return json({ error: 'Student profile not found' }, 404);

        const { results } = await env.DB.prepare(
            'SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 100'
        ).bind(student.id).all();

        // Calculate stats
        const totalDays = results.length;
        const presentDays = results.filter((r: any) => r.status === 'present').length;
        const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100 * 10) / 10 : 0;

        return json({
            attendance: results,
            stats: { totalDays, presentDays, absentDays: totalDays - presentDays, percentage },
        });
    } catch {
        return json({ error: 'Failed to fetch attendance' }, 500);
    }
}

// GET /api/attendance/stats/:studentId
export async function getAttendanceStats(studentId: string, env: Env): Promise<Response> {
    try {
        const stats = await env.DB.prepare(`
      SELECT
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        ROUND(AVG(CASE WHEN status = 'present' THEN 100.0 ELSE 0 END), 1) as percentage
      FROM attendance WHERE student_id = ?
    `).bind(parseInt(studentId)).first();

        return json({ stats });
    } catch {
        return json({ error: 'Failed to fetch stats' }, 500);
    }
}

// GET /api/attendance/department/:deptId?date=YYYY-MM-DD
export async function getDeptAttendance(deptId: string, request: Request, env: Env): Promise<Response> {
    try {
        const url = new URL(request.url);
        const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

        const { results } = await env.DB.prepare(`
      SELECT s.id as student_id, s.reg_no, u.name, s.year, s.batch,
        a.status, a.date
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
      WHERE s.department_id = ? AND s.status = 'active'
      ORDER BY s.year, u.name
    `).bind(date, parseInt(deptId)).all();

        return json({ students: results, date });
    } catch {
        return json({ error: 'Failed to fetch department attendance' }, 500);
    }
}
