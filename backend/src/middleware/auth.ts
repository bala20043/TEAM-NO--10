// Authentication middleware - extracts and verifies JWT from Authorization header
import { Env, JWTPayload } from '../types';
import { verifyJWT } from '../utils/jwt';

export async function authenticate(
    request: Request,
    env: Env
): Promise<JWTPayload | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.slice(7);
    return verifyJWT(token, env.JWT_SECRET);
}

// Role-based access control
export function requireRole(...roles: string[]) {
    return (user: JWTPayload | null): boolean => {
        if (!user) return false;
        return roles.includes(user.role);
    };
}
