/**
 * Trích xuất nội dung bài viết từ URL → text sạch cho LLM.
 *
 * Chiến lược (theo research):
 *  1. Jina Reader r.jina.ai — free không cần key, trả markdown sạch
 *  2. Fallback: fetch trực tiếp + cheerio strip script/style/nav
 */

import * as cheerio from 'cheerio';

export interface ExtractedContent {
  title: string;
  text: string;
  method: 'jina' | 'direct';
}

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function extractViaJina(url: string): Promise<ExtractedContent | null> {
  try {
    // Jina nhận URL gốc sau prefix, KHÔNG encodeURIComponent
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Accept: 'text/plain',
        'X-Return-Format': 'text',
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const text = (await res.text()).trim();
    if (text.length < 200) return null;
    // Jina trả "Title: ...\n\nURL Source: ...\n\nMarkdown Content:\n..."
    const titleMatch = text.match(/^Title:\s*(.+)$/m);
    const bodyIdx = text.indexOf('Markdown Content:');
    const body = bodyIdx >= 0 ? text.slice(bodyIdx + 'Markdown Content:'.length).trim() : text;
    return {
      title: titleMatch?.[1]?.trim() || '',
      text: body.slice(0, 40000),
      method: 'jina',
    };
  } catch {
    return null;
  }
}

async function extractDirect(url: string): Promise<ExtractedContent | null> {
  try {
    const u = new URL(url);
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-AU,en;q=0.9,vi;q=0.8',
        Referer: `${u.protocol}//${u.host}/`,
      },
      signal: AbortSignal.timeout(20000),
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    $('script, style, nav, header, footer, aside, iframe, noscript, form, button, [role="banner"], [role="navigation"], .cookie-banner, .ad-container, .sidebar').remove();
    const title = $('title').first().text().trim() || $('h1').first().text().trim();

    // Ưu tiên lấy article/main, fallback body
    let article = '';
    const articleEl = $('article').first();
    if (articleEl.length && articleEl.text().trim().length > 200) {
      article = articleEl.text();
    } else {
      const mainEl = $('main').first();
      if (mainEl.length && mainEl.text().trim().length > 200) {
        article = mainEl.text();
      } else {
        // Mondaq và nhiều site dùng class cụ thể
        const contentEl = $('.article-content, .entry-content, .post-content, #article-body, .article_detail_group').first();
        if (contentEl.length && contentEl.text().trim().length > 200) {
          article = contentEl.text();
        } else {
          article = $('body').text();
        }
      }
    }

    // Chuẩn hoá khoảng trắng
    const text = article.replace(/\s+/g, ' ').replace(/ +/g, ' ').trim();
    if (text.length < 200) return null;
    return { title, text: text.slice(0, 40000), method: 'direct' };
  } catch {
    return null;
  }
}

const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1)/i;

function assertSafeUrl(url: string): void {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new Error('URL không hợp lệ');
  }
  if (!/^https?:$/.test(u.protocol)) throw new Error('Chỉ hỗ trợ http/https');
  if (PRIVATE_HOST.test(u.hostname)) throw new Error('Không cho phép truy cập địa chỉ nội bộ');
}

export async function extractContent(url: string): Promise<ExtractedContent> {
  assertSafeUrl(url);
  // Jina nhận URL gốc — KHÔNG encodeURIComponent
  const viaJina = await extractViaJina(url);
  if (viaJina) return viaJina;
  const viaDirect = await extractDirect(url);
  if (viaDirect) return viaDirect;
  throw new Error(`Không đọc được nội dung từ ${url} — thử mở URL kiểm tra xem trang còn hoạt động, hoặc copy nội dung bài vào ô đề bài.`);
}
