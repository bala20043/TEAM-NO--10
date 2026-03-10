import { supabase } from '../lib/supabase';

// Helper to get current user session auth_id
const getCurrentUserId = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // 1. Try matching by auth UUID
    let { data: user, error } = await supabase
        .from('users')
        .select('id, role')
        .eq('auth_id', session.user.id)
        .maybeSingle();

    // 2. Fallback: Try matching by email and link it
    if (!user && !error) {
        console.log('API: Profile match failed, link by email fallback...', session.user.email);
        const { data: emailMatch } = await supabase
            .from('users')
            .select('id, role')
            .eq('email', session.user.email)
            .maybeSingle();

        if (emailMatch) {
            console.log('API: Linking user by email...');
            const { data: linked } = await supabase
                .from('users')
                .update({ auth_id: session.user.id })
                .eq('id', emailMatch.id)
                .select('id, role')
                .single();
            user = linked;
        }
    }

    if (!user) throw new Error('User profile not found. Please contact admin.');
    return user;
};

// Auth
export const authAPI = {
    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        return { success: true, data };
    },
    register: async (userData) => {
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
        });
        if (authError) throw authError;

        // 2. Create user profile (student role)
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .insert({
                auth_id: authData.user.id,
                name: userData.name,
                email: userData.email,
                role: 'student',
                department_id: userData.department_id
            })
            .select('id')
            .single();
        if (profileError) throw profileError;

        // 3. Create student record
        const { error: studentError } = await supabase
            .from('students')
            .insert({
                user_id: userProfile.id,
                reg_no: userData.reg_no,
                department_id: userData.department_id,
                year: userData.year,
                batch: userData.batch,
            });
        if (studentError) throw studentError;

        return { success: true };
    },
    refreshToken: () => { /* Handled automatically by Supabase SDK */ },
};

// Admin
export const adminAPI = {
    getStats: async () => {
        const { count: teachers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'staff');
        const { count: students } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
        const { count: departments } = await supabase.from('departments').select('*', { count: 'exact', head: true });

        return { stats: { totalTeachers: teachers, totalStudents: students, departmentsCount: departments, recentActivities: [] } };
    },
    createUser: async (userData) => {
        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
            });
            if (authError) throw authError;

            // 2. Check if profile already exists (maybe seeded)
            const { data: existingProfile } = await supabase
                .from('users')
                .select('id')
                .eq('email', userData.email)
                .maybeSingle();

            if (existingProfile) {
                // Link
                const { error: linkError } = await supabase
                    .from('users')
                    .update({ auth_id: authData.user.id, role: userData.role, department_id: userData.department_id })
                    .eq('id', existingProfile.id);
                if (linkError) throw linkError;
            } else {
                // Create
                const { error: profileError } = await supabase
                    .from('users')
                    .insert({
                        auth_id: authData.user.id,
                        name: userData.name,
                        email: userData.email,
                        role: userData.role,
                        department_id: userData.department_id
                    });
                if (profileError) throw profileError;
            }

            return { message: 'User created successfully' };
        } catch (err) {
            console.error('Admin Create User Error:', err);
            throw new Error(err.message || 'Failed to create user');
        }
    },
    getUsers: async (role) => {
        let query = supabase.from('users').select('*, department:departments(name)');
        if (role) {
            query = role === 'staff' ? query.in('role', ['staff', 'hod', 'principal']) : query.eq('role', role);
        }
        const { data, error } = await query;
        if (error) throw error;
        return { users: data };
    },
    deleteUser: async (id) => {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        return { message: 'User deleted' };
    },
    resetPassword: async (data, newPassword) => {
        // Only works for the logged-in user with anon key. Real admin reset requires Edge Functions/Service Role
        alert("Password reset via Admin requires Supabase Edge Functions. User must use 'Forgot Password'.");
        return { error: 'Requires Edge Function' };
    },
    getPendingStudents: async () => {
        // Note: Missing 'approval_status' in schema, assuming all are approved for now
        return { students: [] };
    },
    approveStudent: async (id) => { return { message: 'Approved' }; },
    rejectStudent: async (id) => { return { message: 'Rejected' }; },
};

// Departments
export const departmentAPI = {
    getAll: async () => {
        const { data, error } = await supabase.from('departments').select('*');
        if (error) throw error;
        return { departments: data };
    },
    create: async (data) => {
        const { error } = await supabase.from('departments').insert(data);
        if (error) throw error;
        return { message: 'Department created' };
    },
    update: async (id, data) => {
        const { error } = await supabase.from('departments').update(data).eq('id', id);
        if (error) throw error;
        return { message: 'Department updated' };
    },
    delete: async (id) => {
        const { error } = await supabase.from('departments').delete().eq('id', id);
        if (error) throw error;
        return { message: 'Department deleted' };
    },
};

