-- ========================================================
-- ACADEMIC MANAGEMENT SYSTEM - DATABASE SETUP SCRIPT
-- ========================================================

-- 1. PRE-CLEANUP: Drop existing policies to allow schema changes
-- (PostgreSQL prevents altering columns used in policies)
DROP POLICY IF EXISTS "Students view own record" ON public.students;
DROP POLICY IF EXISTS "HODs manage department students" ON public.students;
DROP POLICY IF EXISTS "Staff view department students" ON public.students;
DROP POLICY IF EXISTS "Admins manage students" ON public.students;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Anyone authenticated can view departments" ON public.departments;
DROP POLICY IF EXISTS "Admins manage departments" ON public.departments;
DROP POLICY IF EXISTS "Students view own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff manage department attendance" ON public.attendance;
DROP POLICY IF EXISTS "Students view own marks" ON public.marks;
DROP POLICY IF EXISTS "Staff manage department marks" ON public.marks;
DROP POLICY IF EXISTS "Authenticated view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Staff manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Anyone view subjects" ON public.subjects;
DROP POLICY IF EXISTS "Staff manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own received messages read status" ON public.messages;

-- 2. CLEANUP: Remove Healthcare System (MediLink)
DROP TABLE IF EXISTS public.ai_sessions CASCADE;
DROP TABLE IF EXISTS public.queue CASCADE;
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.medical_records CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.doctor_slots CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;

DROP FUNCTION IF EXISTS public.update_doctor_rating() CASCADE;
DROP FUNCTION IF EXISTS public.mark_slot_booked() CASCADE;
DROP FUNCTION IF EXISTS public.unmark_slot_on_cancel() CASCADE;

-- 3. SCHEMA NORMALIZATION: Add department tracking to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department_id integer REFERENCES public.departments(id);

-- 4. TYPE CORRECTION: Convert integer user references to UUID
-- (Dropping constraints first to avoid errors)
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_user_id_fkey;
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_marked_by_fkey;
ALTER TABLE public.marks DROP CONSTRAINT IF EXISTS marks_uploaded_by_fkey;
ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_created_by_fkey;
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;
ALTER TABLE public.staff_class_assignments DROP CONSTRAINT IF EXISTS staff_class_assignments_staff_id_fkey;

ALTER TABLE public.students ALTER COLUMN user_id TYPE uuid USING (NULL);
ALTER TABLE public.attendance ALTER COLUMN marked_by TYPE uuid USING (NULL);
ALTER TABLE public.marks ALTER COLUMN uploaded_by TYPE uuid USING (NULL);
ALTER TABLE public.announcements ALTER COLUMN created_by TYPE uuid USING (NULL);
ALTER TABLE public.documents ALTER COLUMN uploaded_by TYPE uuid USING (NULL);
ALTER TABLE public.staff_class_assignments ALTER COLUMN staff_id TYPE uuid USING (NULL);

-- 5. MESSAGES TABLE (Restored for Academic Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 5. SECURITY HELPERS: Define robust role-check functions
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
  RETURN COALESCE(v_role, 'public');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_id()
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES (Idempotent: Drop first, then create)

-- Users Table (Critical for Login)
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT TO authenticated 
USING (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Admins manage all users" ON public.users;
CREATE POLICY "Admins manage all users" ON public.users FOR ALL TO authenticated 
USING ((SELECT role FROM public.users WHERE auth_id = auth.uid()) IN ('admin', 'principal'));

-- Students Table
DROP POLICY IF EXISTS "Students view own record" ON public.students;
CREATE POLICY "Students view own record" ON public.students FOR SELECT TO authenticated 
USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "HODs manage department students" ON public.students;
CREATE POLICY "HODs manage department students" ON public.students FOR ALL TO authenticated 
USING ((get_my_role() IN ('hod', 'principal')) AND (department_id = (SELECT department_id FROM public.users WHERE id = get_my_id())));

-- Messages Table
DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
CREATE POLICY "Users can read own messages" ON public.messages FOR SELECT TO authenticated 
USING (sender_id = get_my_id() OR receiver_id = get_my_id());

-- 8. BUSINESS LOGIC: Triggers and RPCs
-- Dashboard Stats RPC
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json AS $$
BEGIN
  RETURN json_build_object(
    'totalStaff', (SELECT count(*) FROM public.users WHERE role IN ('staff', 'hod', 'principal')),
    'totalStudents', (SELECT count(*) FROM public.students WHERE status = 'active'),
    'totalDepartments', (SELECT count(*) FROM public.departments),
    'pendingApprovals', (SELECT count(*) FROM public.students WHERE status = 'pending')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
