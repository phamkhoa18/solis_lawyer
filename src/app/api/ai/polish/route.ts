import { NextRequest, NextResponse } from 'next/server';
import { fptChat, FPT_FAST_MODEL } from '@/lib/fpt';
import { computeQuality, lintEnglishProse } from '@/lib/readability';
import Typograf from 'typograf';
import { sanitizeArticleHtml } from '@/lib/sanitize';

const typograf = new Typograf({ locale: ['en-US'] });

export const runtime = 'nodejs';
export const maxDuration = 300;

const EDITOR_EN = `You are a plain-language editor for an Australian law firm blog read by ordinary people.
Rewrite the draft article ONLY for clarity and warmth — target Grade 8.

HARD RULES (never break):
- Keep every legal fact, statute name, case citation, number, date and link EXACTLY as given.
- Copy the final <div class="solis-footer">...</div> block VERBATIM — change nothing inside it.
- Keep the overall HTML structure: same <h2> sections (headings may be lightly rephrased for clarity), same tables, same safety blockquote at the top if present.
- Output ONLY the rewritten HTML. No commentary.

WHAT TO FIX:
- Split sentences longer than 25 words into short ones.
- Replace formal phrases with plain ones using the feedback below.
- Active voice, "you"/"we", everyday words.`;

const EDITOR_VI = `Bạn là biên tập viên văn phong "dễ hiểu" cho blog của hãng luật Úc phục vụ cộng đồng Việt.
Viết lại bài THÔI — chỉ sửa cho rõ ràng, ấm áp, dễ như báo đại chúng.

QUY TẮC BẮT BUỘC (không được phá):
- Giữ nguyên MỌI thông tin pháp lý: tên luật, case, số liệu, ngày tháng, link — đúng y hệt.
- Chép NGUYÊN VĂN khối <div class="solis-footer">...</div> cuối bài — không đổi gì bên trong.
- Giữ cấu trúc HTML: đủ các mục <h2> như bản gốc (chỉ được chỉnh nhẹ tiêu đề cho rõ), giữ bảng, giữ hộp an toàn đầu bài nếu có.
- Chỉ OUTPUT HTML đã sửa. Không giải thích.

CẦN SỬA:
- Tách câu dài trên 25 từ thành câu ngắn.
- Thay các cụm từ trang trọng theo góp ý bên dưới.
- Câu chủ động, xưng "bạn"/"chúng tôi", từ đời thường, tránh Hán Việt và văn công văn.`;

interface PolishBody {
  contentEn: string;
  contentVi: string;
  feedback?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PolishBody;
    if (!body.contentEn || !body.contentVi) {
      return NextResponse.json({ success: false, message: 'Thiếu nội dung EN/VI' }, { status: 400 });
    }
    const feedback = body.feedback?.trim() || '';
    const proseIssues = lintEnglishProse(body.contentEn);
    const proseNote =
      proseIssues.length > 0
        ? `\n\nPROSE LINT FINDINGS (write-good) — fix these too:\n${proseIssues
            .map((p) => `- "${p.text}": ${p.reason}`)
            .join('\n')}`
        : '';
    const fbEn = (feedback ? `\n\nAUTOMATED FEEDBACK TO FIX:\n${feedback}` : '') + proseNote;
    const fbVi = feedback ? `\n\nGÓP Ý TỰ ĐỘNG CẦN SỬA:\n${feedback}` : '';

    const polishOne = async (system: string, content: string, lang: 'EN' | 'VI') => {
      const polished = await fptChat({
        model: FPT_FAST_MODEL,
        temperature: 0.3,
        maxTokens: 16000,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `${lang === 'EN' ? 'DRAFT ARTICLE:' : 'BÀI THU NHÁP:'}\n${content}${lang === 'EN' ? fbEn : fbVi}` },
        ],
      });
      // Editor đôi khi bọc ```html — strip
      return polished.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/i, '').trim();
    };


    let contentEn = await polishOne(EDITOR_EN, body.contentEn, 'EN');
    let contentVi = await polishOne(EDITOR_VI, body.contentVi, 'VI');

    // Typography chuẩn tạp chí bản EN: ngoặc cong, em-dash, ellipsis (typograf)
    try {
      contentEn = typograf.execute(contentEn);
    } catch {
      /* giữ nguyên nếu lỗi */
    }


    contentEn = sanitizeArticleHtml(contentEn);
    contentVi = sanitizeArticleHtml(contentVi);
    const quality = computeQuality(contentEn, contentVi);
    return NextResponse.json({ success: true, data: { contentEn, contentVi, quality } });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Lỗi không xác định';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
