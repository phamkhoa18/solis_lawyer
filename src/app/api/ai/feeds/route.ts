import { NextRequest, NextResponse } from 'next/server';
import { fetchAllFeeds } from '@/lib/feeds';
import { FeedItem } from '@/lib/aiSources';
import { AUTH_COOKIE_NAME, verifyJWT } from '@/lib/auth';

export const runtime = 'nodejs';

// Cache in-memory 15 phút để không đánh spam nguồn mỗi lần mở trang
let cache: { items: FeedItem[]; at: number } | null = null;
const CACHE_MS = 15 * 60 * 1000;

export async function GET(req: NextRequest) {
  // GET /api/ai/* không được middleware chặn → tự verify JWT cookie
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token || !(await verifyJWT(token))) {
    return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
  }

  if (cache && Date.now() - cache.at < CACHE_MS) {
    return NextResponse.json({ success: true, data: cache.items, cached: true });
  }

  const items = await fetchAllFeeds();
  cache = { items, at: Date.now() };
  return NextResponse.json({ success: true, data: items, cached: false });
}
