// Password hashing using PBKDF2 via Web Crypto API (Cloudflare Workers compatible)

const ITERATIONS = 100000;
const HASH_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16; // 128 bits

function arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes.buffer;
}

export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        HASH_LENGTH * 8
    );

    const saltHex = arrayBufferToHex(salt.buffer);
    const hashHex = arrayBufferToHex(derivedBits);

    // Store as: iterations$salt$hash
    return `${ITERATIONS}$${saltHex}$${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
        const [iterStr, saltHex, expectedHashHex] = storedHash.split('$');
        const iterations = parseInt(iterStr);
        const salt = new Uint8Array(hexToArrayBuffer(saltHex));
        const encoder = new TextEncoder();

        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits']
        );

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: iterations,
                hash: 'SHA-256',
            },
            keyMaterial,
            HASH_LENGTH * 8
        );

        const actualHashHex = arrayBufferToHex(derivedBits);
        return actualHashHex === expectedHashHex;
    } catch {
        return false;
    }
}
