/**
 * Xưởng bài hằng ngày: 3 slot (hình sự · gia đình · phân tích án lệ học thuật)
 * Chạy cron 7h sáng hoặc /now từ Telegram. Flow mỗi slot:
 *   chọn đề từ nguồn xịn (SourceItem) → sinh bài (internal API) → ảnh bìa
 *   → lưu BotPost pending → gửi Telegram (ảnh + VI + EN + nút điều khiển)
 * Duyệt trên Telegram → publishPost() → tự đăng + gửi link thành phẩm.
 */

import { SignJWT } from 'jose';
import connectDB from '@/lib/dbConnect';
import BotPost, { IBotPost } from '@/models/BotPost';
import BotSetting from '@/models/BotSetting';
import SourceItem from '@/models/SourceItem';
import { sendMessage, sendPhotoBuffer, TgButton, esc } from '@/lib/telegram';
import { articleHtmlToTelegram } from '@/lib/htmlToTelegram';

const BASE = process.env.SITE_URL || 'http://localhost:3000';
const MODEL = 'DeepSeek-V4-Flash';

export type SlotPlan = 'criminal' | 'family' | 'academic';

export const SLOTS: Record<SlotPlan, {
  label: string;
  emoji: string;
  categorySlug: string;
  categoryName: { en: string; vi: string };
  categoryLabel: string;
  keywords: RegExp;
  angle?: string;
  length: 'short' | 'medium' | 'long';
}> = {
  criminal: {
    label: 'Luật Hình Sự',
    emoji: '⚖️',
    categorySlug: 'criminal-law',
    categoryName: { en: 'Criminal Law', vi: 'Luật Hình Sự' },
    categoryLabel: 'Luật Hình Sự',
    keywords: /(police|court|jail|prison|sentenc|bail|assault|charg|drug|theft|fraud|murder|avo|advo|offence|offense|crime|criminal|coercive|violence|dvo)/i,
    length: 'medium',
  },
  family: {
    label: 'Luật Gia Đình',
    emoji: '👨‍👩‍👧',
    categorySlug: 'family-law',
    categoryName: { en: 'Family Law', vi: 'Luật Gia Đình' },
    categoryLabel: 'Luật Gia Đình',
    keywords: /(family|divorce|custody|parenting|child|children|property settlement|de facto|marriage|spousal|separation|superannuation)/i,
    length: 'medium',
  },
  academic: {
    label: 'Phân Tích Án Lệ',
    emoji: '📚',
    categorySlug: 'case-analysis',
    categoryName: { en: 'Case Analysis', vi: 'Phân Tích Án Lệ' },
    categoryLabel: 'Phân Tích Án Lệ',
    keywords: /(\[\d{4}\]|v the king|v r\b|high court|full court|court of appeal|precedent|ratio|judgment)/i,
    angle:
      'Bài phân tích án lệ có chiều sâu học thuật: nêu bối cảnh vụ án, cấp xét xử, tóm tắt diễn biến, ratio decidendi (lí do cốt lõi của phán quyết), ý nghĩa với thực tiễn và người hành luật tại Úc. Trích dẫn case citation đúng định dạng như [2025] HCA 12. Giữ ngôn từ vẫn gần gũi dễ hiểu cho độc giả phổ thông.',
    length: 'medium',
  },
};

