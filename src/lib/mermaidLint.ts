/**
 * Mermaid lint + self-repair cho AI Writer.
 *
 * LLM viết Mermaid đúng cú pháp 85-92% (benchmark IBM MermaidSeqBench).
 * Chiến lược (theo Microsoft GenAIScript "Mermaids Unbroken"):
 *   1. Lint bằng regex (không cần DOM)
 *   2. Nếu lỗi → trả lỗi về cho LLM sửa 1 lượt
 *   3. Vẫn lỗi → XOÁ block để không bao giờ ship diagram hỏng
 */

const ALLOWED_TYPES = /^(flowchart\s+(TD|TB|LR)|timeline|mindmap)\b/;
const VIETNAMESE = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const ASCII_ID = /^[A-Za-z][A-Za-z0-9_]*$/;

/** Theme brand Solis nhúng thẳng vào code sơ đồ — chạy đồng nhất web + Telegram (mermaid.ink) */
export const MERMAID_INIT =
  '%%{init: {"theme":"base","themeVariables":{"primaryColor":"#fdf6ec","primaryBorderColor":"#9b6f45","primaryTextColor":"#1e293b","secondaryColor":"#f5ead9","tertiaryColor":"#faf7f2","lineColor":"#9b6f45","nodeBorder":"#9b6f45","clusterBkg":"#faf7f2","edgeLabelBackground":"#ffffff","fontFamily":"Georgia, serif","fontSize":"15px"},"flowchart":{"curve":"basis","nodeSpacing":48,"rankSpacing":56}}}%%';

/** Bỏ dòng init directive trước khi lint */
function stripInit(code: string): string {
  return code
    .split('\n')
    .filter((l) => !l.trim().startsWith('%%{'))
    .join('\n');
}

export function extractMermaidBlocks(html: string): { code: string; full: string }[] {
  const blocks: { code: string; full: string }[] = [];
  const re = /<pre[^>]*class="[^"]*mermaid[^"]*"[^>]*>([\s\S]*?)<\/pre>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    blocks.push({
      code: m[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'"),
      full: m[0],
    });
  }
  return blocks;
}

export function lintMermaid(rawCode: string): string[] {
  const errors: string[] = [];
  const code = stripInit(rawCode);
  const trimmed = code.trim();

  if (!ALLOWED_TYPES.test(trimmed)) {
    errors.push(
      'First line must be exactly one of: "flowchart TD", "flowchart TB", "flowchart LR", "timeline", or "mindmap" (do not use "graph").'
    );
  }

  const quoteCount = (code.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    errors.push('Double quotes are unbalanced — every label must be wrapped in double quotes.');
  }

  // Label chứa tiếng Việt / ngoặc / ký tự đặc biệt mà KHÔNG nằm trong "..."
  const lines = trimmed.split('\n').slice(1); // bỏ dòng khai báo type
  let nodeCount = 0;
  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    nodeCount++;

    // nhãn dạng A1[Nội dung...] hoặc A1(Nội dung...) chưa quote
    const unquotedLabel = l.match(/^([A-Za-z][A-Za-z0-9_]*)\s*(\[[^"]*[\]\)]|\([^"]*\))$/);
    if (unquotedLabel) {
      const label = unquotedLabel[2];
      if (VIETNAMESE.test(label) || /[()]/.test(label.slice(1, -1))) {
        errors.push(`Line "${l.slice(0, 50)}": label must be wrapped in double quotes, e.g. A1["${label.slice(1, -1).slice(0, 30)}..."]`);
      }
      if (!ASCII_ID.test(unquotedLabel[1])) {
        errors.push(`Node ID "${unquotedLabel[1]}" must be ASCII letters/digits (A1, B2...).`);
      }
    }

    if (/`|<script/i.test(l)) {
      errors.push(`Line "${l.slice(0, 50)}": backticks and scripts are not allowed.`);
    }
  }

  if (nodeCount > 14) {
    errors.push(`Diagram has ${nodeCount} lines/nodes — reduce to 9 nodes or fewer (split by stage).`);
  }

  return errors;
}

/**
 * Lint + repair các block mermaid trong HTML bài viết.
 * Trả về HTML đã sửa + báo cáo cho UI.
 */
export async function repairMermaidInHtml(
  html: string,
  repairCall: (code: string, errors: string[]) => Promise<string>,
  onStatus?: (msg: string) => void
): Promise<{ html: string; report: { lang: string; ok: boolean; errors?: string[]; repaired?: boolean }[] }> {
  const blocks = extractMermaidBlocks(html);
  if (!blocks.length) return { html, report: [] };

  let result = html;
  const report: { lang: string; ok: boolean; errors?: string[]; repaired?: boolean }[] = [];

  for (const block of blocks) {
    let code = block.code;
    let errors = lintMermaid(code);

    if (errors.length > 0) {
      onStatus?.('Đang sửa sơ đồ minh hoạ...');
      try {
        const fixed = await repairCall(code, errors);
        const fixedErrors = lintMermaid(fixed);
        if (fixedErrors.length === 0) {
          code = fixed;
          errors = [];
          report.push({ lang: '', ok: true, repaired: true });
        }
      } catch {
        // repair fail → sẽ xoá block dưới
      }
    }

    if (errors.length > 0) {
      // Vẫn lỗi sau 1 lượt sửa → xoá block, không ship diagram hỏng
      result = result.replace(block.full, '');
      report.push({ lang: '', ok: false, errors });
    } else {
      // code sạch (hoặc đã sửa) → nhúng theme brand + thay thế nội dung đã unescape
      const withInit = `${MERMAID_INIT}\n${code}`;
      const escaped = withInit
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      result = result.replace(block.full, `<pre class="mermaid">${escaped}</pre>`);
      if (!report.some((r) => r.repaired)) report.push({ lang: '', ok: true });
    }
  }

  return { html: result, report };
}
