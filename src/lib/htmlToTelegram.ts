/**
 * Chuyển HTML bài viết → Telegram HTML (parse_mode HTML) — chia chunk ≤3800 ký tự.
 * Telegram chỉ cho <b> <i> <a> <code> <pre>; heading → <b>, bỏ footer/sơ đồ/bảng.
 */

import * as cheerio from 'cheerio';
import { esc } from '@/lib/telegram';

export function articleHtmlToTelegram(html: string): string[] {
  const $ = cheerio.load(`<div id="root">${html}</div>`);
  // Bỏ footer chuẩn + sơ đồ mermaid (xem trên web) + bảng
  $('#root .solis-footer').remove();
  $('#root pre.mermaid').each((_, el) => {
    $(el).replaceWith('<p><i>📊 Sơ đồ minh hoạ — hình nằm bên dưới và trên website</i></p>');
  });
  $('#root table').each((_, el) => {
    $(el).replaceWith('<p><i>📋 [Bảng so sánh — xem trên website]</i></p>');
  });

  const lines: string[] = [];
  const walk = (nodes: cheerio.Cheerio<never>) => {
    nodes.each((_, el) => {
      // text node trần (đoạn AI không bọc <p>) → đẩy như đoạn văn
      const type = (el as unknown as { type?: string }).type;
      if (type === 'text') {
        const t = $(el).text().trim();
        if (t) {
          lines.push(esc(t));
          lines.push('');
        }
        return;
      }
      const tag = (el as unknown as { tagName?: string }).tagName || '';
      const $el = $(el as never);
      const inner = inlineFormat($el);
      switch (tag) {
        case 'h2':
          lines.push(`\n<b>━━ ${inner.toUpperCase()} ━━</b>`);
          break;
        case 'h3':
          lines.push(`\n<b>▪ ${inner}</b>`);
          break;
        case 'blockquote':
          lines.push(`┃ <i>${inner}</i>`);
          break;
        case 'li':
          lines.push(`  • ${inner}`);
          break;
        case 'p':
        case 'ul':
        case 'div':
          if (inner.trim()) lines.push(inner);
          if (tag === 'p' || tag === 'ul') lines.push('');
          break;
        default:
          if (inner.trim()) lines.push(inner);
      }
    });
  };

  // format inline: b/i/a giữ, còn lại lấy text
  function inlineFormat($el: cheerio.Cheerio<never>): string {
    let out = '';
    ($el.contents() as cheerio.Cheerio<never>).each((_, node) => {
      const type = (node as unknown as { type: string }).type;
      if (type === 'text') {
        out += esc($(node as never).text());
      } else if (type === 'tag') {
        const tag = (node as unknown as { tagName?: string }).tagName || '';
        const $n = $(node as never);
        if (tag === 'strong' || tag === 'b') out += `<b>${inlineFormat($n)}</b>`;
        else if (tag === 'em' || tag === 'i') out += `<i>${inlineFormat($n)}</i>`;
        else if (tag === 'a') {
          const href = $n.attr('href') || '';
          out += `<a href="${esc(href)}">${inlineFormat($n)}</a>`;
        } else out += inlineFormat($n);
      }
    });
    return out;
  }

  walk($('#root').contents() as cheerio.Cheerio<never>);

  // Gộp dòng → chunk
  const text = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const chunks: string[] = [];
  let current = '';
  for (const paragraph of text.split('\n\n')) {
    const piece = (current ? current + '\n\n' : '') + paragraph;
    if (piece.length > 3800) {
      if (current) chunks.push(current);
      // đoạn đơn dài hơn 3800 → cắt thô
      for (let i = 0; i < paragraph.length; i += 3800) chunks.push(paragraph.slice(i, i + 3800));
      current = '';
    } else {
      current = piece;
    }
  }
  if (current) chunks.push(current);
  return chunks.length ? chunks : ['(nội dung trống)'];
}
