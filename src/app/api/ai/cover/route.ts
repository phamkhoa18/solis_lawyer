import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';
import { generateCoverSet } from '@/lib/coverGen';
import { generateUniqueFilename, getUploadDir, getPublicUrl } from '@/lib/uploadHelper';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface CoverBody {
  topic?: string;
  titleVi?: string;
  titleEn?: string;
  categoryLabel?: string;
  variant?: number;
  template?: 1 | 2 | 3;
}

/** Dọn ảnh AI cover cũ (>7 ngày) — tránh đầy ổ đĩa */
async function pruneOldCovers(): Promise<void> {
  try {
    const dir = getUploadDir();
    const files = await readdir(dir);
    const now = Date.now();
    await Promise.all(
      files
        .filter((f) => f.startsWith('ai-cover-'))
        .map(async (f) => {
          const p = path.join(dir, f);
          const { mtimeMs } = await stat(p);
          if (now - mtimeMs > 7 * 24 * 3600_000) await unlink(p).catch(() => {});
        })
    );
  } catch {
    /* dọn dẹp không được phép lỗi */
  }
}

async function savePng(png: Buffer, name: string): Promise<string> {
  const uploadDir = getUploadDir();
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  const filename = generateUniqueFilename(name);
  await writeFile(path.join(uploadDir, filename), png);
  return getPublicUrl(filename);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CoverBody;
    const title = (body.titleVi || '').trim();
    if (!title) {
      return NextResponse.json({ success: false, message: 'Thiếu tiêu đề tiếng Việt' }, { status: 400 });
    }

    const seed = body.variant ?? Math.floor(Math.random() * 100000);
    void pruneOldCovers();
    const set = await generateCoverSet({
      topic: body.topic || title,
      title,
      titleEn: body.titleEn,
      categoryLabel: body.categoryLabel,
      seed,
      template: body.template,
    });

    const stamp = `ai-cover-${Date.now()}`;
    const [url, ogUrl, feedUrl] = await Promise.all([
      savePng(set.main, `${stamp}.png`),
      savePng(set.og, `${stamp}-og.png`),
      savePng(set.feed, `${stamp}-feed.png`),
    ]);

    return NextResponse.json({
      success: true,
      url,
      ogUrl,
      feedUrl,
      template: set.template,
      theme: set.light ? 'light' : 'dark',
      size: set.main.length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Lỗi không xác định';
    console.error('POST /api/ai/cover error:', message, e instanceof Error ? e.stack : undefined);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
