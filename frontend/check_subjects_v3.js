import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vrrdaqcmhtntsuzppysg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmRhcWNtaHRudHN1enBweXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjYyODgsImV4cCI6MjA4ODYwMjI4OH0.rXzCBMwcSVpeqRBiJTUEzzAeYqaH9f-B1fkPJo64n3I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('--- GET SUBJECTS CHECK ---');
    const { data, error } = await supabase.from('subjects').select('*');
    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Results count:', data.length);
        if (data.length > 0) {
            console.log('First subject:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('Table is empty.');
        }
    }
}

check();
旋
