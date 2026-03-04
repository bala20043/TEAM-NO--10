// Marks route handlers
import { Env, JWTPayload } from '../types';

function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// POST /api/marks - Upload marks (bulk)
export async function uploadMarks(request: Request, env: Env, user: JWTPayload): Promise<Response> {
    try {
        const body = await request.json() as {
            marks: { student_id: number; subject: string; internal_marks: number; external_marks: number; exam_type?: string }[]
        };

        if (!body.marks || !Array.isArray(body.marks) || body.marks.length === 0) {
            return json({ error: 'Marks array is required' }, 400);
        }

        const stmt = env.DB.prepare(
            'INSERT INTO marks (student_id, subject, internal_marks, external_marks, total, exam_type, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );

        const batch = body.marks.map(m =>
            stmt.bind(
                m.student_id,
                m.subject,
                m.internal_marks || 0,
                m.external_marks || 0,
                (m.internal_marks || 0) + (m.external_marks || 0),
                m.exam_type || 'internal',
                user.id
            )
        );

        await env.DB.batch(batch);
        return json({ message: `Marks uploaded for ${body.marks.length} students` }, 201);
    } catch {
        return json({ error: 'Failed to upload marks' }, 500);
    }
}

// GET /api/marks/student/:studentId
export async function getStudentMarks(studentId: string, env: Env): Promise<Response> {
    try {
        const { results } = await env.DB.prepare(
            'SELECT * FROM marks WHERE student_id = ? ORDER BY created_at DESC'
        ).bind(parseInt(studentId)).all();
        return json({ marks: results });
    } catch {
        return json({ error: 'Failed to fetch marks' }, 500);
    }
}

// GET /api/marks/me - Student's own marks
export async function getMyMarks(env: Env, user: JWTPayload): Promise<Response> {
    try {
        const student = await env.DB.prepare(
            'SELECT id FROM students WHERE user_id = ?'
        ).bind(user.id).first<{ id: number }>();

        if (!student) return json({ error: 'Student profile not found' }, 404);

        const { results } = await env.DB.prepare(
            'SELECT * FROM marks WHERE student_id = ? ORDER BY created_at DESC'
        ).bind(student.id).all();

        // Calculate average
        const totalMarks = results.reduce((sum: number, m: any) => sum + (m.total || 0), 0);
        const avgMarks = results.length > 0 ? Math.round(totalMarks / results.length * 10) / 10 : 0;

        return json({
            marks: results,
            stats: { totalSubjects: results.length, average: avgMarks },
        });
    } catch {
        return json({ error: 'Failed to fetch marks' }, 500);
    }
}
