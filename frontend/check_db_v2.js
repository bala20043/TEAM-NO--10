import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vrrdaqcmhtntsuzppysg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmRhcWNtaHRudHN1enBweXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjYyODgsImV4cCI6MjA4ODYwMjI4OH0.rXzCBMwcSVpeqRBiJTUEzzAeYqaH9f-B1fkPJo64n3I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { count: userCount, error: ue } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: studentCount, error: se } = await supabase.from('students').select('*', { count: 'exact', head: true });
    
    console.log('--- DB Check ---');
    console.log('Users Count:', userCount, ue || '');
    if (userCount > 0) {
        const { data: users } = await supabase.from('users').select('name, email, role');
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));
    }
    
    console.log('Students Count:', studentCount, se || '');
    if (studentCount > 0) {
        const { data: students } = await supabase.from('students').select('reg_no, status');
        students.forEach(s => console.log(`- ${s.reg_no} [${s.status}]`));
    }
}

check();
