import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://vrrdaqcmhtntsuzppysg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmRhcWNtaHRudHN1enBweXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjYyODgsImV4cCI6MjA4ODYwMjI4OH0.rXzCBMwcSVpeqRBiJTUEzzAeYqaH9f-B1fkPJo64n3I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    let output = '--- TARGETED DIAGNOSTIC ---\n';

    // 1. Staff check
    const { data: staff } = await supabase.from('users').select('*').eq('name', 'ravi').single();
    if (staff) {
        output += 'STAFF RAVI:\n';
        output += `- ID: ${staff.id}\n`;
        output += `- Role: ${staff.role}\n`;
        output += `- Dept ID: ${staff.department_id}\n`;
        output += `- Year: ${staff.year}\n`;
    } else {
        output += 'STAFF RAVI NOT FOUND\n';
    }

    // 2. Student check
    const { data: students } = await supabase.from('students').select('*, users!inner(name)');
    const student = students?.find(s => s.users.name.toLowerCase().includes('bala'));
    
    if (student) {
        output += 'STUDENT BALA (or similar):\n';
        output += `- Name: ${student.users.name}\n`;
        output += `- ID: ${student.id}\n`;
        output += `- Status: ${student.status}\n`;
        output += `- Dept ID: ${student.department_id}\n`;
        output += `- Year: ${student.year}\n`;
    } else {
        output += 'STUDENT BALA NOT FOUND\n';
        output += `OTHER STUDENTS: ${JSON.stringify(students?.map(s => `${s.users.name} (Dept:${s.department_id}, Year:${s.year}, Status:${s.status})`))}\n`;
    }

    // 3. Departments
    const { data: depts } = await supabase.from('departments').select('*');
    output += `DEPARTMENTS: ${JSON.stringify(depts?.map(d => `${d.id}: ${d.name}`))}\n`;

    fs.writeFileSync('diag_output.txt', output);
    console.log('Diagnostic finished. See diag_output.txt');
}

check();
