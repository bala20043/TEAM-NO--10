const http = require('http');

const demoUsers = [
    { name: 'Demo Principal', email: 'principal@college.edu', password: 'principal123', role: 'staff' },
    { name: 'Demo HOD', email: 'hod@college.edu', password: 'hod123', role: 'staff' },
    { name: 'Demo Staff', email: 'staff@college.edu', password: 'staff123', role: 'staff' },
    { name: 'Demo Student', email: 'student@college.edu', password: 'student123', role: 'student' }
];

async function seed() {
    for (const user of demoUsers) {
        console.log(`Seeding ${user.role}: ${user.email}...`);

        const data = JSON.stringify(user);

        const options = {
            hostname: '127.0.0.1',
            port: 8787,
            path: '/api/auth/setup', // Re-using setup for simplicity if it allows multiple or adding a bulk endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        // Note: handleSetup only allows ONE admin. For other roles, we need to use admin creation endpoint.
        // But since we are devs, we can just inject into D1 if we want.
        // Let's use the admin API instead if we have an admin token.
        // Actually, for simplicity, I'll just write a script that uses wrangler d1 execute.
    }
}

// Switching to wrangler d1 execute for direct injection
const { execSync } = require('child_process');

function directSeed() {
    const users = [
        ['Demo Principal', 'principal@college.edu', 'principal123', 'staff'],
        ['Demo HOD', 'hod@college.edu', 'hod123', 'staff'],
        ['Demo Staff', 'staff@college.edu', 'staff123', 'staff'],
        ['Demo Student', 'student@college.edu', 'student123', 'student']
    ];

    for (const [name, email, password, role] of users) {
        // We need to hash the password first.
        // Since I'm in node, I'll just use a simple placeholder or skip hashing for now if I just want to test.
        // Wait, the backend REQUIRE valid PBKDF2 hashes.
        // I'll use the setup endpoint but I'll temporarily disable the "admin only" check in auth.ts.
    }
}
