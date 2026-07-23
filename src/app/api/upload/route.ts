import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import {
  validateFile,
  generateUniqueFilename,
  getUploadDir,
  getPublicUrl,
  getFilenameFromUrl,
} from '@/lib/uploadHelper';

/**
 * POST /api/upload
 * Upload a single image file to public/uploads/
 * Body: FormData with field "file"
 * Returns: { success: true, url: "/uploads/filename.ext" }
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Không có file trong request' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const uploadDir = getUploadDir();
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename and save
    const filename = generateUniqueFilename(file.name);
    const filepath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const url = getPublicUrl(filename);

    return NextResponse.json(
      {
        success: true,
        url,
        filename,
        message: 'Upload ảnh thành công',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi upload ảnh' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload?url=/uploads/filename.ext
 * Delete an uploaded image file
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, message: 'Thiếu URL ảnh cần xóa' },
        { status: 400 }
      );
    }

    const filename = getFilenameFromUrl(url);
    if (!filename) {
      return NextResponse.json(
        { success: false, message: 'URL ảnh không hợp lệ' },
        { status: 400 }
      );
    }

    const filepath = path.join(getUploadDir(), filename);

    if (!existsSync(filepath)) {
      return NextResponse.json(
        { success: false, message: 'File không tồn tại' },
        { status: 404 }
      );
    }

    await unlink(filepath);

    return NextResponse.json(
      { success: true, message: 'Đã xóa ảnh thành công' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi xóa ảnh' },
      { status: 500 }
    );
  }
}