// Students
export const studentAPI = {
    getAll: async (deptIdOrParams, year) => {
        let query = supabase.from('students').select(`
            *,
            users!inner (name, email),
            departments (name)
        `);

        if (typeof deptIdOrParams === 'number') {
            query = query.eq('department_id', deptIdOrParams);
            if (year) query = query.eq('year', year);
        } else if (typeof deptIdOrParams === 'string') {
            const params = new URLSearchParams(deptIdOrParams);
            if (params.get('department_id')) query = query.eq('department_id', params.get('department_id'));
            if (params.get('year')) query = query.eq('year', params.get('year'));
        }

        const { data, error } = await query;
        if (error) throw error;

        // Flatten the users join
        const formatted = data.map(s => ({
            ...s,
            name: s.users.name,
            email: s.users.email,
            department_name: s.departments?.name
        }));

        return { students: formatted };
    },
    getById: async (id) => {
        const { data, error } = await supabase
            .from('students')
            .select('*, users(name, email), departments(name)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return { student: { ...data, name: data.users.name, email: data.users.email } };
    },
    getProfile: async () => {
        const currentUser = await getCurrentUserId();
        const { data, error } = await supabase
            .from('students')
            .select('*, users(name, email), departments(name)')
            .eq('user_id', currentUser.id)
            .single();
        if (error) throw error;
        return { profile: { ...data, name: data.users.name, email: data.users.email } };
    },
    archive: async (id) => {
        const { error } = await supabase.from('students').update({ status: 'archived' }).eq('id', id);
        if (error) throw error;
        return { message: 'Archived' };
    },
};

// Staff Stats
export const staffAPI = {
    getStats: async () => {
        const currentUser = await getCurrentUserId();
        // Assuming HOD logic based on role
        return { stats: { studentsCount: 0, classesToday: 0, pendingTasks: 0 } };
    },
};

// Attendance
export const attendanceAPI = {
    mark: async (records) => {
        const currentUser = await getCurrentUserId();
        const formatted = records.map(r => ({ ...r, marked_by: currentUser.id }));
        const { error } = await supabase.from('attendance').upsert(formatted, { onConflict: 'student_id, date' });
        if (error) throw error;
        return { message: 'Attendance marked' };
    },
    markBulk: async (records) => attendanceAPI.mark(records),
    getByStudent: async (studentId) => {
        const { data, error } = await supabase.from('attendance').select('*').eq('student_id', studentId);
        if (error) throw error;
        return { records: data };
    },
    getByDept: async (deptId, date) => {
        // Complex query: get students in dept, then their attendance for date
        const { data: students, error: studentError } = await supabase
            .from('students')
            .select('id')
            .eq('department_id', deptId);
        if (studentError) throw studentError;

        const studentIds = students.map(s => s.id);
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('date', date)
            .in('student_id', studentIds);
        if (error) throw error;
        return { records: data };
    },
    getDeptAttendance: async (deptId, date, year) => attendanceAPI.getByDept(deptId, date), // Simplified
    getMyAttendance: async () => {
        const { profile } = await studentAPI.getProfile();
        return attendanceAPI.getByStudent(profile.id);
    },
    getStats: async (studentId) => {
        const { data, error } = await supabase.from('attendance').select('status').eq('student_id', studentId);
        if (error) throw error;
        const total = data.length;
        const present = data.filter(d => d.status === 'present').length;
        const percentage = total > 0 ? (present / total) * 100 : 0;
        return { stats: { totalClass: total, present, percentage } };
    },
};

// Marks
export const marksAPI = {
    upload: async (marksData) => {
        const currentUser = await getCurrentUserId();
        const formatted = marksData.map(m => ({ ...m, uploaded_by: currentUser.id }));
        const { error } = await supabase.from('marks').upsert(formatted);
        if (error) throw error;
        return { message: 'Marks uploaded' };
    },
    uploadBulk: async (records) => marksAPI.upload(records),
    getByStudent: async (studentId) => {
        const { data, error } = await supabase.from('marks').select('*').eq('student_id', studentId);
        if (error) throw error;
        return { marks: data };
    },
    getMyMarks: async () => {
        const { profile } = await studentAPI.getProfile();
        return marksAPI.getByStudent(profile.id);
    },
    getDeptMarks: async (deptId, year, examType) => {
        const { data, error } = await supabase.from('marks').select('*, students!inner(department_id, year)');
        if (error) throw error;
        return { marks: data };
    },
    getSubjectMarks: async (params) => {
        const p = new URLSearchParams(params);
        let query = supabase.from('marks').select('*, students!inner(department_id, year, reg_no, users(name))');
        if (p.get('subject')) query = query.eq('subject', p.get('subject'));
        const { data, error } = await query;
        if (error) throw error;
        return {
            marks: data.map(m => ({
                ...m,
                student_name: m.students.users.name,
                reg_no: m.students.reg_no
            }))
        };
    },
    getStudentSemesterMarks: async (studentId, semester) => {
        const { data, error } = await supabase.from('marks').select('*').eq('student_id', studentId).eq('semester', semester);
        if (error) throw error;
        return { marks: data };
    },
    uploadSemesterMarks: async (marks) => marksAPI.upload(marks),
};

export const subjectsAPI = {
    getSubjects: async (params) => {
        const p = new URLSearchParams(params);
        let query = supabase.from('subjects').select('*');
        if (p.get('department_id')) query = query.eq('department_id', p.get('department_id'));
        if (p.get('year')) query = query.eq('year', p.get('year'));
        if (p.get('semester')) query = query.eq('semester', p.get('semester'));
        const { data, error } = await query;
        if (error) throw error;
        return { subjects: data };
    },
    syncSubjects: async (data) => {
        const { error } = await supabase.from('subjects').upsert(data.subjects, { onConflict: 'code,department_id' });
        if (error) throw error;
        return { message: 'Subjects synced' };
    }
};

// Announcements
export const announcementAPI = {
    getAll: async () => {
        const { data, error } = await supabase.from('announcements').select('*, created_by_user:users(name)').order('created_at', { ascending: false });
        if (error) throw error;
        return { announcements: data.map(a => ({ ...a, author_name: a.created_by_user?.name })) };
    },
    create: async (data) => {
        const currentUser = await getCurrentUserId();
        const { error } = await supabase.from('announcements').insert({ ...data, created_by: currentUser.id });
        if (error) throw error;
        return { message: 'Announcement created' };
    },
    delete: async (id) => {
        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) throw error;
        return { message: 'Announcement deleted' };
    },
};