/** Đề bài dự phòng khi nguồn không có tin phù hợp — xoay vòng theo ngày trong năm */
const FALLBACK_TOPICS: Record<SlotPlan, string[]> = {
  criminal: [
    'Coercive control — kiểm soát tâm lý trở thành tội danh tại NSW từ 7/2024: những hành vi nào có thể đi tù',
    'Bị cảnh sát chặn xe tại Úc: quyền của bạn — hướng dẫn cho người Việt',
    'Bail (bảo lãnh) tại NSW sau cải cách 2024-2025: show cause và unacceptable risk',
    'Đồng thuận tình dục (affirmative consent) và stealthing: luật NSW từ 2022',
    'Vòng đeo GPS: theo dõi điện tử cho bị cáo bạo hành gia đình tại NSW và QLD',
    'ACT phi hình sự hoá ma túy số lượng nhỏ — nếu bị bắt thì chuyện gì xảy ra',
  ],
  family: [
    'Ly hôn Úc: "chia đôi 50/50" là hiểu lầm — thay đổi quyền nuôi con từ 6/5/2024',
    'Vợ/chồng giấu tài sản: nghĩa vụ khai báo mới trong Luật Gia đình từ 10/6/2025',
    'Bạo hành gia đình giờ thay đổi khoản chia tài sản: Kennon adjustment được luật hoá',
    'Ai được giữ thú cưng khi chia tay? Thú cưng là tài sản theo sửa đổi 2024',
    'Thỏa thuận tài chính trước hôn nhân (BFA) có bị hủy không? Bài học Thorne v Kennedy',
    'Ly hôn khi đang giữ visa partner: cạm bẫy luật gia đình và di trú',
  ],
  academic: [
    'Bài học từ phán quyết Thorne v Kennedy [2017] HCA 49: khi nào thỏa thuận tài chính bị hủy vì áp lực',
    'Kennon adjustment: từ án lệ đến luật thành văn — bạo hành gia đình trong chia tài sản Úc',
    'Tòa Cấp cao Úc và mục 19ALB Crimes Act: cơ hội ân xá sớm không dùng để giảm án',
    'Nguyên tắc "lợi ích tốt nhất của con" trong án luật gia đình Úc: từ luật thành văn đến án lệ',
    'Affirmative consent trong án lệ NSW: thay đổi chuẩn chứng minh sau 2022',
  ],
};

// ── internal auth: service JWT đi qua middleware như admin ──
let serviceCookieCache: { cookie: string; exp: number } | null = null;
async function serviceCookie(): Promise<string> {
  if (serviceCookieCache && serviceCookieCache.exp > Date.now() + 3600_000) return serviceCookieCache.cookie;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
  if (!process.env.JWT_SECRET) throw new Error('Thiếu JWT_SECRET');
  const token = await new SignJWT({ userId: 'daily-pipeline', email: 'bot@solis', name: 'Daily Bot', role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
  serviceCookieCache = { cookie: `admin_token=${token}`, exp: Date.now() + 29 * 24 * 3600_000 };
  return serviceCookieCache.cookie;
}

async function internal(path: string, init: RequestInit = {}): Promise<Response> {
  const cookie = await serviceCookie();
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Cookie: cookie, ...(init.headers || {}) },
    signal: AbortSignal.timeout(600000),
  });
}

// ── generate qua internal API, parse SSE đến done ──
interface GenResult {
  titleEn: string;
  titleVi: string;
  descEn: string;
  descVi: string;
  slug: string;
  tags: string[];
  contentEn: string;
  contentVi: string;
  quality?: {
    en?: { flesch?: number; grade?: number };
    vi?: { avgSyllPerSentence?: number };
    judge?: { en?: { score?: number }; vi?: { score?: number } };
    sourceCheck?: { flag?: boolean };
  };
}

