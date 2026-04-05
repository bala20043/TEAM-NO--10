import { supabase } from '../lib/supabase';

// Helper to get current user session auth_id
const getCurrentUserId = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // 1. Try matching by auth UUID
    let { data: user, error } = await supabase
        .from('users')
        .select('id, role, department_id')
        .eq('auth_id', session.user.id)
        .maybeSingle();

    // 2. Fallback: Try matching by email and link it
    if (!user && !error) {
        console.log('API: Profile match failed, link by email fallback...', session.user.email);
        const { data: emailMatch } = await supabase
            .from('users')
            .select('id, role, department_id')
            .eq('email', session.user.email)
            .maybeSingle();

        if (emailMatch) {
            console.log('API: Linking user by email...');
            const { data: linked } = await supabase
                .from('users')
                .update({ auth_id: session.user.id })
                .eq('id', emailMatch.id)
                .select('id, role, department_id')
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

        // 3. New: Check Approval Status for Students
        const { data: profile } = await supabase
            .from('users')
            .select('id, role')
            .eq('auth_id', data.user.id)
            .single();

        if (profile?.role === 'student') {
            const { data: student } = await supabase
                .from('students')
                .select('status')
                .eq('user_id', profile.id)
                .single();
            
            if (student?.status === 'pending') {
                await supabase.auth.signOut();
                return { success: false, error: 'Your account is pending admin approval.' };
            }
        }

        return { success: true, data };
    },
    register: async (userData) => {
        // Since we implemented the 'on_auth_user_created' trigger in Supabase,
        // we only need to call signUp with the metadata. The trigger handles the rest.
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    name: userData.name,
                    role: 'student',
                    reg_no: userData.reg_no,
                    department_id: userData.department_id,
                    year: userData.year,
                    batch: userData.batch
                }
            }
        });
        
        if (error) return { success: false, error: error.message };
        return { success: true };
    },
    refreshToken: () => { /* Handled automatically by Supabase SDK */ },
};

