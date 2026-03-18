import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAdmin() {
    console.log('--- Debugging Admin User ---');
    
    // 1. Check users table
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin');
    
    if (error) {
        console.error('Error fetching admin users:', error);
    } else {
        console.log('Admin users found:', users.length);
        users.forEach(u => {
            console.log(`- ID: ${u.id}, Email: ${u.email}, AuthID: ${u.auth_id}`);
        });
    }
    
    // 2. Check principal role as well (often has admin-like access)
    const { data: principals } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'principal');
    
    console.log('Principal users found:', principals?.length || 0);

    // 3. Try to check specific admin email
    const { data: specificAdmin } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@college.edu')
        .maybeSingle();
    
    if (specificAdmin) {
        console.log('Specific admin account (admin@college.edu) exists:', !!specificAdmin);
        console.log(`- AuthID: ${specificAdmin.auth_id}`);
    } else {
        console.log('Specific admin account (admin@college.edu) does NOT exist.');
    }
}

checkAdmin();