export async function runGenerate(body: Record<string, unknown>): Promise<GenResult> {
  const res = await internal('/api/ai/generate', { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok || !res.body) throw new Error(`generate lỗi ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let done: GenResult | null = null;
  outer: while (true) {
    const { done: finished, value } = await reader.read();
    if (finished) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data:')) continue;
      let evt: { type?: string; data?: GenResult; message?: string };
      try {
        evt = JSON.parse(line.slice(5).trim());
      } catch {
        continue; // chunk lỗi format — bỏ qua
      }
      if (evt.type === 'done') {
        done = evt.data as GenResult;
        break outer;
      }
      if (evt.type === 'error') throw new Error(evt.message);
    }
  }
  if (!done) throw new Error('generate không trả kết quả');
  return done;
}

export async function getAdminChatId(): Promise<string | null> {
  const s = await BotSetting.findOne({ key: 'admin' });
  return s?.adminChatId || null;
}

// ── chọn đề: ưu tiên tin mới từ nguồn (đã có DB SourceItem), fallback xoay vòng ──
async function pickTopic(plan: SlotPlan): Promise<{ topic: string; sourceUrl?: string; sourceTitle?: string }> {
  const slot = SLOTS[plan];
  try {
    // Academic: ưu tiên tin có case citation
    const filter: Record<string, unknown> = { status: 'new' };
    if (plan === 'family') filter.sourceId = { $in: ['mondaq-family', 'lsj'] };
    const candidates = await SourceItem.find(filter).sort({ createdAt: -1 }).limit(120);
    // bỏ tin video/ảnh (không có text để AI đọc) và tin quá ngắn
    const readable = candidates.filter(
      (c) => !/video|watch live|photos|photo|\bopinion\b/i.test(c.title) && (c.snippet || '').length > 60
    );
    // atomic: nếu 2 tiến trình cùng quét, chỉ 1 bên nhận được bài
    for (const c of readable) {
      if (!slot.keywords.test(`${c.title} ${c.snippet || ''}`) || c.title.length <= 25) continue;
      const claimed = await SourceItem.findOneAndUpdate(
        { _id: c._id, status: 'new' },
        { $set: { status: 'dismissed' } },
        { new: true }
      );
      if (claimed) return { topic: claimed.title, sourceUrl: claimed.link, sourceTitle: claimed.title };
    }
  } catch {
    /* fallback */
  }
  const bank = FALLBACK_TOPICS[plan];
  const dayIndex = Math.floor(Date.now() / 86400000) % bank.length;
  return { topic: bank[dayIndex] };
}

// ── gửi bài lên Telegram ──
export async function deliverPostToTelegram(post: IBotPost): Promise<{ chatId: string; messageId: number } | null> {
  const chatId = await getAdminChatId();
  if (!chatId || !post.article) return null;
  const slot = SLOTS[post.plan as SlotPlan];
  const a = post.article;
  if (!a) return null;
  const q = a.quality as GenResult['quality'] | undefined;
  const judge = q?.judge;

  const coverUrl = post.coverUrl?.startsWith('http') ? post.coverUrl : `${BASE}${post.coverUrl || '/images/logo/solislaw.png'}`;

  const header =
    `${slot.emoji} <b>${slot.label}</b> · ${new Date().toLocaleDateString('vi-VN')}${post.version > 1 ? ` · <b>🔁 PHIÊN BẢN ${post.version}</b>` : ''}\n\n` +
    `<b>${esc(a.titleVi)}</b>\n<i>${esc(a.titleEn)}</i>\n\n` +
    `${esc(a.descVi)}\n\n` +
    (post.feedback && post.version > 1
      ? `✏️ <b>Đã sửa theo góp ý:</b> <i>${esc(post.feedback.slice(0, 200))}</i>\n\n`
      : '') +
    (judge
      ? `📊 Chất lượng: Flesch <b>${q?.en?.flesch ?? '?'}</b> · Judge EN <b>${judge.en?.score ?? '?'}/100</b> · VI <b>${judge.vi?.score ?? '?'}/100</b>` +
        (q?.sourceCheck?.flag ? '\n⚠️ <b>Cảnh báo đạo văn — nên đọc kĩ trước khi duyệt</b>' : '') +
        '\n'
      : '');

  // 1) Ảnh bìa (upload multipart — Telegram không đọc được URL localhost) + header + nút điều khiển
  const buttons: TgButton[][] = [
    [
      { text: '✅ Duyệt & Đăng ngay', callback_data: `ap:${post._id}` },
      { text: '✏️ Yêu cầu sửa', callback_data: `fb:${post._id}` },
    ],
    [{ text: '🗑 Huỷ hẳn bài này', callback_data: `sk:${post._id}` }],
  ];
  let controlMessageId: number | null = null;
  try {
    // server tự fetch ảnh từ chính nó được (localhost OK phía server)
    const imgRes = await fetch(coverUrl, { signal: AbortSignal.timeout(30000) });
    if (imgRes.ok) {
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const photoMsg = await sendPhotoBuffer(chatId, buf, header, buttons);
      if (photoMsg) controlMessageId = photoMsg.message_id;
    }
  } catch {
    /* ảnh lỗi → gửi text */
  }
  if (controlMessageId === null) {
    const txt = await sendMessage(chatId, header, buttons);
    if (!txt) return null;
    controlMessageId = txt.message_id;
  }

  // 2) Toàn văn VI rồi EN — LUÔN gửi kể cả khi ảnh lỗi
  const viChunks = articleHtmlToTelegram(a.contentVi);
  for (let i = 0; i < viChunks.length; i++) {
    await sendMessage(chatId, `${i === 0 ? '🇻🇳 <b>BẢN TIẾNG VIỆT</b>\n\n' : ''}${viChunks[i]}`);
  }

  const enChunks = articleHtmlToTelegram(a.contentEn);
  for (let i = 0; i < enChunks.length; i++) {
    await sendMessage(chatId, `${i === 0 ? '🇬🇧 <b>ENGLISH VERSION</b>\n\n' : ''}${enChunks[i]}`);
  }
  return { chatId, messageId: controlMessageId };
}

// ── đăng bài sau khi duyệt ──
export async function publishPost(post: IBotPost): Promise<string> {
  const a = post.article;
  if (!a) throw new Error('Bài chưa có nội dung');
  const slot = SLOTS[post.plan as SlotPlan];

  // danh mục (tự tạo nếu chưa có)
  const catRes = await internal('/api/categories');
  const cats = (await catRes.json()).data as Array<{ _id: string; slug?: string; name?: { en?: string; vi?: string } }>;
  let cat = cats.find((c) => c.slug === slot.categorySlug || /hình sự|criminal|gia đình|family|án lệ|case/i.test(c.name?.vi || c.name?.en || ''));
  if (!cat) {
    const created = await internal('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: slot.categoryName, slug: slot.categorySlug, isActive: true }),
    });
    cat = ((await created.json()).data as { _id: string }) || undefined;
  }
  if (!cat) throw new Error('Không tạo được danh mục');

  const meRes = await internal('/api/auth/me');
  // service JWT không có trong users collection → dùng admin thật đầu tiên
  const usersRes = await internal('/api/users');
  const users = (await usersRes.json()).data as Array<{ _id: string; role?: string }>;
  void meRes;
  const author = users.find((u) => u.role === 'admin') || users[0];
  if (!author) throw new Error('Không tìm thấy tác giả (user) trong hệ thống');

  let slug = a.slug;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await internal('/api/casestudies', {
      method: 'POST',
      body: JSON.stringify({
        title: { en: a.titleEn, vi: a.titleVi },
        description: { en: (a.descEn || '').slice(0, 199), vi: (a.descVi || '').slice(0, 199) },
        content: { en: a.contentEn, vi: a.contentVi },
        slug,
        image: post.coverUrl || '/images/logo/solislaw.png',
        category: cat._id,
        user: author._id,
        isActive: true,
        publishedAt: new Date(),
      }),
    });
    const j = await res.json();
    if (j.success) {
      post.casestudySlug = slug;
      post.status = 'approved';
      post.publishedAt = new Date();
      await post.save();
      return `${BASE}/case-studies/${slug}`;
    }
    if ((j.message || '').includes('Slug')) slug = `${a.slug}-${attempt + 2}`;
    else throw new Error(j.message || 'Lưu bài lỗi');
  }
  throw new Error('Slug trùng quá 3 lần');
}

// ── chạy pipeline một slot ──
function vnDateKey(d = new Date()): string {
  // ngày theo giờ Việt Nam (UTC+7) — tránh lệch ngày với cron 7h VN
  return new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
}

async function runSlot(plan: SlotPlan, force: boolean): Promise<{ status: 'sent' | 'queued' | 'skipped' | 'error'; detail?: string }> {
  await connectDB();
  const today = vnDateKey();
  const slot = SLOTS[plan];

  if (!force) {
    const existing = await BotPost.findOne({ runDate: today, plan, status: { $in: ['pending', 'approved'] } });
    if (existing) return { status: 'skipped', detail: 'hôm nay đã chạy slot này' };
  }

  const picked = await pickTopic(plan);
  const post = await BotPost.create({
    plan,
    topic: picked.topic,
    sourceUrl: picked.sourceUrl,
    sourceTitle: picked.sourceTitle,
    angle: slot.angle,
    categorySlug: slot.categorySlug,
    runDate: today,
    status: 'pending',
  });

  try {
    const data = await runGenerate({
      mode: picked.sourceUrl ? 'url' : 'topic',
      topic: picked.topic,
      url: picked.sourceUrl,
      angle: slot.angle,
      model: MODEL,
      length: slot.length,
    });
    post.article = {
      titleEn: data.titleEn,
      titleVi: data.titleVi,
      descEn: data.descEn,
      descVi: data.descVi,
      slug: data.slug,
      tags: data.tags,
      contentEn: data.contentEn,
      contentVi: data.contentVi,
      quality: data.quality as unknown as Record<string, unknown>,
    };

    // ảnh bìa
    try {
      const coverRes = await internal('/api/ai/cover', {
        method: 'POST',
        body: JSON.stringify({
          topic: picked.topic,
          titleVi: data.titleVi,
          titleEn: data.titleEn,
          categoryLabel: slot.categoryLabel,
          variant: Date.now() % 100000,
        }),
      });
      const cj = await coverRes.json();
      if (cj.success) post.coverUrl = cj.url;
    } catch {
      /* ảnh fail vẫn gửi bài */
    }
    await post.save();

    const delivered = await deliverPostToTelegram(post);
    if (delivered) {
      post.tgChatId = delivered.chatId;
      post.tgControlMessageId = delivered.messageId;
      post.sentAt = new Date();
      await post.save();
      return { status: 'sent' };
    }
    return { status: 'queued', detail: 'admin chưa /start bot — bài đang chờ, sẽ tự gửi khi bot được kích hoạt' };
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'lỗi';
    console.error(`Daily slot "${plan}" lỗi:`, detail);
    post.status = 'failed';
    await post.save();
    return { status: 'error', detail };
  }
}

/** Gửi lại các bài pending chưa gửi (khi admin /start bot lần đầu) */
export async function flushUndeliveredPosts(): Promise<number> {
  const posts = await BotPost.find({ status: 'pending', sentAt: { $exists: false } }).sort({ createdAt: 1 }).limit(10);
  let n = 0;
  for (const post of posts) {
    try {
      const delivered = await deliverPostToTelegram(post);
      if (delivered) {
        post.tgChatId = delivered.chatId;
        post.tgControlMessageId = delivered.messageId;
        post.sentAt = new Date();
        await post.save();
        n++;
      }
    } catch {
      /* thử bài sau */
    }
  }
  return n;
}

export async function runDailyPipeline(opts?: { slots?: SlotPlan[]; force?: boolean }) {
  const plans = opts?.slots || (['criminal', 'family', 'academic'] as SlotPlan[]);
  const results: Record<string, unknown> = {};
  for (const plan of plans) {
    results[plan] = await runSlot(plan, !!opts?.force);
  }
  return results;
}

/**
 * Viết lại bài theo feedback của admin (lí do + hướng sửa).
 * Feedback được ghép vào prompt như yêu cầu thêm ưu tiên — ảnh bìa cũng làm mới.
 */
export async function regeneratePost(post: IBotPost, feedback: string): Promise<boolean> {
  const slot = SLOTS[post.plan as SlotPlan];
  post.feedback = feedback;
  post.version = (post.version || 1) + 1;
  post.status = 'pending';
  await post.save();

  const combinedAngle = [slot.angle, `GÓP Ý TỪ BIÊN TẬP VIÊN PHẢI TUÂN THỦI (quan trọng nhất): ${feedback}`]
    .filter(Boolean)
    .join('\n\n');

  const data = await runGenerate({
    mode: post.sourceUrl ? 'url' : 'topic',
    topic: post.topic,
    url: post.sourceUrl,
    angle: combinedAngle,
    model: MODEL,
    length: slot.length,
  });

  post.article = {
    titleEn: data.titleEn,
    titleVi: data.titleVi,
    descEn: data.descEn,
    descVi: data.descVi,
    slug: data.slug,
    tags: data.tags,
    contentEn: data.contentEn,
    contentVi: data.contentVi,
    quality: data.quality as unknown as Record<string, unknown>,
  };

  try {
    const coverRes = await internal('/api/ai/cover', {
      method: 'POST',
      body: JSON.stringify({
        topic: post.topic,
        titleVi: data.titleVi,
        titleEn: data.titleEn,
        categoryLabel: slot.categoryLabel,
        variant: Date.now() % 100000,
      }),
    });
    const cj = await coverRes.json();
    if (cj.success) post.coverUrl = cj.url;
  } catch {
    /* giữ ảnh cũ nếu lỗi */
  }
  await post.save();

  const delivered = await deliverPostToTelegram(post);
  if (delivered) {
    post.tgChatId = delivered.chatId;
    post.tgControlMessageId = delivered.messageId;
    post.sentAt = new Date();
    await post.save();
  }
  return !!delivered;
}
