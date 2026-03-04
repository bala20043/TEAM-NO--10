// Auth route handlers
import { Env, User } from '../types';
import { signJWT } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/hash';
import { validateEmail, validateRequired, sanitizeString } from '../utils/validation';

export async function handleLogin(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json() as { email: string; password: string };
        const error = validateRequired(body, ['email', 'password']);
        if (error) return json({ error }, 400);

        if (!validateEmail(body.email)) {
            return json({ error: 'Invalid email format' }, 400);
        }

        const user = await env.DB.prepare(
            'SELECT * FROM users WHERE email = ?'
        ).bind(body.email.toLowerCase().trim()).first<User>();

        if (!user) {
            return json({ error: 'Invalid email or password' }, 401);
        }

        const validPassword = await verifyPassword(body.password, user.password_hash);

        if (!validPassword) {
            return json({ error: 'Invalid email or password' }, 401);
        }

        // Generate access token (1 hour)
        const accessToken = await signJWT(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department_id: user.department_id,
            },
            env.JWT_SECRET,
            3600
        );

        // Generate refresh token (7 days)
        const refreshToken = await signJWT(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department_id: user.department_id,
            },
            env.JWT_SECRET,
            604800
        );

        return json({
            token: accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department_id: user.department_id,
            },
        });
    } catch (err) {
        return json({ error: 'Login failed' }, 500);
    }
}

export async function handleRefreshToken(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json() as { refreshToken: string };
        if (!body.refreshToken) return json({ error: 'Refresh token required' }, 400);

        const { verifyJWT } = await import('../utils/jwt');
        const payload = await verifyJWT(body.refreshToken, env.JWT_SECRET);
        if (!payload) return json({ error: 'Invalid or expired refresh token' }, 401);

        const newToken = await signJWT(
            {
                id: payload.id,
                name: payload.name,
                email: payload.email,
                role: payload.role,
                department_id: payload.department_id,
            },
            env.JWT_SECRET,
            3600
        );

        return json({ token: newToken });
    } catch {
        return json({ error: 'Token refresh failed' }, 500);
    }
}

// First-time setup endpoint: creates admin user if none exists
export async function handleSetup(request: Request, env: Env): Promise<Response> {
    try {
        const existing = await env.DB.prepare(
            "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
        ).first();

        if (existing) {
            return json({ error: 'Admin already exists. Use login instead.' }, 400);
        }

        const body = await request.json() as { name: string; email: string; password: string };
        const error = validateRequired(body, ['name', 'email', 'password']);
        if (error) return json({ error }, 400);

        if (body.password.length < 6) {
            return json({ error: 'Password must be at least 6 characters' }, 400);
        }

        const passwordHash = await hashPassword(body.password);

        const name = sanitizeString(body.name);
        const email = body.email.toLowerCase().trim();
        const role = 'admin';

        console.log('Binding types:', {
            name: typeof name,
            email: typeof email,
            passwordHash: typeof passwordHash,
            role: typeof role
        });

        await env.DB.prepare(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
        ).bind(String(name), String(email), String(passwordHash), String(role)).run();

        return json({ message: 'Admin account created successfully. You can now login.' });
    } catch (err: any) {
        if (err.message?.includes('UNIQUE')) {
            return json({ error: 'Email already exists' }, 400);
        }
        return json({ error: 'Setup failed' }, 500);
    }
}

function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
