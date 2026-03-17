import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vrrdaqcmhtntsuzppysg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmRhcWNtaHRudHN1enBweXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjYyODgsImV4cCI6MjA4ODYwMjI4OH0.rXzCBMwcSVpeqRBiJTUEzzAeYqaH9f-B1fkPJo64n3I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('--- Chat Visibility Diagnostic ---');

    // 1. Find Staff ravi
    const { data: staff, error: staffErr } = await supabase.from('users').select('*').eq('name', 'ravi').single();
    if (staffErr) {
        console.error('Error finding staff ravi:', staffErr.message);
        return;
    }
    console.log('Staff Ravi Profile:', { id: staff.id, role: staff.role, dept_id: staff.department_id, year: staff.year });

    // 2. Check Students in same department
    const { data: students, error: studentErr } = await supabase
        .from('students')
        .select('*, users!inner(name)')
        .eq('department_id', staff.department_id)
        .eq('status', 'active');

    if (studentErr) {
        console.error('Error fetching students:', studentErr.message);
    } else {
        console.log(`Found ${students.length} active students in Dept ${staff.department_id}:`);
        students.forEach(s => {
            console.log(`- ${s.users.name} (Year ${s.year}, Reg: ${s.reg_no})`);
        });
    }

    // 3. Check if any students exist at all
    const { count: totalStudents } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active');
    console.log('Total Active Students in DB:', totalStudents);
}

check();
