import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { AI_SOURCES, FeedItem } from '@/lib/aiSources';
import { AUTH_COOKIE_NAME, verifyJWT } from '@/lib/auth';

export const runtime = 'nodejs';

const parser = new Parser({ timeout: 15000 });

// Cache in-memory 15 phút để không đánh spam nguồn mỗi lần mở trang
let cache: { items: FeedItem[]; at: number } | null = null;
const CACHE_MS = 15 * 60 * 1000;

/** Mondaq không có RSS chuẩn — trang listing HTML được parse làm feed */
async function fetchMondaq(sourceId: string, sourceName: string, url: string): Promise<FeedItem[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) return [];
  const $ = cheerio.load(await res.text());
  // Chỉ lấy bài thuộc chủ đề gia đình/hồ sơ liên quan (bỏ rác sidebar như work-visas, health-safety)
  const FAMILY_TOPICS = /^(family-law|divorce|child-custody|wills-intestacy-estate-planning|adoption|domestic-violence)$/;
  const LINK_RE = /^\/australia\/([a-z0-9-]+)\/(\d+)\/[a-z0-9%-]+/;
  const items: FeedItem[] = [];
  const seen = new Set<string>();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(LINK_RE);
    if (!match || !FAMILY_TOPICS.test(match[1])) return;
    const link = `https://www.mondaq.com${href}`;
    if (seen.has(link)) return;
    seen.add(link);
    const title = $(el).text().replace(/\s+/g, ' ').trim().replace(/^Article\s+/i, '');
    if (title.length < 15) return;
    items.push({ sourceId, sourceName, title, link });
  });
  return items.slice(0, 15);
}

async function fetchAllFeeds(): Promise<FeedItem[]> {
  const tasks = AI_SOURCES.filter((s) => s.type === 'rss' || s.type === 'html-list').map(
    async (source) => {
      try {
        if (source.type === 'rss') {
          const feed = await parser.parseURL(source.url);
          return (feed.items || []).slice(0, 15).map((item) => ({
            sourceId: source.id,
            sourceName: source.name,
            title: item.title || '',
            link: item.link || '',
            pubDate: item.isoDate || item.pubDate,
            snippet: (item.contentSnippet || '').slice(0, 220),
          })) as FeedItem[];
        }
        return await fetchMondaq(source.id, source.name, source.url);
      } catch (e) {
        console.error(`Feed lỗi (${source.id}):`, e instanceof Error ? e.message : e);
        return [] as FeedItem[];
      }
    }
  );
  const results = await Promise.allSettled(tasks);
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}

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
