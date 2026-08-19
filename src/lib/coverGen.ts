/**
 * Sinh ảnh bìa poster cho bài viết — kiến trúc 3 lớp (theo research 2026-08):
 *   1. AI sinh ảnh nền đúng chủ đề (Pollinations/FLUX — free; đổi provider qua env)
 *   2. satori render overlay (scrim + tiêu đề NFC tiếng Việt + logo Solis chip trắng)
 *   3. sharp composite → bộ 3 ảnh: main 1200×675 · OG 1200×630 · feed 1080×1350
 *
 * 3 template bố cục + tự nhận nền sáng/tối (đo luminance bằng sharp).
 * Logo và chữ KHÔNG bao giờ do AI vẽ (AI méo logo + sai dấu tiếng Việt).
 */

import { readFile } from 'fs/promises';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { fptJson, FPT_FAST_MODEL } from '@/lib/fpt';

const GOLD = '#d5aa6d';

export const SIZES = {
  main: { w: 1200, h: 675 },
  og: { w: 1200, h: 630 },
  feed: { w: 1080, h: 1350 },
} as const;

export type SizeKey = keyof typeof SIZES;

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
            'You write prompts for a text-to-image model to create an elegant blog cover for an Australian law firm (Solis Lawyers). Output JSON: {"prompt": string}. The prompt must: describe ONLY symbols/scenes/mood (scales of justice, courthouse, family silhouettes, open law book, handshake, protective hands, Australian landmarks, desk scenes) — NEVER the offence or graphic content; muted warm brown/gold palette; soft cinematic light; professional editorial photography or refined illustration style; low detail where text will sit; explicitly end with: "no text, no letters, no words, no logos, no watermark". Max 60 words.',
        },
        { role: 'user', content: `ARTICLE TOPIC (Vietnamese): ${topic}${titleEn ? `\nENGLISH TITLE: ${titleEn}` : ''}` },
      ],
    });
    if (r.prompt && r.prompt.length > 30) return r.prompt;
  } catch {
    // fallback dưới
  }
  return `elegant law firm blog cover, scales of justice and open law book on a dark wooden desk, warm golden hour light, muted brown and gold tones, professional photography, low detail areas, no text, no letters, no logos, no watermark`;
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

// ── Đo độ sáng nền → chọn theme chữ ──
async function detectLightBackground(bg: Buffer): Promise<boolean> {
  try {
    const stats = await sharp(bg).stats();
    const [r, g, b] = stats.channels.map((c) => c.mean);
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    return luma > 165; // nền sáng
  } catch {
    return false;
  }
}

interface Theme {
  scrim: string;
  bandScrim: string;
  fullOverlay: string;
  title: string;
  subtitle: string;
}

const DARK: Theme = {
  scrim:
    'linear-gradient(100deg, rgba(15,23,42,0.86) 0%, rgba(15,23,42,0.62) 42%, rgba(15,23,42,0.10) 72%, rgba(15,23,42,0) 100%)',
  bandScrim: 'linear-gradient(0deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.75) 60%, rgba(15,23,42,0) 100%)',
  fullOverlay: 'rgba(15,23,42,0.62)',
  title: '#f8fafc',
  subtitle: '#ffffff',
};

const LIGHT: Theme = {
  scrim:
    'linear-gradient(100deg, rgba(248,250,252,0.92) 0%, rgba(248,250,252,0.72) 42%, rgba(248,250,252,0.10) 72%, rgba(248,250,252,0) 100%)',
  bandScrim: 'linear-gradient(0deg, rgba(248,250,252,0.94) 0%, rgba(248,250,252,0.8) 60%, rgba(248,250,252,0) 100%)',
  fullOverlay: 'rgba(248,250,252,0.7)',
  title: '#0f172a',
  subtitle: '#1e293b',
};

const flex = (extra?: Record<string, unknown>) => ({ display: 'flex', ...extra });

