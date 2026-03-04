// TypeScript type definitions for the Smart CMS Backend

export interface Env {
    DB: D1Database;
    STORAGE: R2Bucket;
    JWT_SECRET: string;
    CORS_ORIGIN: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: 'admin' | 'principal' | 'hod' | 'staff' | 'student';
    department_id: number | null;
    created_at: string;
    updated_at: string;
}

export interface Student {
    id: number;
    user_id: number;
    reg_no: string;
    department_id: number;
    year: number;
    batch: string;
    mobile: string | null;
    parent_mobile: string | null;
    status: 'active' | 'archived';
    created_at: string;
}

export interface Department {
    id: number;
    name: string;
    unique_code: string;
    created_at: string;
}

export interface AttendanceRecord {
    id: number;
    student_id: number;
    date: string;
    status: 'present' | 'absent';
    marked_by: number;
    created_at: string;
}

export interface Mark {
    id: number;
    student_id: number;
    subject: string;
    internal_marks: number;
    external_marks: number;
    total: number;
    exam_type: 'internal' | 'external' | 'semester';
    uploaded_by: number;
    created_at: string;
}

export interface Announcement {
    id: number;
    title: string;
    message: string;
    target_role: string | null;
    department_id: number | null;
    created_by: number;
    created_at: string;
}

export interface Document {
    id: number;
    student_id: number;
    doc_type: string;
    file_key: string;
    file_name: string;
    uploaded_by: number;
    created_at: string;
}

export interface JWTPayload {
    id: number;
    name: string;
    email: string;
    role: string;
    department_id: number | null;
    exp: number;
    iat: number;
}

export interface RequestContext {
    user?: JWTPayload;
    params: Record<string, string>;
    query: Record<string, string>;
    body?: any;
}
