import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vrrdaqcmhtntsuzppysg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmRhcWNtaHRudHN1enBweXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjYyODgsImV4cCI6MjA4ODYwMjI4OH0.rXzCBMwcSVpeqRBiJTUEzzAeYqaH9f-B1fkPJo64n3I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('--- Database Check for Students ---');

    // 1. Fetch all students
    const { data: students, error } = await supabase
        .from('students')
        .select('*, users!inner(name, email)');

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Total Students in DB: ${students.length}`);
        students.forEach(s => {
            console.log(`- ${s.users.name} (${s.users.email}) | Status: ${s.status} | Dept: ${s.department_id}`);
        });
    }

    // 2. Fetch all users
    const { data: users, error: uErr } = await supabase.from('users').select('*');
    console.log(`Total Users in DB: ${users?.length || 0}`);
}

check();