async function renderOverlayElement(opts: {
  width: number;
  height: number;
  title: string;
  label: string;
  logo: string;
  template: 1 | 2 | 3;
  light: boolean;
}) {
  const { width: W, height: H, title, label, logo, template, light } = opts;
  const theme = light ? LIGHT : DARK;
  const safeTitle = title.normalize('NFC').trim().slice(0, 110);
  const safeLabel = label.normalize('NFC').trim().slice(0, 40).toUpperCase();
  const scale = W >= 1080 ? 1 : 0.9;

  const logoChip = (size = 96) => ({
    type: 'div',
    props: {
      style: flex({
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.23),
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
      }),
      children: [{ type: 'img', props: { src: logo, width: Math.round(size * 0.75), height: Math.round(size * 0.75) } }],
    },
  });

  const brandText = (align: 'left' | 'center' = 'left') => ({
    type: 'div',
    props: {
      style: flex({ flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start' }),
      children: [
        {
          type: 'div',
          props: {
            style: flex({ fontSize: Math.round(30 * scale), fontWeight: 700, color: theme.subtitle, letterSpacing: 0.5 }),
            children: 'SOLIS LAWYERS',
          },
        },
        {
          type: 'div',
          props: {
            style: flex({ fontSize: Math.round(17 * scale), color: GOLD, letterSpacing: 2.5 }),
            children: 'AUSTRALIAN LAW · TIẾNG VIỆT',
          },
        },
      ],
    },
  });

  const labelRow = () => ({
    type: 'div',
    props: {
      style: flex({ alignItems: 'center', gap: 12 }),
      children: [
        { type: 'div', props: { style: flex({ width: 42, height: 4, backgroundColor: GOLD, borderRadius: 2 }) } },
        {
          type: 'div',
          props: {
            style: flex({ fontSize: Math.round(22 * scale), fontWeight: 700, color: GOLD, letterSpacing: 3 }),
            children: safeLabel,
          },
        },
      ],
    },
  });

  const headline = (fontSize: number, center = false) => ({
    type: 'div',
    props: {
      style: flex({
        fontSize,
        lineHeight: 1.22,
        fontWeight: 700,
        color: theme.title,
        textAlign: center ? ('center' as const) : undefined,
        textShadow: light ? 'none' : '0 2px 18px rgba(0,0,0,0.45)',
      }),
      children: safeTitle,
    },
  });

  let element: object;
  if (template === 2) {
    // Template 2: dải gradient dưới đáy, chữ bên trái, logo góc trên phải
    element = {
      type: 'div',
      props: {
        style: flex({
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          padding: Math.round(52 * scale),
          backgroundImage: theme.bandScrim,
        }),
        children: [
          logoChip(84),
          {
            type: 'div',
            props: {
              style: flex({ flexDirection: 'column', alignSelf: 'flex-start', maxWidth: Math.round(800 * scale), gap: 14 }),
              children: [labelRow(), headline(Math.round(52 * scale))],
            },
          },
        ],
      },
    };
  } else if (template === 3) {
    // Template 3: phủ tối toàn ảnh, logo + chữ căn giữa
    element = {
      type: 'div',
      props: {
        style: flex({
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: Math.round(64 * scale),
          gap: Math.round(36 * scale),
          backgroundColor: theme.fullOverlay,
        }),
        children: [
          logoChip(110),
          brandText('center'),
          {
            type: 'div',
            props: {
              style: flex({ flexDirection: 'column', alignItems: 'center', maxWidth: Math.round(860 * scale), gap: 16 }),
              children: [labelRow(), headline(Math.round(56 * scale), true)],
            },
          },
        ],
      },
    };
  } else {
    // Template 1 (mặc định): gradient trái, logo trên trái, chữ dưới trái
    element = {
      type: 'div',
      props: {
        style: flex({
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: Math.round(56 * scale),
          backgroundImage: theme.scrim,
        }),
        children: [
          {
            type: 'div',
            props: {
              style: flex({ alignItems: 'center', gap: 18 }),
              children: [logoChip(96), brandText()],
            },
          },
          {
            type: 'div',
            props: {
              style: flex({ flexDirection: 'column', maxWidth: Math.round(760 * scale), gap: 16 }),
              children: [labelRow(), headline(Math.round(54 * scale))],
            },
          },
        ],
      },
    };
  }

  const svg = await satori(element as never, {
    width: W,
    height: H,
    fonts: await getFonts(),
  });
  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng());
}

/** Composite 1 kích thước */
async function composeOne(
  background: Buffer,
  size: { w: number; h: number },
  title: string,
  label: string,
  logo: string,
  template: 1 | 2 | 3,
  light: boolean
): Promise<Buffer> {
  const overlay = await renderOverlayElement({
    width: size.w,
    height: size.h,
    title,
    label,
    logo,
    template,
    light,
  });
  return sharp(background)
    .resize(size.w, size.h, { fit: 'cover', position: 'attention' })
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

export interface CoverSet {
  main: Buffer;
  og: Buffer;
  feed: Buffer;
  template: 1 | 2 | 3;
  light: boolean;
}

/** Pipeline đầy đủ: nền AI → bộ 3 ảnh (main 16:9 · OG · feed 4:5) */
export async function generateCoverSet(opts: {
  topic: string;
  title: string;
  categoryLabel?: string;
  titleEn?: string;
  seed?: number;
  template?: 1 | 2 | 3;
  onStatus?: (m: string) => void;
}): Promise<CoverSet> {
  opts.onStatus?.('Đang dựng prompt ảnh theo chủ đề...');
  const prompt = await buildImagePrompt(opts.topic, opts.titleEn);
  opts.onStatus?.('Đang sinh ảnh nền bằng AI...');
  const bg = await generateBackground(prompt, opts.seed);
  opts.onStatus?.('Đang ghép logo + tiêu đề...');
  const light = await detectLightBackground(bg);
  const template = opts.template ?? (((opts.seed ?? 1) % 3) + 1) as 1 | 2 | 3;
  const logo = await getLogoDataUri();
  const label = opts.categoryLabel || 'Solis Lawyers';

  const [main, og, feed] = await Promise.all([
    composeOne(bg, SIZES.main, opts.title, label, logo, template, light),
    composeOne(bg, SIZES.og, opts.title, label, logo, template, light),
    composeOne(bg, SIZES.feed, opts.title, label, logo, template, light),
  ]);
  opts.onStatus?.('Hoàn tất bộ ảnh.');
  return { main, og, feed, template, light };
}
