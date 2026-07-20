import bcrypt from 'bcryptjs';

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a password with a hash. Also handles legacy plaintext passwords.
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  // Check if password is bcrypt hashed (starts with $2a$ or $2b$)
  if (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')) {
    return bcrypt.compare(password, hashedPassword);
  }
  // Legacy plaintext comparison (backward compatible)
  return password === hashedPassword;
}

/**
 * Check if a password is already hashed
 */
export function isPasswordHashed(password: string): boolean {
  return password.startsWith('$2a$') || password.startsWith('$2b$');
}
