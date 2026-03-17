import { supabase } from './frontend/src/lib/supabase.js';

async function checkPending() {
    console.log('--- Checking Students Table ---');
    const { data, error } = await supabase
        .from('students')
        .select('id, status, user_id, reg_no');
    
    if (error) {
        console.error('Error fetching students:', error);
        return;
    }

    console.log(`Total students in DB: ${data.length}`);
    const pendingCount = data.filter(s => s.status === 'pending').length;
    console.log(`Students with status "pending": ${pendingCount}`);
    
    if (pendingCount > 0) {
        console.log('Sample pending student:', data.find(s => s.status === 'pending'));
    } else {
        console.log('All statuses found:', [...new Set(data.map(s => s.status))]);
    }
}

checkPending();
