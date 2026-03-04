// Document upload route handlers (R2 storage)
import { Env, JWTPayload } from '../types';

function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// POST /api/documents/upload
export async function uploadDocument(request: Request, env: Env, user: JWTPayload): Promise<Response> {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const studentId = formData.get('student_id') as string;
        const docType = formData.get('doc_type') as string;

        if (!file || !studentId || !docType) {
            return json({ error: 'File, student_id, and doc_type are required' }, 400);
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            return json({ error: 'File size must be under 10MB' }, 400);
        }

        // Generate unique key
        const fileKey = `docs/${studentId}/${Date.now()}_${file.name}`;

        // Upload to R2
        await env.STORAGE.put(fileKey, file.stream(), {
            httpMetadata: { contentType: file.type },
            customMetadata: { uploadedBy: String(user.id), docType },
        });

        // Save reference in D1
        await env.DB.prepare(
            'INSERT INTO documents (student_id, doc_type, file_key, file_name, uploaded_by) VALUES (?, ?, ?, ?, ?)'
        ).bind(parseInt(studentId), docType, fileKey, file.name, user.id).run();

        return json({ message: 'Document uploaded', fileKey }, 201);
    } catch {
        return json({ error: 'Failed to upload document' }, 500);
    }
}

// GET /api/documents/student/:studentId
export async function getStudentDocuments(studentId: string, env: Env): Promise<Response> {
    try {
        const { results } = await env.DB.prepare(
            'SELECT d.*, u.name as uploaded_by_name FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id WHERE d.student_id = ? ORDER BY d.created_at DESC'
        ).bind(parseInt(studentId)).all();
        return json({ documents: results });
    } catch {
        return json({ error: 'Failed to fetch documents' }, 500);
    }
}

// GET /api/documents/download/:id
export async function downloadDocument(id: string, env: Env): Promise<Response> {
    try {
        const doc = await env.DB.prepare('SELECT * FROM documents WHERE id = ?').bind(parseInt(id)).first<any>();
        if (!doc) return json({ error: 'Document not found' }, 404);

        const object = await env.STORAGE.get(doc.file_key);
        if (!object) return json({ error: 'File not found in storage' }, 404);

        return new Response(object.body, {
            headers: {
                'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${doc.file_name}"`,
            },
        });
    } catch {
        return json({ error: 'Failed to download document' }, 500);
    }
}

// DELETE /api/documents/:id
export async function deleteDocument(id: string, env: Env): Promise<Response> {
    try {
        const doc = await env.DB.prepare('SELECT * FROM documents WHERE id = ?').bind(parseInt(id)).first<any>();
        if (!doc) return json({ error: 'Document not found' }, 404);

        // Delete from R2
        await env.STORAGE.delete(doc.file_key);
        // Delete DB record
        await env.DB.prepare('DELETE FROM documents WHERE id = ?').bind(parseInt(id)).run();

        return json({ message: 'Document deleted' });
    } catch {
        return json({ error: 'Failed to delete document' }, 500);
    }
}
