import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vrrdaqcmhtntsuzppysg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmRhcWNtaHRudHN1enBweXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjYyODgsImV4cCI6MjA4ODYwMjI4OH0.rXzCBMwcSVpeqRBiJTUEzzAeYqaH9f-B1fkPJo64n3I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    // We can't easily check schema via API, but we can try to fetch one user and check the typeof ID
    const { data: users, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
        console.error('Error fetching user:', error.message);
    } else if (users.length > 0) {
        console.log('User ID Type:', typeof users[0].id, 'Value:', users[0].id);
    } else {
        console.log('No users found to check type.');
    }

    const { data: students, error: sErr } = await supabase.from('students').select('id, user_id').limit(1);
    if (sErr) {
        console.error('Error fetching student:', sErr.message);
    } else if (students.length > 0) {
        console.log('Student ID Type:', typeof students[0].id, 'Value:', students[0].id);
        console.log('Student UserID Type:', typeof students[0].user_id, 'Value:', students[0].user_id);
    }
}

check();
