-- ========================================
-- FIX: Staff Deletion Foreign Key Errors
-- Run this in Supabase SQL Editor
-- ========================================

-- 1. Fix Documents table (Staff uploaded documents)
ALTER TABLE public.documents 
DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;

ALTER TABLE public.documents
ADD CONSTRAINT documents_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- 2. Fix Announcements table (Staff created announcements)
ALTER TABLE public.announcements 
DROP CONSTRAINT IF EXISTS announcements_created_by_fkey;

ALTER TABLE public.announcements
ADD CONSTRAINT announcements_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- 3. Fix Attendance table (Staff marked attendance)
ALTER TABLE public.attendance 
DROP CONSTRAINT IF EXISTS attendance_marked_by_fkey;

ALTER TABLE public.attendance
ADD CONSTRAINT attendance_marked_by_fkey 
FOREIGN KEY (marked_by) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- 4. Fix Marks table (Staff uploaded marks)
ALTER TABLE public.marks 
DROP CONSTRAINT IF EXISTS marks_uploaded_by_fkey;

ALTER TABLE public.marks
ADD CONSTRAINT marks_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- 5. Fix Messages table (Staff sent/received messages)
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

ALTER TABLE public.messages
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE,
ADD CONSTRAINT messages_receiver_id_fkey 
FOREIGN KEY (receiver_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;
