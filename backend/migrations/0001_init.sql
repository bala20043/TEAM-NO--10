-- Smart College Management System - Database Schema
-- Cloudflare D1 (SQLite)

-- Departments (must be created first due to FK references)
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  unique_code TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Users table (all roles)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','principal','hod','staff','student')),
  department_id INTEGER REFERENCES departments(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Students (extended profile linked to user)
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  reg_no TEXT UNIQUE NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  year INTEGER NOT NULL,
  batch TEXT NOT NULL,
  mobile TEXT,
  parent_mobile TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active','archived')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('present','absent')),
  marked_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(student_id, date)
);

-- Marks
CREATE TABLE IF NOT EXISTS marks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  internal_marks REAL DEFAULT 0,
  external_marks REAL DEFAULT 0,
  total REAL DEFAULT 0,
  exam_type TEXT DEFAULT 'internal' CHECK(exam_type IN ('internal','external','semester')),
  uploaded_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_role TEXT,
  department_id INTEGER REFERENCES departments(id),
  created_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Documents (R2 file references)
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_reg ON students(reg_no);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_marks_student ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_announcements_target ON announcements(target_role);
CREATE INDEX IF NOT EXISTS idx_documents_student ON documents(student_id);
