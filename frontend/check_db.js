import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vrrdaqcmhtntsuzppysg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmRhcWNtaHRudHN1enBweXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjYyODgsImV4cCI6MjA4ODYwMjI4OH0.rXzCBMwcSVpeqRBiJTUEzzAeYqaH9f-B1fkPJo64n3I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    console.log('--- Database Check ---');

    // 1. Check Departments
    const { data: depts, error: deptErr } = await supabase.from('departments').select('id, name');
    if (deptErr) console.error('Dept Error:', deptErr.message);
    else {
        console.log('Departments:', depts.length);
        depts.forEach(d => console.log(` - [${d.id}] ${d.name}`));
    }

    // 2. Check Users
    const { data: users, error: userErr } = await supabase.from('users').select('id, name, email, role');
    if (userErr) console.error('Users Error:', userErr.message);
    else {
        console.log('Users:', users.length);
        users.forEach(u => console.log(` - ${u.name} (${u.email}) - Role: ${u.role}`));
    }

    // 3. Check Students
    const { data: students, error: studentErr } = await supabase.from('students').select('*');
    if (studentErr) console.error('Students Error:', studentErr.message);
    else console.log('Students:', students.length);

    // 4. Test Insert (if we have a user and dept)
    if (users && users.length > 0 && depts && depts.length > 0) {
        const studentUser = users.find(u => u.role === 'student');
        if (studentUser) {
            console.log(`\nAttempting manual student insert for ${studentUser.email}...`);
            const { error: insErr } = await supabase.from('students').insert({
                user_id: studentUser.id,
                reg_no: 'TEST_REG_123',
                department_id: depts[0].id,
                year: 1,
                batch: '2024-2028',
                status: 'pending'
            });
            console.log('Insert Result Error:', insErr || 'SUCCESS');
        }
    }
}

run();
