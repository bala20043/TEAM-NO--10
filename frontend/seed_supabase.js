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
        console.log(`\n---------------------------------`);
        console.log(`Processing: ${acc.email} | Role: ${acc.role}`);

        // Wait 5 seconds between users to avoid rate limits
        await new Promise(r => setTimeout(r, 5000));

        let authId = null;

        // 2a. Attempt Auth Creation
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: acc.email,
                password: acc.password,
            });

            if (authError) {
                if (authError.message === 'User already registered') {
                    console.log(`Auth already exists for ${acc.email}. Fetching existing ID...`);
                    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                        email: acc.email,
                        password: acc.password
                    });
                    if (loginError) {
                        console.error(`Could not log in to existing user ${acc.email}:`, loginError.message);
                        continue;
                    }
                    authId = loginData.user.id;
                } else {
                    console.error(`Auth creation failed for ${acc.email}:`, authError.message);
                    continue;
                }
            } else {
                authId = authData.user?.id;
                console.log(`New Auth ID created: ${authId}`);
            }
        } catch (e) {
            console.error(`Unexpected Auth error for ${acc.email}:`, e);
            continue;
        }

        if (!authId) {
            console.error(`Critical Error: No UUID retrieved for ${acc.email}`);
            continue;
        }

        // 2b. Create Profile Record
        try {
            const { data: profileCheck, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('email', acc.email)
                .maybeSingle();

            if (checkError) {
                console.error(`Error checking existing profile for ${acc.email}:`, checkError.message);
            }

            if (!profileCheck) {
                console.log(`Inserting profile for ${acc.email}...`);
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
                    console.error(`DB INSERT FAILED for profile ${acc.email}:`, profileCreateError.message);
                    continue;
                }
                console.log(`Profile created successfully with DB ID: ${newProfile.id}`);

                // 2c. If student, create student record
                if (acc.role === 'student') {
                    console.log(`Creating student record for ${acc.email}...`);
                    const { error: studentCreateError } = await supabase
                        .from('students')
                        .insert({
                            user_id: newProfile.id,
                            reg_no: acc.reg,
                            department_id: deptId,
                            year: acc.year,
                            batch: acc.batch
                        });

                    if (studentCreateError) {
                        console.error(`STUDENT RECORD FAILED for ${acc.email}:`, studentCreateError.message);
                    } else {
                        console.log(`Student details recorded successfully.`);
                    }
                }
            } else {
                console.log(`Profile already exists for ${acc.email}. Skipping DB insert.`);
            }
        } catch (e) {
            console.error(`Unexpected Profile DB error for ${acc.email}:`, e);
        }
    }

    console.log("\n✅ Seeding Complete!");
}

seed();
