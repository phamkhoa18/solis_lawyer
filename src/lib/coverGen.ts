/**
 * Sinh ảnh bìa poster cho bài viết — kiến trúc 3 lớp (theo research 2026-08):
 *   1. AI sinh ảnh nền đúng chủ đề (Pollinations/FLUX — free, không cần key;
 *      đổi provider qua env IMAGE_API_TEMPLATE nếu sau này dùng Ideogram/Cloudflare)
 *   2. satori render overlay (scrim gradient + tiêu đề NFC tiếng Việt +
 *      logo Solis trên chip trắng) — chữ thành vector path → dấu Việt chuẩn 100%
 *   3. sharp composite nền + overlay → PNG 1200×675 → lưu public/uploads
 *
 * Logo và chữ KHÔNG bao giờ do AI vẽ (AI méo logo + sai dấu tiếng Việt).
 */

import { readFile } from 'fs/promises';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { fptJson, FPT_FAST_MODEL } from '@/lib/fpt';

const W = 1200;
const H = 675;
const GOLD = '#d5aa6d';

let fontsCache: Array<{ name: string; data: Buffer; weight: 400 | 700; style: 'normal' }> | null = null;
async function getFonts() {
  if (!fontsCache) {
    const dir = path.join(process.cwd(), 'public', 'fonts', 'bevietnampro');
    const [regular, bold] = await Promise.all([
      readFile(path.join(dir, 'BeVietnamPro-Regular.ttf')),
      readFile(path.join(dir, 'BeVietnamPro-Bold.ttf')),
    ]);
    fontsCache = [
      { name: 'Be Vietnam Pro', data: regular, weight: 400, style: 'normal' },
      { name: 'Be Vietnam Pro', data: bold, weight: 700, style: 'normal' },
    ];
  }
  return fontsCache;
}

let logoCache: string | null = null;
async function getLogoDataUri() {
  if (!logoCache) {
    const buf = await readFile(path.join(process.cwd(), 'public', 'images', 'logo', 'solis-mark.png'));
    logoCache = `data:image/png;base64,${buf.toString('base64')}`;
  }
  return logoCache;
}

// ── Bước 1: đề bài → prompt mô tả cảnh (bằng LLM FPT có sẵn) ──
export async function buildImagePrompt(topic: string, titleEn?: string): Promise<string> {
  try {
    const r = await fptJson<{ prompt: string }>({
      model: FPT_FAST_MODEL,
      temperature: 0.3,
      maxTokens: 300,
      messages: [
        {
          role: 'system',
          content:
            'You write prompts for a text-to-image model to create an elegant blog cover for an Australian law firm (Solis Lawyers). Output JSON: {"prompt": string}. The prompt must: describe ONLY symbols/scenes/mood (scales of justice, courthouse, family silhouettes, open law book, handshake, protective hands, Australian landmarks, desk scenes) — NEVER the offence or graphic content; muted warm brown/gold palette; soft cinematic light; professional editorial photography or refined illustration style; 60% of the left side low-detail (for text overlay); explicitly end with: "no text, no letters, no words, no logos, no watermark". Max 60 words.',
        },
        { role: 'user', content: `ARTICLE TOPIC (Vietnamese): ${topic}${titleEn ? `\nENGLISH TITLE: ${titleEn}` : ''}` },
      ],
    });
    if (r.prompt && r.prompt.length > 30) return r.prompt;
  } catch {
    // fallback dưới
  }
  return `elegant law firm blog cover, scales of justice and open law book on a dark wooden desk, warm golden hour light, muted brown and gold tones, professional photography, left side low detail, no text, no letters, no logos, no watermark`;
}

// ── Bước 2: sinh ảnh nền (Pollinations — free; provider pluggable qua env) ──
export async function generateBackground(prompt: string, seed?: number): Promise<Buffer> {
  const s = seed ?? Math.floor(Math.random() * 1_000_000);
  const template =
    process.env.IMAGE_API_TEMPLATE ||
    'https://image.pollinations.ai/prompt/{prompt}?width=1200&height=675&nologo=true&model=flux&seed={seed}';
  const url = template
    .replace('{prompt}', encodeURIComponent(prompt))
    .replace('{seed}', String(s));

  const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`Image API lỗi ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) throw new Error('Image API trả ảnh rỗng');
  return buf;
}

// ── Bước 3+4: overlay (scrim + logo chip + tiêu đề + nhãn) → composite ──
export async function renderCover(
  background: Buffer,
  title: string,
  categoryLabel?: string
): Promise<Buffer> {
  const [fonts, logo] = await Promise.all([getFonts(), getLogoDataUri()]);

  // NFC: dấu tiếng Việt thành 1 codepoint — render chuẩn tuyệt đối
  const safeTitle = title.normalize('NFC').trim().slice(0, 110);
  const label = (categoryLabel || 'Solis Lawyers').normalize('NFC').trim().slice(0, 40).toUpperCase();

  const element = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 56,
        backgroundImage:
          'linear-gradient(100deg, rgba(15,23,42,0.86) 0%, rgba(15,23,42,0.62) 42%, rgba(15,23,42,0.10) 72%, rgba(15,23,42,0) 100%)',
      },
      children: [
        // Logo trên chip trắng bo góc — logo đen/đỏ nhìn rõ trên mọi nền
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: 96,
                    height: 96,
                    borderRadius: 22,
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
                  },
                  children: [
                    { type: 'img', props: { src: logo, width: 72, height: 72 } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontSize: 30, fontWeight: 700, color: '#ffffff', letterSpacing: 0.5 },
                        children: 'SOLIS LAWYERS',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontSize: 17, color: GOLD, letterSpacing: 2.5 },
                        children: 'AUSTRALIAN LAW · TIẾNG VIỆT',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Khối chữ dưới
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', maxWidth: 760, gap: 16 },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', width: 42, height: 4, backgroundColor: GOLD, borderRadius: 2 },
                        children: [],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontSize: 22, fontWeight: 700, color: GOLD, letterSpacing: 3 },
                        children: label,
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: 54,
                    lineHeight: 1.22,
                    fontWeight: 700,
                    color: '#f8fafc',
                    textShadow: '0 2px 18px rgba(0,0,0,0.45)',
                  },
                  children: safeTitle,
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(element as never, { width: W, height: H, fonts });
  const overlayPng = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();

  // Composite: nền (resize/cover 1200×675) + overlay full
  return sharp(background)
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .composite([{ input: overlayPng, top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// ── Pipeline đầy đủ ──
export async function generateCover(opts: {
  topic: string;
  title: string;
  categoryLabel?: string;
  titleEn?: string;
  seed?: number;
  onStatus?: (m: string) => void;
}): Promise<Buffer> {
  opts.onStatus?.('Đang dựng prompt ảnh theo chủ đề...');
  const prompt = await buildImagePrompt(opts.topic, opts.titleEn);
  opts.onStatus?.('Đang sinh ảnh nền bằng AI...');
  const bg = await generateBackground(prompt, opts.seed);
  opts.onStatus?.('Đang ghép logo + tiêu đề...');
  return renderCover(bg, opts.title, opts.categoryLabel);
}
