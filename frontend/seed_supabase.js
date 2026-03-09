import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const demoAccounts = [
    { name: 'System Admin', role: 'admin', email: 'admin@college.edu', password: 'admin123' },
    { name: 'College Principal', role: 'principal', email: 'principal@college.edu', password: 'password123' },
    { name: 'Head of Department', role: 'hod', email: 'hod@college.edu', password: 'password123' },
    { name: 'Senior Staff', role: 'staff', email: 'staff@college.edu', password: 'password123' },
    { name: 'Demo Student', role: 'student', email: 'student@college.edu', password: 'password123', reg: 'CS2023001', year: 2, batch: '2023-2027' },
];

async function seed() {
    console.log("🌱 Starting Supabase Seeding Process...");

    // 1. Create Default Department
    let deptId = null;
    console.log("Checking for Computer Science department...");
    const { data: existingDept } = await supabase.from('departments').select('id').eq('unique_code', 'CS').single();

    if (existingDept) {
        deptId = existingDept.id;
        console.log("Department already exists:", deptId);
    } else {
        const { data: newDept, error } = await supabase
            .from('departments')
            .insert({ name: 'Computer Science', unique_code: 'CS' })
            .select('id')
            .single();
        if (error) {
            console.error("Failed to create department:", error);
            return;
        }
        deptId = newDept.id;
        console.log("Created Department CS with ID:", deptId);
    }

    // 2. Create Users
    for (const acc of demoAccounts) {
        console.log(`\nProcessing ${acc.email} (${acc.role})...`);

        // 2a. Check if already exists in auth
        const { data: authAttempt, error: authError } = await supabase.auth.signUp({
            email: acc.email,
            password: acc.password,
        });

        if (authError && authError.message !== 'User already registered') {
            console.error(`Failed to create Auth for ${acc.email}:`, authError);
            continue;
        }

        // We need the auth ID. If it said already registered, we try to log in to get the ID
        let authId = authAttempt?.user?.id;
        if (!authId) {
            const { data: loginAttempt } = await supabase.auth.signInWithPassword({
                email: acc.email,
                password: acc.password
            });
            authId = loginAttempt?.user?.id;
        }

        if (!authId) {
            console.error(`Could not retrieve UUID for ${acc.email}`);
            continue;
        }

        // 2b. Create Profile
        const { data: profileCheck } = await supabase.from('users').select('id').eq('email', acc.email).single();
        let profileId = profileCheck?.id;

        if (!profileId) {
            const { data: newProfile, error: profileCreateError } = await supabase
                .from('users')
                .insert({
                    auth_id: authId,
                    name: acc.name,
                    email: acc.email,
                    role: acc.role,
                    department_id: deptId
                })
                .select('id')
                .single();
            if (profileCreateError) {
                console.error(`Failed to create profile for ${acc.email}:`, profileCreateError);
                continue;
            }
            profileId = newProfile.id;
            console.log(`Created profile for ${acc.email}`);
        } else {
            console.log(`Profile already exists for ${acc.email}`);
        }

        // 2c. If student, create student record
        if (acc.role === 'student') {
            const { data: studentCheck } = await supabase.from('students').select('id').eq('user_id', profileId).single();
            if (!studentCheck) {
                const { error: studentCreateError } = await supabase
                    .from('students')
                    .insert({
                        user_id: profileId,
                        reg_no: acc.reg,
                        department_id: deptId,
                        year: acc.year,
                        batch: acc.batch
                    });
                if (studentCreateError) {
                    console.error(`Failed to create student record for ${acc.email}:`, studentCreateError);
                } else {
                    console.log(`Created student record for ${acc.email}`);
                }
            }
        }
    }

    console.log("\n✅ Seeding Complete!");
}

seed();
