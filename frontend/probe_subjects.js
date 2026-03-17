import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vrrdaqcmhtntsuzppysg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmRhcWNtaHRudHN1enBweXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjYyODgsImV4cCI6MjA4ODYwMjI4OH0.rXzCBMwcSVpeqRBiJTUEzzAeYqaH9f-B1fkPJo64n3I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function probe() {
    console.log('--- PROBING SUBJECTS ---');
    const { error } = await supabase.from('subjects').insert([
        { name: 'Probe Subject', department_id: 1, year: 1, semester: 1 }
    ]);
    if (error) {
        console.log('Insertion Error:', error.message);
        console.log('Error Details:', JSON.stringify(error, null, 2));
    } else {
        console.log('Insertion Success! (Metadata provided)');
    }
}

probe();
旋