// Documents (Supabase Storage)
export const documentAPI = {
    upload: async (formData) => {
        const currentUser = await getCurrentUserId();
        const file = formData.get('file');
        const doc_type = formData.get('doc_type');
        const student_id = formData.get('student_id');

        const fileKey = `${Date.now()}-${file.name}`;

        // 1. Upload to Supabase Storage 'documents' bucket
        const { error: storageError } = await supabase.storage
            .from('documents')
            .upload(fileKey, file);
        if (storageError) throw storageError;

        // 2. Insert record in 'documents' table
        const { error: dbError } = await supabase.from('documents').insert({
            student_id,
            doc_type,
            file_name: file.name,
            file_key: fileKey,
            uploaded_by: currentUser.id
        });
        if (dbError) throw dbError;

        return { message: 'Document uploaded' };
    },
    getByStudent: async (studentId) => {
        const { data, error } = await supabase.from('documents').select('*').eq('student_id', studentId);
        if (error) throw error;
        return { documents: data };
    },
    getMyDocuments: async () => {
        const { profile } = await studentAPI.getProfile();
        return documentAPI.getByStudent(profile.id);
    },
    delete: async (id) => {
        const { data, error } = await supabase.from('documents').select('file_key').eq('id', id).single();
        if (error) throw error;

        // Delete from storage
        await supabase.storage.from('documents').remove([data.file_key]);

        // Delete from DB
        await supabase.from('documents').delete().eq('id', id);
        return { message: 'Document deleted' };
    },
    download: async (id) => {
        const { data, error } = await supabase.from('documents').select('file_key').eq('id', id).single();
        if (error) throw new Error('File not found');

        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(data.file_key);
        return publicUrl;
    },
};

// Messages
export const messageAPI = {
    getChatList: async () => {
        return { chats: [] }; // Simplified for now
    },
    getHistory: async (userId) => {
        const currentUser = await getCurrentUserId();
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return { messages: data };
    },
    send: async (receiverId, content) => {
        const currentUser = await getCurrentUserId();
        const { error } = await supabase.from('messages').insert({
            sender_id: currentUser.id,
            receiver_id: receiverId,
            content
        });
        if (error) throw error;
        return { success: true };
    },
};
