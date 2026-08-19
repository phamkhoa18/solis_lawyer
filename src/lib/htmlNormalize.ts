/**
 * Chuẩn hoá HTML bài viết do AI sinh (thuần string — không thao tác DOM):
 * AI đôi khi viết đoạn văn TRẦN (không bọc <p>), chỉ cách nhau bằng dòng trắng
 * giữa các heading — trình duyệt vẫn hiển thị nhưng converter Telegram/TinyMCE
 * bị mất. Hàm này bọc lại mọi cụm text trần vào <p> (tách theo dòng trắng).
 */

const BLOCK = '(h[1-6]|p|ul|ol|table|blockquote|pre|figure|div)';
const BLOCK_RE = new RegExp(`<${BLOCK}\\b[^>]*>[\\s\\S]*?<\\/\\1\\s*>`, 'gi');

export function normalizeArticleHtml(html: string): string {
  const tokens: Array<{ block: boolean; text: string }> = [];
  let last = 0;
  let m: RegExpExecArray | null;
  BLOCK_RE.lastIndex = 0;
  while ((m = BLOCK_RE.exec(html))) {
    tokens.push({ block: false, text: html.slice(last, m.index) });
    tokens.push({ block: true, text: m[0] });
    last = m.index + m[0].length;
  }
  tokens.push({ block: false, text: html.slice(last) });

  const out: string[] = [];
  for (const t of tokens) {
    if (t.block) {
      out.push(t.text);
      continue;
    }
    const loose = t.text.trim();
    if (!loose) continue;
    // tách đoạn trần theo dòng trắng thành từng <p> riêng
    for (const para of loose.split(/\n\s*\n/)) {
      const p = para.trim();
      if (p) out.push(`<p>${p}</p>`);
    }
  }
  return out.join('\n');
}
