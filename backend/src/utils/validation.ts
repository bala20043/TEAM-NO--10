// Input validation utilities

export function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validateRequired(obj: Record<string, any>, fields: string[]): string | null {
    for (const field of fields) {
        if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
            return `${field} is required`;
        }
    }
    return null;
}

export function sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '');
}

export function parseQueryParams(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    const searchParams = new URL(url).searchParams;
    searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}

export function extractPathParams(pattern: string, path: string): Record<string, string> | null {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) return null;

    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
            params[patternParts[i].slice(1)] = pathParts[i];
        } else if (patternParts[i] !== pathParts[i]) {
            return null;
        }
    }
    return params;
}
