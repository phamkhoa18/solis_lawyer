import { SignJWT, jwtVerify } from 'jose';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Thiếu JWT_SECRET trong .env.local — từ chối khởi động để tránh giả mạo token');
  return new TextEncoder().encode(secret);
}
let JWT_SECRET_CACHE: Uint8Array | null = null;
const JWT_SECRET = () => {
  if (!JWT_SECRET_CACHE) JWT_SECRET_CACHE = getJwtSecret();
  return JWT_SECRET_CACHE;
};

const JWT_EXPIRATION = '2d'; // 2 days

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Sign a JWT token
 */
export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET());
}

/**
 * Verify and decode a JWT token
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}



// Cookie name for JWT token
export const AUTH_COOKIE_NAME = 'admin_token';

// Cookie options
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 2 * 24 * 60 * 60, // 2 days in seconds
};
