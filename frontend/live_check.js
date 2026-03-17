import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://vrrdaqcmhtntsuzppysg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmRhcWNtaHRudHN1enBweXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjYyODgsImV4cCI6MjA4ODYwMjI4OH0.rXzCBMwcSVpeqRBiJTUEzzAeYqaH9f-B1fkPJo64n3I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    let output = '--- LIVE DATABASE CHECK ---\n';

    // 1. Check Student bala status
    const { data: students } = await supabase.from('students').select('*, users!inner(name, email)');
    const bala = students?.find(s => s.users.name.toLowerCase().includes('bala'));
    
    if (bala) {
        output += `STUDENT BALA: status is "${bala.status}"\n`;
    } else {
        output += 'STUDENT BALA NOT FOUND\n';
    }

    // 2. Try fetching as a simulated staff query (no role-base auth can be done here but we check raw tables)
    const { data: activeStudents } = await supabase.from('students').select('id').eq('status', 'active');
    output += `TOTAL ACTIVE STUDENTS IN DB: ${activeStudents?.length || 0}\n`;

    fs.writeFileSync('diag_result.txt', output);
    console.log('Result written to diag_result.txt');
}

check();
