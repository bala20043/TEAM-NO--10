import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vrrdaqcmhtntsuzppysg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmRhcWNtaHRudHN1enBweXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjYyODgsImV4cCI6MjA4ODYwMjI4OH0.rXzCBMwcSVpeqRBiJTUEzzAeYqaH9f-B1fkPJo64n3I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('--- SCHEMA CHECK ---');
    const { data, error } = await supabase.rpc('get_table_schema', { t_name: 'subjects' }); // Try RPC if it exists
    if (error) {
        console.log('RPC Error:', error.message);
        // Fallback to direct query
        const { data: cols, error: colError } = await supabase.from('subjects').select('*').limit(1);
        if (colError) {
            console.log('Select Error:', colError.message);
        } else {
            console.log('Sample Row:', JSON.stringify(cols[0], null, 2));
        }
    } else {
        console.log('Schema:', JSON.stringify(data, null, 2));
    }
}

check();
旋
