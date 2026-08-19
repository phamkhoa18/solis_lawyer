/**
 * Danh sách nguồn nội dung luật Úc cho AI Writer.
 *
 * Types:
 *  - 'rss'      : có RSS chuẩn, đọc bằng rss-parser
 *  - 'html-list': trang listing HTML, đọc bằng cheerio adapter riêng
 *  - 'url-only' : không có feed công khai — dán URL bài viết trực tiếp
 *
 * RSS của LSJ đã verify live (2026-08-19). Lexology/Mondaq/Chambers trả 404
 * với mọi pattern RSS công khai → dùng html-list/url-only.
 */

export type SourceType = 'rss' | 'html-list' | 'url-only';

export interface AISource {
  id: string;
  name: string;
  type: SourceType;
  /** URL RSS (type=rss) hoặc URL listing (type=html-list) hoặc trang chủ (url-only) */
  url: string;
  category: 'family' | 'criminal' | 'news' | 'general';
  note?: string;
}

export const AI_SOURCES: AISource[] = [
  // ── Aggregator phân tích từ law firms (anh yêu cầu thêm) ──
  {
    id: 'mondaq-family',
    name: 'Mondaq Úc — Family & Matrimonial',
    type: 'html-list',
    url: 'https://www.mondaq.com/australia/family-and-matrimonial/family-law',
    category: 'family',
    note: 'Bài mới từ nhiều hãng luật Úc — mỏ đề bài lớn nhất mảng gia đình',
  },
  {
    id: 'lexology',
    name: 'Lexology (dán URL bài)',
    type: 'url-only',
    url: 'https://www.lexology.com/',
    category: 'general',
    note: 'Alerts/phân tích của nhiều firm — lọc Australia + Family/Criminal. Cần tài khoản free để đọc full',
  },
  {
    id: 'chambers',
    name: 'Chambers Practice Guides (dán URL bài)',
    type: 'url-only',
    url: 'https://practiceguides.chambers.com/',
    category: 'general',
    note: 'Trends & Developments theo firm — chiều sâu, hợp bài tổng quan hằng năm',
  },
  {
    id: 'fls',
    name: 'Law Council — Family Law Section (dán URL bài)',
    type: 'url-only',
    url: 'https://www.familylawsection.org.au/',
    category: 'family',
    note: 'Cập nhật practitioner: quyết định mới, CPD, tài liệu thực hành',
  },

  // ── RSS verified ──
  {
    id: 'lsj',
    name: 'LSJ — Legal Updates (Law Society NSW)',
    type: 'rss',
    url: 'https://lsj.com.au/category/legal-updates/feed/',
    category: 'general',
    note: 'Case notes + legislative developments, biên tập tốt',
  },
  {
    id: 'guardian-au',
    name: 'The Guardian Australia',
    type: 'rss',
    url: 'https://www.theguardian.com/australia-news/rss',
    category: 'news',
    note: 'Tin pháp lý — chỉ dùng làm đề bài, AI viết lại 100%',
  },
  {
    id: 'abc-news',
    name: 'ABC News — Just In',
    type: 'rss',
    url: 'https://www.abc.net.au/news/feed/51120/rss',
    category: 'news',
    note: 'Tin tức tổng hợp — lọc tay tin liên quan tòa án/pháp luật',
  },
];

export interface FeedItem {
  sourceId: string;
  sourceName: string;
  title: string;
  link: string;
  pubDate?: string;
  snippet?: string;
}
