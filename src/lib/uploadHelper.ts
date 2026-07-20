import path from 'path';
import { randomBytes } from 'crypto';

// Allowed image MIME types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate an uploaded file
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Không có file để upload' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WebP, SVG)' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File quá lớn (tối đa ${MAX_FILE_SIZE / 1024 / 1024}MB)` };
  }

  return { valid: true };
}

/**
 * Generate a unique filename for uploaded file
 */
export function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = randomBytes(8).toString('hex');
  return `${timestamp}-${random}${ext}`;
}

/**
 * Get the upload directory path (public/uploads)
 */
export function getUploadDir(): string {
  return path.join(process.cwd(), 'public', 'uploads');
}

/**
 * Convert a filename to the public URL path
 */
export function getPublicUrl(filename: string): string {
  return `/uploads/${filename}`;
}

/**
 * Extract filename from a public URL path
 */
export function getFilenameFromUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/uploads\/(.+)$/);
  return match ? match[1] : null;
}
