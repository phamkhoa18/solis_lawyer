import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { AI_SOURCES, FeedItem } from '@/lib/aiSources';

const parser = new Parser({ timeout: 10000 });

/** Mondaq không có RSS chuẩn — trang listing HTML được parse làm feed */
export async function fetchMondaq(sourceId: string, sourceName: string, url: string): Promise<FeedItem[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return [];
  const $ = cheerio.load(await res.text());
  const FAMILY_TOPICS = /^(family-law|divorce|child-custody|wills-intestacy-estate-planning|adoption|domestic-violence)$/;
  const LINK_RE = /^\/australia\/([a-z0-9-]+)\/(\d+)\/([a-z0-9_%-]+)/i;
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

export async function fetchAllFeeds(): Promise<FeedItem[]> {
  const tasks = AI_SOURCES.filter((s) => s.type === 'rss' || s.type === 'html-list').map(async (source) => {
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
  });
  const results = await Promise.allSettled(tasks);
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}
