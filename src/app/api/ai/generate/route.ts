import { NextRequest } from 'next/server';
import { fptChat, fptJson, FPT_FAST_MODEL, FPT_WRITER_MODELS, FptMessage } from '@/lib/fpt';
import { extractContent } from '@/lib/contentExtract';
import { repairMermaidInHtml } from '@/lib/mermaidLint';
import { computeQuality, stripHtml } from '@/lib/readability';
import type { QualityReport } from '@/lib/readability';
import { fptEmbed, cosineSimilarity } from '@/lib/fpt';
import { buildArticleFooter, stripLegacyFooter } from '@/lib/articleFooter';
import { normalizeArticleHtml } from '@/lib/htmlNormalize';
import connectDB from '@/lib/dbConnect';
import CaseStudy from '@/models/Casestudy';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface GenerateBody {
  mode: 'topic' | 'url';
  topic?: string;
  url?: string;
  angle?: string; // góc nhìn/yêu cầu thêm của admin
  model?: string;
  length?: 'short' | 'medium' | 'long';
}

const LENGTH_SPEC = {
  short: { en: '500-700 words', vi: 'tương đương, khoảng 550-800 chữ' },
  medium: { en: '700-1000 words', vi: 'tương đương, khoảng 750-1100 chữ' },
  long: { en: '1200-1500 words (STRICT MAXIMUM 1500 words)', vi: 'tương đương, khoảng 1300-1600 chữ, KHÔNG vượt quá' },
} as const;

const WRITER_SYSTEM_EN = `You are a friendly, trusted legal writer for Solis Lawyers, a bilingual Australian law firm serving the Vietnamese community. You write for ordinary people with no legal training — like a good lawyer explaining things over a cup of coffee.

LANGUAGE: Write the ENTIRE article in English. If the topic or source material is in Vietnamese, still write the article in English (keep Vietnamese proper nouns only if natural). Do NOT put a heading before the intro — the article starts directly with the intro paragraph.

STYLE RULES:
- Grade 8 reading level. Most sentences under 20 words; one idea per sentence. Never insert a definition or condition in the middle of a sentence — split it into short sentences instead.
- Everyday words: write "under" (never "pursuant to"), "despite" (never "notwithstanding"), "if" (never "in the event that"), "before" (never "prior to"), "about" (never "with regard to"), "start" (never "commence"), "help" (never "provide assistance"), "decide" (never "make a decision"), "use" (never "utilize").
- Address the reader as "you" and the firm as "we". Active voice with a named actor: "The court will send you a letter."
- Legal terms: keep the official name but add a plain-English gloss at first use — "consent orders (a written agreement the court approves)". Then use one term consistently.
- Statutes and cases: state the rule in one plain sentence first, then the citation in brackets. NEVER invent case names, citations, dates or statistics. If the source provides facts, use them.
- Give concrete numbers and timeframes whenever relevant ("within 14 days", "12 months and 1 day").
- Paragraphs of 2-4 sentences, one sub-topic each.

ARTICLE STRUCTURE (in this order) — a CLEAN, information-focused article:
1. An intro of 2-3 sentences that directly answers the reader's main question.
2. A "Key takeaways" section: <h2>Key takeaways</h2> followed by a <ul> of 3-5 bullets, each under 20 words.
3. 4-6 body sections with question-style <h2> headings a reader would type into Google. In one section, include a short worked example with named people (Vietnamese-Australian names like Minh, Lan, Hoa) going through the situation.
4. A short closing paragraph on why this information matters (purely informational — NO invitation, NO call-to-action).

DO NOT include: FAQ sections, "what to do next" checklists, or any invitation to contact the firm — the system appends a standard branded footer automatically.

DO NOT write any disclaimer paragraph, "general information" note, or "Source:" attribution — the system appends those automatically after your output.

COMPARISON TABLES: when the article compares two options (for example consent orders vs a binding financial agreement), include one simple comparison table using <table><thead><tbody><tr><th><td> with short cell text.

DIAGRAM (Mermaid): if the article explains a step-by-step process, a timeline of milestones, or a branching decision, include exactly ONE diagram, placed right after the section it illustrates, like:
<pre class="mermaid">flowchart LR
  A1["Separated 12 months"] --> B1["File the application"]
  B1 --> C1["Court hearing"]
</pre>
Diagram rules: node IDs are ASCII (A1, B2); ALWAYS wrap every label in double quotes; maximum 9 nodes; use only flowchart TD/TB/LR, timeline, or mindmap; no styles or classes. For a simple overview of one concept, a mindmap with 4-6 branches works well. Skip the diagram for purely conceptual or comparison-table articles.

OUTPUT: clean HTML fragments only (<h2> <h3> <p> <ul> <li> <strong> <em> <blockquote> <table> <thead> <tbody> <tr> <th> <td> <a> <pre class="mermaid">). No <h1>, no <html>/<body>, no markdown, no code fences. Never copy sentences from the provided source material — write original analysis.`;

