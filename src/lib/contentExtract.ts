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
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: 'text/plain' },
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
      text: body.slice(0, 40000), // giới hạn ~40K ký tự cho LLM
      method: 'jina',
    };
  } catch {
    return null;
  }
}

async function extractDirect(url: string): Promise<ExtractedContent | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    $('script, style, nav, header, footer, aside, iframe, noscript, form, button').remove();
    const title = $('title').first().text().trim() || $('h1').first().text().trim();
    const article = $('article').first().text() || $('main').first().text() || $('body').text();
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
  const viaJina = await extractViaJina(encodeURIComponent(url));
  if (viaJina) return viaJina;
  const viaDirect = await extractDirect(url);
  if (viaDirect) return viaDirect;
  throw new Error(`Không đọc được nội dung từ ${url} (thử mở URL kiểm tra, hoặc copy đoạn văn bản vào ô đề bài)`);
}