// Admin
export const adminAPI = {
    getStats: async () => {
        const { data, error } = await supabase.rpc('get_admin_stats');
        if (error) throw error;
        return data;
    },
    createUser: async (userData) => {
        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
            });
            if (authError) throw authError;
            
            if (!authData?.user?.id) {
                throw new Error("Email may already be registered or invalid.");
            }

            const deptId = userData.department_id ? parseInt(userData.department_id, 10) : null;
            const assignedYear = userData.year ? parseInt(userData.year, 10) : null;

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
                    .update({ auth_id: authData.user.id, role: userData.role, department_id: deptId, year: assignedYear })
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
                        department_id: deptId,
                        year: assignedYear
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
        
        // Map the joined department name to the expected flat field
        const formatted = data.map(user => ({
            ...user,
            department_name: user.department?.name || null
        }));
        
        return { users: formatted };
    },
    deleteUser: async (id) => {
        const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: id });
        if (error) {
            console.error('Delete User Error:', error);
            throw new Error(error.message || 'Failed to delete user');
        }
        return { message: 'User deleted successfully' };
    },
    resetPassword: async (data, newPassword) => {
        const { data: res, error } = await supabase.rpc('admin_reset_password', { 
            target_email: data.email, 
            new_password: newPassword 
        });
        
        if (error) throw error;
        if (res.error) return { error: res.error };
        return { message: res.message };
    },
    getPendingStudents: async () => {
        const { data, error } = await supabase
            .from('students')
            .select(`
                *,
                users!inner(name, email),
                departments(name)
            `)
            .eq('status', 'pending');
        
        if (error) throw error;
        
        const formatted = data.map(s => ({
            ...s,
            name: s.users.name,
            email: s.users.email,
            department_name: s.departments?.name
        }));
        
        return { students: formatted };
    },
    approveStudent: async (id) => { 
        const { error } = await supabase.from('students').update({ status: 'active' }).eq('id', id);
        if (error) throw error;
        return { message: 'Approved' }; 
    },
    rejectStudent: async (id) => adminAPI.deleteStudent(id),
    deleteStudent: async (id) => { 
        // Get user_id first
        const { data, error: fetchErr } = await supabase.from('students').select('user_id').eq('id', id).single();
        if (fetchErr) throw fetchErr;

        if (data?.user_id) {
            const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: data.user_id });
            if (error) {
                console.error('Delete Student Error:', error);
                throw new Error(error.message || 'Failed to delete student');
            }
        } else {
            // Fallback for students without user profile
            const { error: delErr } = await supabase.from('students').delete().eq('id', id);
            if (delErr) throw delErr;
        }

        return { message: 'Deleted' }; 
    },
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
        return { profile: { ...data, name: data.users?.name, email: data.users?.email, department_name: data.departments?.name } };
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
        const { data, error } = await supabase.rpc('get_staff_stats');
        if (error) throw error;
        return data;
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
    getByDept: async (deptId, date, year) => {
        // Complex query: get students in dept, then their attendance for date
        let query = supabase
            .from('students')
            .select('id')
            .eq('department_id', deptId);
        
        if (year) query = query.eq('year', year);

        const { data: students, error: studentError } = await query;
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
    getDeptAttendance: async (deptId, date, year) => attendanceAPI.getByDept(deptId, date, year),
    getMyAttendance: async () => {
        const { profile } = await studentAPI.getProfile();
        const { data: records, error } = await supabase.from('attendance').select('*').eq('student_id', profile.id);
        if (error) throw error;
        
        const total = records.length;
        const present = records.filter(d => d.status === 'present').length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return { 
            attendance: records, 
            stats: { 
                percentage, 
                totalDays: total, 
                presentDays: present, 
                absentDays: total - present 
            } 
        };
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
        const { data: marks, error } = await supabase.from('marks').select('*').eq('student_id', profile.id);
        if (error) throw error;
        return { marks };
    },
    getDeptMarks: async (deptId, year) => {
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
        
        const deptId = p.get('department_id') || p.get('deptId');
        if (deptId) query = query.eq('department_id', deptId);
        
        if (p.get('year')) query = query.eq('year', p.get('year'));
        if (p.get('semester')) query = query.eq('semester', p.get('semester'));
        
        const { data, error } = await query;
        if (error) throw error;
        return { subjects: data };
    },
    syncSubjects: async (data) => {
        const department_id = data.department_id || data.deptId;
        const { year, semester, subjects } = data;

        if (!department_id) throw new Error('Department ID is required');

        // 1. Transform string array into objects
        const formattedSubjects = subjects.map(name => ({
            name,
            department_id,
            year,
            semester,
            code: `${department_id}-${semester}-${name.toLowerCase().replace(/\s+/g, '-')}`.substring(0, 50)
        }));

        // 2. Perform synchronization
        // First, get currently stored subjects for this slot to handle deletions
        const { data: existing } = await supabase
            .from('subjects')
            .select('name')
            .eq('department_id', department_id)
            .eq('year', year)
            .eq('semester', semester);

        const existingNames = existing?.map(s => s.name) || [];
        const toDelete = existingNames.filter(name => !subjects.includes(name));

        if (toDelete.length > 0) {
            await supabase
                .from('subjects')
                .delete()
                .eq('department_id', department_id)
                .eq('year', year)
                .eq('semester', semester)
                .in('name', toDelete);
        }

        // 3. Upsert the new list
        if (formattedSubjects.length > 0) {
            const { error } = await supabase.from('subjects').upsert(formattedSubjects, { onConflict: 'code,department_id' });
            if (error) throw error;
        }

        return { message: 'Subjects synced successfully' };
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
        const currentUser = await getCurrentUserId();
        console.log('[ChatList] Current user:', currentUser.id, currentUser.role, 'dept:', currentUser.department_id);
        
        // 1. Fetch History Participants (Who we've messaged)
        const { data: sentMsgs, error: sentErr } = await supabase.from('messages').select('receiver_id').eq('sender_id', currentUser.id);
        const { data: recvMsgs, error: recvErr } = await supabase.from('messages').select('sender_id').eq('receiver_id', currentUser.id);
        console.log('[ChatList] Sent msgs:', sentMsgs?.length, sentErr?.message || 'OK');
        console.log('[ChatList] Recv msgs:', recvMsgs?.length, recvErr?.message || 'OK');
        
        const historyIds = Array.from(new Set([
            ...(sentMsgs?.map(m => m.receiver_id) || []),
            ...(recvMsgs?.map(m => m.sender_id) || [])
        ]));
        console.log('[ChatList] History IDs:', historyIds);

        let contacts = [];

        // 2. Fetch History User Details
        if (historyIds.length > 0) {
            const { data: historyUsers } = await supabase
                .from('users')
                .select('id, name, email, role, department_id')
                .in('id', historyIds);
            console.log('[ChatList] History users found:', historyUsers?.length);
            if (historyUsers) contacts = [...historyUsers];
        }

        // 3. Discovery Logic (Role-Based)
        if (currentUser.role === 'student') {
            const { data: studentData, error: studErr } = await supabase
                .from('students')
                .select('department_id')
                .eq('user_id', currentUser.id)
                .single();
            console.log('[ChatList] Student dept_id:', studentData?.department_id, studErr?.message || 'OK');

            // All staff in same dept
            const { data: deptStaff, error: staffErr } = await supabase
                .from('users')
                .select('id, name, email, role')
                .in('role', ['staff', 'hod'])
                .eq('department_id', studentData?.department_id);
            console.log('[ChatList] Dept staff found:', deptStaff?.length, staffErr?.message || 'OK');
            
            // ALL Principals
            const { data: principals } = await supabase
                .from('users')
                .select('id, name, email, role')
                .eq('role', 'principal');
            console.log('[ChatList] Principals found:', principals?.length);
            
            if (deptStaff) contacts = [...contacts, ...deptStaff];
            if (principals) contacts = [...contacts, ...principals];
        } else if (currentUser.role === 'staff') {
            const { data: students } = await supabase
                .from('students')
                .select('user_id, reg_no, users!inner(name, email)')
                .eq('department_id', currentUser.department_id)
                .eq('status', 'active');
            
            if (students) {
                contacts = [...contacts, ...students.map(s => ({
                    id: s.user_id,
                    name: s.users.name,
                    email: s.users.email,
                    reg_no: s.reg_no,
                    role: 'student'
                }))];
            }
        } else if (currentUser.role === 'hod') {
            const { data: staff } = await supabase
                .from('users')
                .select('id, name, email, role')
                .eq('role', 'staff')
                .eq('department_id', currentUser.department_id);
            if (staff) contacts = [...contacts, ...staff];
        } else if (currentUser.role === 'principal') {
            const { data: hods } = await supabase
                .from('users')
                .select('id, name, email, role')
                .eq('role', 'hod');
            if (hods) contacts = [...contacts, ...hods];
        }

        // 4. Map & Deduplicate
        const uniqueContacts = Array.from(new Map(contacts.map(c => [c.id, c])).values());
        console.log('[ChatList] FINAL contacts:', uniqueContacts.length, uniqueContacts.map(c => c.name));
        return { contacts: uniqueContacts.map(c => ({ ...c, unreadCount: 0 })) };
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