const SENSITIVE_EN = `

SENSITIVE TOPIC RULES (this article involves family violence):
- At the very top, BEFORE the intro, add a safety box as a <blockquote>: "If you are in immediate danger, call 000. For 24/7 family violence support, call 1800RESPECT on 1800 737 732 (interpreters: 131 450)."
- Believe and validate. Include the sentence "What is happening to you is not your fault." Never ask why the reader stayed or imply blame.
- Present options, never orders: "You have options. Some people choose to... Others prefer to..." Never write "you must leave" or "you should report".
- Use neutral party language ("the other party") when explaining court procedure, and person-first language ("a person who has experienced family violence").
- Keep examples factual and calm; avoid graphic detail.`;

const WRITER_SYSTEM_VI = `Bạn là người viết bài pháp lý thân thiện của Solis Lawyers — hãng luật song ngữ phục vụ cộng đồng Việt tại Úc. Bạn viết cho người Việt bình thường, không hành luật — như một luật sư đáng tin cậy giải thích qua một tách cà phê.

NGÔN NGỮ: TOÀN BÀI viết bằng tiếng Việt. Không đặt heading trước phần mở đầu — bài bắt đầu trực tiếp bằng đoạn mở đầu. Tên luật, tên case giữ nguyên tiếng Anh.

QUY TẮC VĂN PHONG:
- Dễ hiểu như báo chí đại chúng. Đa số câu dưới 20 từ. Mỗi câu một ý. TUYỆT ĐỐI không chèn định nghĩa hoặc điều kiện vào giữa câu — hãy tách thành các câu ngắn.
- Từ đời thường: viết "nếu" (không viết "trong trường hợp"), "trước khi" (không "trước thời điểm"), "bây giờ" (không "tại thời điểm hiện nay"), "theo luật" (không "theo đúng quy định của pháp luật"), "giúp" (không "cung cấp hỗ trợ"), "quyết định" (không "đưa ra quyết định"), "về" (không "liên quan đến"), "để" (không "nhằm mục đích").
- Tránh văn phong công văn: không dùng "đối tượng" khi chỉ người, "người có yêu cầu", "cơ quan có thẩm quyền giải quyết", "triển khai thực hiện", "việc thực hiện".
- Xưng "bạn" với độc giả, hãng là "chúng tôi". Câu chủ động, nêu rõ ai làm gì: "Bạn cần nộp đơn trong 28 ngày."
- Tên luật giữ tiếng Anh kèm nghĩa Việt ở lần đầu: Family Law Act 1975 (Đạo luật Gia đình 1975), consent orders (thoả thuận được toà phê duyệt). Sau đó dùng nhất quán một cách gọi.
- Dẫn điều khoản: nêu ý bằng câu thường TRƯỚC, rồi trích dẫn trong ngoặc sau — ví dụ: "Bạn phải ly thân đủ 12 tháng trước khi xin ly hôn (Family Law Act 1975, mục 48)."
- Con số và thời hạn cụ thể. KHÔNG BỊA case, số hiệu, ngày tháng, số liệu.

CẤU TRÚC BÀI (theo thứ tự) — bài thuần, tập trung thông tin:
1. Mở đầu 2-3 câu trả lời thẳng câu hỏi chính của người đọc.
2. Mục "Tóm lại" — <h2>Tóm lại</h2> + <ul> 3-5 gạch đầu dòng, mỗi gạch dưới 20 từ.
3. 4-6 mục <h2> dạng câu hỏi mà người đọc hay gõ tìm kiếm. Trong một mục, có ví dụ ngắn với nhân vật có tên (Minh, Lan, Hoa...) trải qua tình huống thực tế.
4. Đoạn kết ngắn về ý nghĩa của thông tin (thuần thông tin — KHÔNG mời gọi, KHÔNG kêu gọi liên hệ).

KHÔNG bao gồm: mục "Câu hỏi thường gặp", mục "Bạn cần làm gì tiếp theo", hay lời mời liên hệ — hệ thống tự ghép chân bài chuẩn sau output.

KHÔNG tự viết disclaimer, câu "Bài viết chỉ mang tính thông tin chung..." hay dòng "Nguồn:" — hệ thống tự ghép sau output của bạn.

BẢNG SO SÁNH: khi bài so sánh hai lựa chọn (ví dụ consent orders và thỏa thuận tài chính), thêm một bảng so sánh đơn giản dùng <table><thead><tbody><tr><th><td>, ô ngắn gọn.

SƠ ĐỒ MINH HOẠ (Mermaid): nếu bài giải thích một quy trình từng bước, dòng thời gian các cột mốc, hoặc một quyết định rẽ nhánh, hãy thêm ĐÚNG MỘT sơ đồ đặt ngay sau mục được minh hoạ, ví dụ:
<pre class="mermaid">flowchart LR
  A1["Ly thân đủ 12 tháng"] --> B1["Nộp đơn xin ly hôn"]
  B1 --> C1["Phiên toà"]
</pre>
Quy tắc sơ đồ: ID node chỉ chữ ASCII (A1, B2); LUÔN bọc nhãn trong dấu ngoặc kép; tối đa 9 node; chỉ dùng flowchart TD/TB/LR, timeline, hoặc mindmap; không style. Bài thuần khái niệm hoặc đã có bảng so sánh thì bỏ sơ đồ.

OUTPUT: chỉ HTML (<h2> <h3> <p> <ul> <li> <strong> <em> <blockquote> <table> <thead> <tbody> <tr> <th> <td> <a> <pre class="mermaid">). Không <h1>, không markdown, không code fence. Không sao chép câu từ bài nguồn — viết phân tích hoàn toàn mới.`;

