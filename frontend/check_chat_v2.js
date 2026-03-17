import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://vrrdaqcmhtntsuzppysg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmRhcWNtaHRudHN1enBweXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjYyODgsImV4cCI6MjA4ODYwMjI4OH0.rXzCBMwcSVpeqRBiJTUEzzAeYqaH9f-B1fkPJo64n3I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    let output = '--- CHAT VISIBILITY DIAGNOSTIC ---\n';

    // 1. Check Student bala
    const { data: students } = await supabase.from('students').select('*, users!inner(name, email)');
    const bala = students?.find(s => s.users.name.toLowerCase().includes('bala'));
    
    if (bala) {
        output += `STUDENT BALA Found:\n`;
        output += `- Status: ${bala.status}\n`;
        output += `- Dept ID: ${bala.department_id}\n`;
        output += `- User ID: ${bala.user_id}\n`;
    } else {
        output += 'STUDENT BALA NOT FOUND\n';
    }

    // 2. Check Staff ravi
    const { data: ravi } = await supabase.from('users').select('*').eq('name', 'ravi').maybeSingle();
    if (ravi) {
        output += `STAFF RAVI Found:\n`;
        output += `- Role: ${ravi.role}\n`;
        output += `- Dept ID: ${ravi.department_id}\n`;
    } else {
        output += 'STAFF RAVI NOT FOUND\n';
    }

    // 3. Try to simulate Staff Chat Fetching logic
    if (ravi) {
        const { data: chatData, error: chatErr } = await supabase
            .from('students')
            .select('user_id, reg_no, users!inner(name, email)')
            .eq('department_id', ravi.department_id)
            .eq('status', 'active');
        
        output += `SIMULATED STAFF CHAT (Active Students in Dept ${ravi.department_id}): ${chatData?.length || 0} students found.\n`;
        if (chatErr) output += `ERROR: ${chatErr.message}\n`;
    }

    // 4. Try to simulate Student Chat Fetching logic
    if (bala) {
        const { data: staffData, error: staffErr } = await supabase
            .from('users')
            .select('id, name, email, role')
            .in('role', ['staff', 'hod', 'principal'])
            .eq('department_id', bala.department_id);
        
        output += `SIMULATED STUDENT CHAT (Staff in Dept ${bala.department_id}): ${staffData?.length || 0} staff found.\n`;
        if (staffErr) output += `ERROR: ${staffErr.message}\n`;
    }

    fs.writeFileSync('diag_chat.txt', output);
    console.log('Diagnostic finished. See diag_chat.txt');
}

check();
