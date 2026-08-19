import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import SourceItem from '@/models/SourceItem';
import { fetchAllFeeds } from '@/lib/feeds';
import { AUTH_COOKIE_NAME, verifyJWT } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 120;

async function auth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  return !!(token && (await verifyJWT(token)));
}

/**
 * GET /api/ai/suggestions
 * Quét feeds → lưu bài mới chưa từng thấy vào DB → trả danh sách status='new'.
 * Nhờ có DB, mỗi lần mở admin chỉ thấy NHỮNG BÀI MỚI từ lần trước (đã bỏ qua không hiện lại).
 */
export async function GET(req: NextRequest) {
  if (!(await auth(req))) {
    return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
  }
  try {
    await connectDB();

    // Cache 10 phút trong memory để không quét nguồn liên tục
    const cacheKey = 'suggestions_last_scan';
    const now = Date.now();
    if (!(globalThis as Record<string, unknown>)[cacheKey] || now - ((globalThis as Record<string, number>)[cacheKey] as number) > 10 * 60 * 1000) {
      (globalThis as Record<string, number>)[cacheKey] = now;
      const items = await fetchAllFeeds();
      if (items.length) {
        // bulk upsert theo link — bài đã biết không đè status
        const ops = items.map((i) => ({
          updateOne: {
            filter: { link: i.link },
            update: { $setOnInsert: { ...i, status: 'new' } },
            upsert: true,
          },
        }));
        await SourceItem.bulkWrite(ops, { ordered: false });
      }
    }

    const suggestions = await SourceItem.find({ status: 'new' })
      .sort({ createdAt: -1 })
      .limit(40)
      .select('link sourceId sourceName title snippet pubDate createdAt');
    return NextResponse.json({ success: true, data: suggestions });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Lỗi server';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

/** POST /api/ai/suggestions — body: { link, action: 'dismiss' | 'restore' } */
export async function POST(req: NextRequest) {
  if (!(await auth(req))) {
    return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
  }
  try {
    await connectDB();
    const { link, action } = (await req.json()) as { link?: string; action?: 'dismiss' | 'restore' };
    if (!link || !action) {
      return NextResponse.json({ success: false, message: 'Thiếu link/action' }, { status: 400 });
    }
    await SourceItem.updateOne({ link }, { $set: { status: action === 'dismiss' ? 'dismissed' : 'new' } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