const SENSITIVE_VI = `

QUY TẮC CHỦ ĐỀ NHẠY CẢM (bài này liên quan bạo hành gia đình):
- ĐẦU BÀI, trước phần mở đầu, chèn hộp an toàn dạng <blockquote>: "Nếu bạn đang gặp nguy hiểm, gọi ngay 000. Hỗ trợ nạn nhân bạo hành gia đình 24/7: 1800RESPECT — 1800 737 732 (có thông dịch viên tiếng Việt: 131 450)."
- Tin và xác nhận cảm xúc của người đọc. Có câu "Điều đang xảy ra với bạn không phải lỗi của bạn." Không bao giờ hỏi kiểu "tại sao không rời đi" hay ngầm đổ lỗi.
- Đưa lựa chọn, không ra lệnh: "Bạn có lựa chọn. Một số người chọn... Một số người khác thích..." Cấm viết "bạn phải rời đi", "bạn nên trình báo ngay".
- Khi giải thích thủ tục toà án, dùng ngôn ngữ trung lập các bên ("bên kia"); giữ ví dụ bình tĩnh, tránh miêu tả chi tiết gây tổn thương.`;

function sse(controller: ReadableStreamDefaultController, enc: TextEncoder, data: unknown) {
  controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as GenerateBody;
  const model =
    body.model && FPT_WRITER_MODELS.some((m) => m.id === body.model)
      ? body.model
      : FPT_FAST_MODEL;
  const length = body.length && body.length in LENGTH_SPEC ? body.length : 'medium';

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (d: unknown) => sse(controller, encoder, d);
      try {
        // ── Bước 0: đọc nguồn nếu mode=url ──
        let sourceText = '';
        let sourceTitle = '';
        let sourceUrl = '';
        if (body.mode === 'url') {
          if (!body.url) throw new Error('Thiếu URL nguồn');
          send({ type: 'status', message: 'Đang đọc bài nguồn...' });
          const extracted = await extractContent(body.url);
          sourceText = extracted.text;
          sourceTitle = extracted.title;
          sourceUrl = body.url;
        }

        const topic = body.topic?.trim() || sourceTitle || '';
        if (!topic && !sourceText) throw new Error('Cần có đề bài hoặc URL nguồn');

        // ── Bước 1 (model nhanh): phân tích + dàn ý ──
        send({ type: 'status', message: 'Đang phân tích đề bài và lập dàn ý...' });
        const analysis = await fptJson<{
          title_en: string;
          angle: string;
          outline: string[];
          audience_note: string;
          sensitive: boolean;
        }>({
          model: FPT_FAST_MODEL,
          temperature: 0.2,
          maxTokens: 2000,
          messages: [
            {
              role: 'system',
              content:
                'You plan blog articles for an Australian law firm blog read by the Vietnamese community. Output JSON: {"title_en": string (SEO-friendly, max 70 chars), "angle": string (why this matters to readers, 1-2 sentences), "outline": string[] (4-7 section headings in English, question-style), "audience_note": string (key concerns of Vietnamese-Australian readers on this topic), "sensitive": boolean (true ONLY if the topic involves domestic violence, family violence, abuse or sexual offences)}.',
            },
            {
              role: 'user',
              content: [
                `TOPIC: ${topic}`,
                body.angle ? `YÊU CẦU THÊM TỪ ADMIN: ${body.angle}` : '',
                sourceText ? `SOURCE ARTICLE TEXT:\n${sourceText.slice(0, 20000)}` : '',
              ]
                .filter(Boolean)
                .join('\n\n'),
            },
          ],
          signal: req.signal,
        });
        send({ type: 'analysis', data: analysis, source: { title: sourceTitle, url: sourceUrl } });

        const isSensitive = analysis.sensitive === true;

        // ── Bước 2: viết bản EN (stream) ──
        send({ type: 'status', message: `Đang viết bản tiếng Anh (${model})...` });
        const enMessages: FptMessage[] = [
          { role: 'system', content: WRITER_SYSTEM_EN + (isSensitive ? SENSITIVE_EN : '') },
          {
            role: 'user',
            content: [
              `TOPIC: ${topic}`,
              body.angle ? `EXTRA REQUIREMENTS FROM EDITOR: ${body.angle}` : '',
              analysis.outline?.length ? `SUGGESTED OUTLINE:\n${analysis.outline.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : '',
              analysis.audience_note ? `AUDIENCE NOTE: ${analysis.audience_note}` : '',
              sourceText ? `SOURCE ARTICLE (for facts only — do NOT copy sentences):\n${sourceText.slice(0, 25000)}` : '',
              `TARGET LENGTH: ${LENGTH_SPEC[length].en}.`,
            ]
              .filter(Boolean)
              .join('\n\n'),
          },
        ];
        let contentEn = await fptChat({
          model,
          messages: enMessages,
          temperature: 0.4,
          maxTokens: 16000,
          signal: req.signal,
          onChunk: (t) => send({ type: 'en', text: t }),
        });

        // ── Bước 3: viết bản VI (stream) ──
        send({ type: 'status', message: `Đang viết bản tiếng Việt (${model})...` });
        let contentVi = await fptChat({
          model,
          temperature: 0.4,
          maxTokens: 16000,
          signal: req.signal,
          messages: [
            { role: 'system', content: WRITER_SYSTEM_VI + (isSensitive ? SENSITIVE_VI : '') },
            {
              role: 'user',
              content: [
                `VIẾT BẢN TIẾNG VIỆT cho bài sau. Chủ đề: ${topic}. Độ dài: ${LENGTH_SPEC[length].vi}.`,
                body.angle ? `LƯU Ý THÊM TỪ ADMIN: ${body.angle}` : '',
                analysis.audience_note ? `GHI CHÚ VỀ ĐỘC GIẢ: ${analysis.audience_note}` : '',
                `BẢN TIẾNG ANH (tham khảo cấu trúc và số liệu — viết lại tự nhiên tiếng Việt, không dịch máy):\n${contentEn}`,
              ]
                .filter(Boolean)
                .join('\n\n'),
            },
          ],
          onChunk: (t) => send({ type: 'vi', text: t }),
        });

        // ── Bước 3.5: lint + tự sửa sơ đồ mermaid (1 lượt; vẫn lỗi thì xoá) ──
        const repairCall = async (code: string, errors: string[]): Promise<string> => {
          const fixed = await fptChat({
            model: FPT_FAST_MODEL,
            temperature: 0,
            maxTokens: 2500,
            messages: [
              {
                role: 'system',
                content:
                  'You fix broken Mermaid diagram code. Return ONLY the corrected mermaid code — no prose, no markdown fences.',
              },
              {
                role: 'user',
                content: `Fix this mermaid diagram.\n\nERRORS TO FIX:\n${errors.map((e) => `- ${e}`).join('\n')}\n\nRULES: first line is flowchart TD/TB/LR, timeline or mindmap; ASCII node IDs (A1, B2); every label in double quotes; max 9 nodes.\n\nBROKEN CODE:\n${code}`,
              },
            ],
            signal: req.signal,
          });
          return fixed.replace(/```(?:mermaid)?/g, '').trim();
        };

        const enFix = await repairMermaidInHtml(contentEn, repairCall, (m) => send({ type: 'status', message: m }));
        contentEn = enFix.html;
        const viFix = await repairMermaidInHtml(contentVi, repairCall, (m) => send({ type: 'status', message: m }));
        contentVi = viFix.html;
        if (enFix.report.some((r) => !r.ok) || viFix.report.some((r) => !r.ok)) {
          send({ type: 'status', message: '⚠️ Một sơ đồ không sửa được — đã bỏ để tránh lỗi hiển thị.' });
        }

        // ── Bước 3.7: chuẩn hoá HTML (bọc đoạn trần vào <p>) + ghép footer chuẩn ──
        const footerSource = sourceUrl ? { title: sourceTitle, url: sourceUrl } : undefined;
        contentEn = `${normalizeArticleHtml(stripLegacyFooter(contentEn))}\n${buildArticleFooter('en', footerSource)}`;
        contentVi = `${normalizeArticleHtml(stripLegacyFooter(contentVi))}\n${buildArticleFooter('vi', footerSource)}`;

        // ── Bước 4 (model nhanh): meta + slug ──
        send({ type: 'status', message: 'Đang hoàn thiện tiêu đề, mô tả & slug...' });
        const meta = await fptJson<{
          title_vi: string;
          desc_en: string;
          desc_vi: string;
          slug: string;
          tags: string[];
        }>({
          model: FPT_FAST_MODEL,
          temperature: 0.2,
          maxTokens: 1200,
          messages: [
            {
              role: 'system',
              content:
                'Output JSON: {"title_vi": Vietnamese version of the English title (max 90 chars, natural Vietnamese), "desc_en": SEO meta description in English (STRICT max 180 chars), "desc_vi": SEO meta description in Vietnamese (STRICT max 180 chars), "slug": kebab-case slug from the ENGLISH title (lowercase, hyphens, max 6 words), "tags": 5-7 short topic tags in English}.',
            },
            {
              role: 'user',
              content: `ENGLISH TITLE: ${analysis.title_en}\n\nENGLISH ARTICLE (excerpt):\n${contentEn.slice(0, 4000)}\n\nVIETNAMESE ARTICLE (excerpt):\n${contentVi.slice(0, 3000)}`,
            },
          ],
          signal: req.signal,
        });

        // ── Bước 5 (model nhanh): LLM judge độ dễ đọc ──
        send({ type: 'status', message: 'Đang chấm điểm độ dễ đọc...' });
        let judge: QualityReport['judge'] | undefined;
        try {
          judge = await fptJson<QualityReport['judge']>({
            model: FPT_FAST_MODEL,
            temperature: 0,
            maxTokens: 1500,
            messages: [
              {
                role: 'system',
                content:
                  'You are a strict readability judge for public-facing legal articles read by ordinary people (no legal training). Score each article 0-100 for how easy and pleasant it is to read. Judge the Vietnamese one by popular Vietnamese newspaper standards (not formal legal documents). Output JSON: {"en": {"score": number, "worst": [2-3 hardest sentences, quoted exactly]}, "vi": {"score": number, "worst": [2-3 hardest sentences]}}.',
              },
              {
                role: 'user',
                content: `ENGLISH ARTICLE:\n${stripHtml(contentEn).slice(0, 3500)}\n\nVIETNAMESE ARTICLE:\n${stripHtml(contentVi).slice(0, 3500)}`,
              },
            ],
            signal: req.signal,
          });
        } catch {
          // judge fail không chặn bài — chỉ bỏ qua
        }

        const quality: QualityReport = { ...computeQuality(contentEn, contentVi), judge };

        // ── Bước 6: kiểm tra đạo văn (chỉ mode=url, dùng Vietnamese_Embedding) ──
        if (sourceText) {
          send({ type: 'status', message: 'Đang kiểm tra độ giống nguồn gốc...' });
          try {
            const [vSrc, vVi, vEn] = await fptEmbed([
              sourceText.slice(0, 12000),
              stripHtml(contentVi).slice(0, 12000),
              stripHtml(contentEn).slice(0, 12000),
            ]);
            // Verbatim: overlap shingle 8 từ (phát hiện copy từng chữ, embedding không thấy được)
            const shingles = (t: string) => {
              const words = stripHtml(t).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/);
              const s = new Set<string>();
              for (let i = 0; i + 8 <= words.length; i++) s.add(words.slice(i, i + 8).join(' '));
              return s;
            };
            const srcSh = shingles(sourceText);
            const overlapRatio = (t: string) => {
              const art = [...shingles(t)];
              if (!art.length) return 0;
              const hit = art.filter((s) => srcSh.has(s)).length;
              return Math.round((hit / art.length) * 1000) / 10;
            };
            quality.sourceCheck = {
              simVi: Math.round(cosineSimilarity(vSrc, vVi) * 1000) / 1000,
              simEn: Math.round(cosineSimilarity(vSrc, vEn) * 1000) / 1000,
              verbatimVi: overlapRatio(contentVi),
              verbatimEn: overlapRatio(contentEn),
            };
            quality.sourceCheck.flag =
              quality.sourceCheck.verbatimVi > 10 || quality.sourceCheck.verbatimEn > 10 || quality.sourceCheck.simVi > 0.96;
          } catch {
            // embedding fail không chặn bài
          }
        }

        // ── Bước 7: gợi ý internal-link (bài đã đăng liên quan chủ đề) ──
        let related: { title: string; slug: string }[] = [];
        try {
          await connectDB();
          const words = new Set(
            `${analysis.title_en} ${topic}`
              .toLowerCase()
              .split(/\W+/)
              .filter((w) => w.length > 4)
          );
          const posts = (await CaseStudy.find({ isActive: true })
            .select('title slug')
            .lean()) as unknown as Array<{ title?: { en?: string; vi?: string }; slug: string }>;
          related = posts
            .map((p) => {
              const t = `${p.title?.en || ''} ${p.title?.vi || ''}`.toLowerCase();
              let score = 0;
              words.forEach((w) => {
                if (t.includes(w)) score++;
              });
              return { title: p.title?.vi || p.title?.en || '', slug: p.slug, score };
            })
            .filter((p) => p.score >= 2)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(({ title, slug }) => ({ title, slug }));
        } catch {
          // không chặn vì gợi ý link
        }

        send({
          type: 'done',
          data: {
            titleEn: analysis.title_en,
            titleVi: meta.title_vi,
            descEn: meta.desc_en,
            descVi: meta.desc_vi,
            slug: meta.slug,
            tags: meta.tags,
            contentEn,
            contentVi,
            quality,
            related,
            source: { title: sourceTitle, url: sourceUrl },
          },
        });
        controller.close();
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Lỗi không xác định';
        try {
          send({ type: 'error', message });
          controller.close();
        } catch {
          // stream đã đóng
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
