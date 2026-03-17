import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://vrrdaqcmhtntsuzppysg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmRhcWNtaHRudHN1enBweXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjYyODgsImV4cCI6MjA4ODYwMjI4OH0.rXzCBMwcSVpeqRBiJTUEzzAeYqaH9f-B1fkPJo64n3I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { data, error } = await supabase.from('subjects').select('*').limit(1);
    console.log('Sample subject:', data);
    console.log('Error:', error);
}

check();
旋
