import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { generateCover } from '@/lib/coverGen';
import { generateUniqueFilename, getUploadDir, getPublicUrl } from '@/lib/uploadHelper';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface CoverBody {
  topic?: string;
  titleVi?: string;
  titleEn?: string;
  categoryLabel?: string;
  variant?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CoverBody;
    const title = (body.titleVi || '').trim();
    if (!title) {
      return NextResponse.json({ success: false, message: 'Thiếu tiêu đề tiếng Việt' }, { status: 400 });
    }

    const png = await generateCover({
      topic: body.topic || title,
      title,
      titleEn: body.titleEn,
      categoryLabel: body.categoryLabel,
      seed: body.variant, // đổi variant = đổi nền khác
    });

    // Lưu theo đúng chuẩn /api/upload hiện có
    const uploadDir = getUploadDir();
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    const filename = generateUniqueFilename(`ai-cover-${Date.now()}.png`);
    await writeFile(path.join(uploadDir, filename), png);
    const url = getPublicUrl(filename);

    return NextResponse.json({ success: true, url, size: png.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Lỗi không xác định';
    console.error('POST /api/ai/cover error:', message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
