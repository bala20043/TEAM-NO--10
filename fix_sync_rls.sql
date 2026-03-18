-- ========================================
-- FIX: Student Data Synchronization Issues
-- Run this in Supabase SQL Editor
-- ========================================

-- 1. Fix Attendance table permissions
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO anon;

-- 2. Fix Marks table permissions
ALTER TABLE public.marks DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.marks TO authenticated;
GRANT ALL ON public.marks TO anon;

-- 3. Fix Announcements table permissions
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO anon;

-- 4. Fix Subjects table permissions (for staff to see them)
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO anon;
