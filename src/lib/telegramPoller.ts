/**
 * Telegram Bot Admin Dashboard — menu-driven, mọi thao tác qua nút bấm.
 *
 * MENU CHÍNH (sau đăng nhập):
 *   📝 Viết bài  ·  ⏰ Lịch tự động  ·  📬 Duyệt bài  ·  📊 Thống kê  ·  ⚙️ Cài đặt
 *
 * BẢO MẬT: email + password admin (giống web) trước khi cho dùng.
 */

import connectDB from '@/lib/dbConnect';
import User from '@/models/User';
import BotPost from '@/models/BotPost';
import BotSetting, { IBotSetting } from '@/models/BotSetting';
import AiUsage from '@/models/AiUsage';
import { comparePassword } from '@/lib/password';
import { FPT_WRITER_MODELS } from '@/lib/fpt';
import { getUpdates, sendMessage, answerCallbackQuery, editMessageText, esc, TgUpdate, TgButton } from '@/lib/telegram';
import { runDailyPipeline, publishPost, regeneratePost, flushUndeliveredPosts, getAdminChatId, SLOTS, SlotPlan } from '@/lib/dailyPipeline';

let started = false;

// ── State quản lý login + chờ input ──
const loginState = new Map<string, { step: 'email' | 'password'; email?: string }>();
const inputState = new Map<string, { type: 'cron_time' | 'feedback'; postId?: string }>();

export function startTelegramPoller() {
  if (started || !process.env.TELEGRAM_BOT_TOKEN) return;
  started = true;
  console.log('🤖 Telegram poller đã bật');
  void loop(0);
}

async function loop(offset: number) {
  const { updates, nextOffset } = await getUpdates(offset);
  for (const update of updates) {
    try { await handleUpdate(update); } catch (e) { console.error('Poller lỗi:', e instanceof Error ? e.message : e); }
  }
  setTimeout(() => void loop(nextOffset), updates.length ? 0 : 3000);
}

// ── Helpers ──
async function getSettings(): Promise<IBotSetting | null> {
  return BotSetting.findOne({ key: 'admin' });
}

async function isAdmin(userId: number): Promise<boolean> {
  const s = await getSettings();
  if (!s?.adminUserId) return false;
  return (s.adminUserId as string).split(',').includes(String(userId));
}

function mainMenuButtons(): TgButton[][] {
  return [
    [{ text: '📝 Viết bài', callback_data: 'menu:write' }, { text: '⏰ Lịch tự động', callback_data: 'menu:schedule' }],
    [{ text: '📬 Duyệt bài', callback_data: 'menu:queue' }, { text: '📊 Thống kê', callback_data: 'menu:stats' }],
    [{ text: '⚙️ Cài đặt', callback_data: 'menu:settings' }],
  ];
}

async function sendMainMenu(chatId: string, greeting?: string) {
  const s = await getSettings();
  const header = greeting || `📱 <b>Solis Editor — Menu chính</b>`;
  const info = s?.cronEnabled !== false
    ? `\n\n⏰ Tự động: <b>Bật</b> · ${String(s?.cronHour ?? 7).padStart(2, '0')}:${String(s?.cronMinute ?? 0).padStart(2, '0')} mỗi ngày`
    : `\n\n⏰ Tự động: <b>Tắt</b>`;
  const pending = await BotPost.countDocuments({ status: 'pending' });
  const pendingInfo = pending > 0 ? `\n📬 <b>${pending} bài</b> đang chờ duyệt` : '';
  await sendMessage(chatId, `${header}${info}${pendingInfo}`, mainMenuButtons());
}

// ══════════════════════════ MAIN HANDLER ══════════════════════════
async function handleUpdate(update: TgUpdate) {
  await connectDB();

  // ── TEXT MESSAGES ──
  if (update.message?.text) {
    const chatId = String(update.message.chat.id);
    const from = update.message.from;
    const userId = from?.id;
    const text = update.message.text.trim();

    // ── Login flow ──
    const login = loginState.get(chatId);
    if (login) {
      if (login.step === 'email') {
        const email = text.toLowerCase().trim();
        if (!email.includes('@')) { await sendMessage(chatId, '❌ Email không hợp lệ. Nhập lại:'); return; }
        loginState.set(chatId, { step: 'password', email });
        await sendMessage(chatId, '🔐 Nhập <b>mật khẩu</b> admin:');
        return;
      }
      if (login.step === 'password' && login.email) {
        loginState.delete(chatId);
        try {
          const user = await User.findOne({ email: login.email });
          if (!user || !user.isActive) { await sendMessage(chatId, '❌ Sai email/mật khẩu. Gõ /start thử lại.'); return; }
          const ok = await comparePassword(text, user.password);
          if (!ok) { await sendMessage(chatId, '❌ Sai email/mật khẩu. Gõ /start thử lại.'); return; }
          if (user.role !== 'admin') { await sendMessage(chatId, '⛔️ Tài khoản không có quyền admin.'); return; }

          const existing = await getSettings();
          if (existing) {
            const ids = new Set((existing.adminUserId || '').split(',').filter(Boolean));
            ids.add(String(userId));
            existing.adminChatId = chatId;
            existing.adminUserId = [...ids].join(',');
            existing.adminName = from?.first_name || user.name;
            await existing.save();
          } else {
            await BotSetting.create({ key: 'admin', adminChatId: chatId, adminUserId: String(userId), adminName: from?.first_name || user.name });
          }
          console.log(`🤖 Admin TG xác thực: ${user.name} (${user.email})`);
          await sendMainMenu(chatId, `✅ Đăng nhập thành công!\n\n👋 Chào <b>${esc(user.name || from?.first_name || 'Admin')}</b>!`);
          const n = await flushUndeliveredPosts();
          if (n > 0) await sendMessage(chatId, `📨 Đã gửi lại ${n} bài đang chờ duyệt.`);
        } catch (e) { console.error('Login error:', e); await sendMessage(chatId, '❌ Lỗi. Gõ /start thử lại.'); }
        return;
      }
    }

    // ── Đang chờ input (cron time, feedback) ──
    const input = inputState.get(chatId);
    if (input && !text.startsWith('/')) {
      inputState.delete(chatId);
      if (input.type === 'cron_time') {
        const match = text.match(/^(\d{1,2})[:\s](\d{2})$/);
        if (!match) { await sendMessage(chatId, '❌ Sai định dạng. VD: <b>08:30</b>. Bấm ⏰ Lịch tự động để thử lại.'); return; }
        const hour = parseInt(match[1]), minute = parseInt(match[2]);
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) { await sendMessage(chatId, '❌ Giờ không hợp lệ.'); return; }
        await BotSetting.updateOne({ key: 'admin' }, { $set: { cronHour: hour, cronMinute: minute } });
        await sendMessage(chatId, `✅ Đã đổi lịch thành <b>${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}</b> mỗi ngày.\n\n⚠️ Lưu ý: cần restart server để cron mới có hiệu lực.`);
        await sendMainMenu(chatId);
        return;
      }
      if (input.type === 'feedback' && input.postId) {
        const post = await BotPost.findById(input.postId);
        if (!post) { await sendMessage(chatId, '❌ Không tìm thấy bài.'); return; }
        await sendMessage(chatId, '📝 Đã nhận góp ý! Đang viết lại — 1-2 phút...');
        try {
          await regeneratePost(post, text);
        } catch (e) {
          await sendMessage(chatId, `❌ Viết lại lỗi: ${e instanceof Error ? e.message : 'không rõ'}`);
          post.status = 'pending'; await post.save();
        }
        return;
      }
    }

    // ── Commands ──
    if (text.startsWith('/start') || text.startsWith('/menu')) {
      if (userId && (await isAdmin(userId))) {
        await sendMainMenu(chatId);
      } else {
        loginState.set(chatId, { step: 'email' });
        await sendMessage(chatId, '🔒 <b>Đăng nhập Solis Lawyers Admin</b>\n\nBot này chỉ dành cho quản trị viên.\nNhập <b>email admin</b>:');
      }
      return;
    }

    if (text.startsWith('/help')) {
      if (!(userId && (await isAdmin(userId)))) { await sendMessage(chatId, '⛔️ Gõ /start để đăng nhập.'); return; }
      await sendMessage(chatId,
        '<b>Lệnh nhanh</b>\n/menu — mở menu chính\n/now — viết 3 bài ngay\n/status — hàng đợi hôm nay\n/help — trợ giúp\n\nHoặc dùng nút bấm trong menu 👆');
      return;
    }

    if (text.startsWith('/now')) {
      if (!(userId && (await isAdmin(userId)))) { await sendMessage(chatId, '⛔️ Gõ /start để đăng nhập.'); return; }
      await handleWriteAll(chatId, text.includes('force'));
      return;
    }

    if (text.startsWith('/status')) {
      if (!(userId && (await isAdmin(userId)))) { await sendMessage(chatId, '⛔️ Gõ /start để đăng nhập.'); return; }
      await handleQueue(chatId);
      return;
    }

    // Tin nhắn lạ từ non-admin
    if (!(userId && (await isAdmin(userId)))) {
      await sendMessage(chatId, '⛔️ Bạn chưa đăng nhập. Gõ /start để xác thực.');
      return;
    }
    return;
  }

  // ══════════════════════════ CALLBACK QUERIES (NÚT BẤM) ══════════════════════════
  const cb = update.callback_query;
  if (!cb?.data) return;
  const chatId = cb.message ? String(cb.message.chat.id) : await getAdminChatId();
  if (!chatId || !(await isAdmin(cb.from.id))) {
    await answerCallbackQuery(cb.id, '⛔️ Gõ /start để đăng nhập');
    return;
  }

  const data = cb.data;

  // ── MENU CHÍNH ──
  if (data === 'menu:main') {
    await answerCallbackQuery(cb.id);
    await sendMainMenu(chatId);
    return;
  }

  // ── 📝 VIẾT BÀI ──
  if (data === 'menu:write') {
    await answerCallbackQuery(cb.id);
    await sendMessage(chatId, '📝 <b>Viết bài — chọn chủ đề:</b>', [
      [{ text: '⚖️ Luật Hình Sự', callback_data: 'write:criminal' }, { text: '👨‍👩‍👧 Luật Gia Đình', callback_data: 'write:family' }],
      [{ text: '📚 Phân Tích Án Lệ', callback_data: 'write:academic' }, { text: '🚀 Cả 3 bài', callback_data: 'write:all' }],
      [{ text: '🔙 Quay lại menu', callback_data: 'menu:main' }],
    ]);
    return;
  }

  if (data.startsWith('write:')) {
    await answerCallbackQuery(cb.id, '⏳ Đang viết...');
    const slot = data.split(':')[1];
    if (slot === 'all') {
      await handleWriteAll(chatId, false);
    } else {
      await handleWriteSlot(chatId, slot as SlotPlan);
    }
    return;
  }

  // ── ⏰ LỊCH TỰ ĐỘNG ──
  if (data === 'menu:schedule') {
    await answerCallbackQuery(cb.id);
    await handleScheduleMenu(chatId);
    return;
  }

  if (data === 'schedule:toggle') {
    await answerCallbackQuery(cb.id);
    const s = await getSettings();
    const newVal = !(s?.cronEnabled !== false);
    await BotSetting.updateOne({ key: 'admin' }, { $set: { cronEnabled: newVal } });
    await sendMessage(chatId, `✅ Tự động đã <b>${newVal ? 'BẬT' : 'TẮT'}</b>.\n\n⚠️ Cần restart server để có hiệu lực.`);
    await handleScheduleMenu(chatId);
    return;
  }

  if (data === 'schedule:time') {
    await answerCallbackQuery(cb.id);
    inputState.set(chatId, { type: 'cron_time' });
    await sendMessage(chatId, '🕐 Nhập giờ chạy mới (định dạng <b>HH:MM</b>):\n\nVD: <b>07:00</b> hoặc <b>08:30</b>');
    return;
  }

  // ── 📬 DUYỆT BÀI ──
  if (data === 'menu:queue') {
    await answerCallbackQuery(cb.id);
    await handleQueue(chatId);
    return;
  }

  if (data.startsWith('view:')) {
    await answerCallbackQuery(cb.id);
    const postId = data.split(':')[1];
    const post = await BotPost.findById(postId);
    if (!post?.article) { await sendMessage(chatId, '❌ Không tìm thấy bài.'); return; }
    const { deliverPostToTelegram } = await import('@/lib/dailyPipeline');
    const delivered = await deliverPostToTelegram(post);
    if (delivered) {
      post.tgChatId = delivered.chatId;
      post.tgControlMessageId = delivered.messageId;
      post.sentAt = new Date();
      await post.save();
    }
    return;
  }

  if (data === 'queue:approve_all') {
    await answerCallbackQuery(cb.id, '⏳ Đang duyệt tất cả...');
    const posts = await BotPost.find({ status: 'pending' }).sort({ createdAt: 1 });
    let ok = 0, fail = 0;
    for (const post of posts) {
      try { await publishPost(post); ok++; } catch { fail++; }
    }
    await sendMessage(chatId, `✅ Đã duyệt: <b>${ok}</b> bài${fail ? ` · ❌ Lỗi: ${fail}` : ''}`);
    await sendMainMenu(chatId);
    return;
  }

  // ── 📊 THỐNG KÊ ──
  if (data === 'menu:stats') {
    await answerCallbackQuery(cb.id);
    await handleStats(chatId);
    return;
  }

  // ── ⚙️ CÀI ĐẶT ──
  if (data === 'menu:settings') {
    await answerCallbackQuery(cb.id);
    await handleSettingsMenu(chatId);
    return;
  }

  if (data.startsWith('set:model:')) {
    await answerCallbackQuery(cb.id);
    const model = data.replace('set:model:', '');
    await BotSetting.updateOne({ key: 'admin' }, { $set: { aiModel: model } });
    await sendMessage(chatId, `✅ Model đã đổi thành <b>${esc(model)}</b>`);
    await handleSettingsMenu(chatId);
    return;
  }

  if (data === 'set:model') {
    await answerCallbackQuery(cb.id);
    const buttons: TgButton[][] = FPT_WRITER_MODELS.map((m) => ([{ text: m.name, callback_data: `set:model:${m.id}` }]));
    buttons.push([{ text: '🔙 Quay lại', callback_data: 'menu:settings' }]);
    await sendMessage(chatId, '🤖 <b>Chọn model AI:</b>', buttons);
    return;
  }

  if (data === 'set:cover') {
    await answerCallbackQuery(cb.id);
    const s = await getSettings();
    const newVal = !(s?.autoCover !== false);
    await BotSetting.updateOne({ key: 'admin' }, { $set: { autoCover: newVal } });
    await sendMessage(chatId, `✅ Ảnh bìa tự động: <b>${newVal ? 'BẬT' : 'TẮT'}</b>`);
    await handleSettingsMenu(chatId);
    return;
  }

  if (data === 'set:length') {
    await answerCallbackQuery(cb.id);
    await sendMessage(chatId, '📏 <b>Chọn độ dài bài:</b>', [
      [{ text: 'Ngắn (~600 từ)', callback_data: 'set:len:short' }, { text: 'Vừa (~800 từ)', callback_data: 'set:len:medium' }],
      [{ text: 'Dài (~1500 từ)', callback_data: 'set:len:long' }],
      [{ text: '🔙 Quay lại', callback_data: 'menu:settings' }],
    ]);
    return;
  }

  if (data.startsWith('set:len:')) {
    await answerCallbackQuery(cb.id);
    const len = data.replace('set:len:', '') as 'short' | 'medium' | 'long';
    await BotSetting.updateOne({ key: 'admin' }, { $set: { articleLength: len } });
    const labels: Record<string, string> = { short: 'Ngắn (~600 từ)', medium: 'Vừa (~800 từ)', long: 'Dài (~1500 từ)' };
    await sendMessage(chatId, `✅ Độ dài: <b>${labels[len]}</b>`);
    await handleSettingsMenu(chatId);
    return;
  }

  if (data === 'set:logout') {
    await answerCallbackQuery(cb.id);
    const s = await getSettings();
    if (s) {
      const ids = new Set((s.adminUserId || '').split(',').filter(Boolean));
      ids.delete(String(cb.from.id));
      if (ids.size === 0) await BotSetting.deleteOne({ key: 'admin' });
      else { s.adminUserId = [...ids].join(','); await s.save(); }
    }
    await sendMessage(chatId, '👋 Đã đăng xuất. Gõ /start để đăng nhập lại.');
    return;
  }

  // ── NÚT DUYỆT/SỬA/HUỶ BÀI (giữ tương thích cũ) ──
  if (data.startsWith('ap:')) {
    const id = data.split(':')[1];
    const post = await BotPost.findById(id);
    if (!post) { await answerCallbackQuery(cb.id, '❌ Không tìm thấy bài'); return; }
    await answerCallbackQuery(cb.id, '⏳ Đang đăng...');
    try {
      const link = await publishPost(post);
      if (post.tgChatId && post.tgControlMessageId) {
        await editMessageText(post.tgChatId, post.tgControlMessageId, '✅ <b>ĐÃ ĐĂNG</b>');
      }
      await sendMessage(chatId, `🎉 Bài đã lên web!\n\n<b>${esc(post.article?.titleVi || '')}</b>\n<i>${esc(post.article?.titleEn || '')}</i>`, [
        [{ text: '🔗 Xem trên web', url: link }],
        [{ text: '🔙 Menu chính', callback_data: 'menu:main' }],
      ]);
    } catch (e) { await sendMessage(chatId, `❌ Đăng lỗi: ${e instanceof Error ? e.message : 'không rõ'}`); }
    return;
  }

  if (data.startsWith('fb:')) {
    const id = data.split(':')[1];
    const post = await BotPost.findById(id);
    if (!post) { await answerCallbackQuery(cb.id, '❌ Không tìm thấy bài'); return; }
    post.status = 'awaiting_feedback'; await post.save();
    await answerCallbackQuery(cb.id, '✅ Chờ góp ý');
    inputState.set(chatId, { type: 'feedback', postId: id });
    await sendMessage(chatId,
      '✏️ <b>Yêu cầu sửa bài</b>\n\nGhi rõ:\n1️⃣ Lí do không duyệt\n2️⃣ Hướng sửa\n\nVD: "Thêm ví dụ thực tế, tiêu đề đổi thành câu hỏi"',
      [[{ text: '🔙 Huỷ, không sửa', callback_data: `un:${id}` }]]);
    return;
  }

  if (data.startsWith('un:')) {
    const id = data.split(':')[1];
    const post = await BotPost.findById(id);
    if (post?.status === 'awaiting_feedback') { post.status = 'pending'; await post.save(); }
    inputState.delete(chatId);
    await answerCallbackQuery(cb.id, '✅ Đã huỷ');
    return;
  }

  if (data.startsWith('sk:')) {
    const id = data.split(':')[1];
    const post = await BotPost.findById(id);
    if (post) { post.status = 'rejected'; await post.save(); }
    await answerCallbackQuery(cb.id, '🗑 Đã huỷ bài');
    if (post?.tgChatId && post.tgControlMessageId) {
      await editMessageText(post.tgChatId, post.tgControlMessageId, '🗑 <b>ĐÃ HUỶ</b> bài này.');
    }
    return;
  }
}

// ══════════════════════════ SUB-HANDLERS ══════════════════════════

async function handleWriteSlot(chatId: string, plan: SlotPlan) {
  const slot = SLOTS[plan];
  await sendMessage(chatId, `${slot.emoji} Đang viết <b>${slot.label}</b>... (~1-2 phút)`);
  const results = await runDailyPipeline({ slots: [plan], force: true });
  const r = results[plan] as { status: string; detail?: string };
  const icon = r.status === 'sent' ? '✅' : r.status === 'error' ? '❌' : '📬';
  await sendMessage(chatId, `${icon} ${slot.label}: <b>${r.status}</b>${r.detail ? ` — ${r.detail}` : ''}`, [
    [{ text: '🔙 Menu chính', callback_data: 'menu:main' }],
  ]);
}

async function handleWriteAll(chatId: string, force: boolean) {
  await sendMessage(chatId, '🚀 Bắt đầu viết 3 bài...\n\n⚖️ Hình Sự → 👨‍👩‍👧 Gia Đình → 📚 Án Lệ\n\nMỗi bài ~1-2 phút, xong em gửi duyệt.');
  const results = await runDailyPipeline({ force });
  const lines = Object.entries(results).map(([k, v]) => {
    const r = v as { status: string; detail?: string };
    const icon = r.status === 'sent' ? '✅' : r.status === 'queued' ? '📬' : r.status === 'skipped' ? '⏭' : '❌';
    return `${icon} ${SLOTS[k as SlotPlan]?.label || k}: <b>${r.status}</b>${r.detail ? ` (${r.detail})` : ''}`;
  });
  await sendMessage(chatId, `<b>Kết quả:</b>\n${lines.join('\n')}`, [
    [{ text: '📬 Xem hàng đợi', callback_data: 'menu:queue' }],
    [{ text: '🔙 Menu chính', callback_data: 'menu:main' }],
  ]);
}

async function handleScheduleMenu(chatId: string) {
  const s = await getSettings();
  const enabled = s?.cronEnabled !== false;
  const hour = String(s?.cronHour ?? 7).padStart(2, '0');
  const minute = String(s?.cronMinute ?? 0).padStart(2, '0');
  await sendMessage(chatId,
    `⏰ <b>Lịch viết bài tự động</b>\n\nTrạng thái: ${enabled ? '✅ <b>Đang bật</b>' : '🔴 <b>Đang tắt</b>'}\nGiờ chạy: <b>${hour}:${minute}</b> (Asia/Ho_Chi_Minh)\nSlot: ⚖️ Hình sự · 👨‍👩‍👧 Gia đình · 📚 Án lệ\n\nMỗi ngày vào giờ trên, bot sẽ tự viết 3 bài rồi gửi về cho anh duyệt.`,
    [
      [{ text: enabled ? '🔴 Tắt tự động' : '✅ Bật tự động', callback_data: 'schedule:toggle' }, { text: '🕐 Đổi giờ', callback_data: 'schedule:time' }],
      [{ text: '🔙 Quay lại menu', callback_data: 'menu:main' }],
    ]);
}

async function handleQueue(chatId: string) {
  const posts = await BotPost.find({ status: { $in: ['pending', 'awaiting_feedback'] } }).sort({ createdAt: -1 }).limit(10);
  if (!posts.length) {
    await sendMessage(chatId, '📬 Không có bài nào đang chờ duyệt.\n\nBấm 📝 Viết bài để tạo mới.', [
      [{ text: '📝 Viết bài', callback_data: 'menu:write' }],
      [{ text: '🔙 Menu chính', callback_data: 'menu:main' }],
    ]);
    return;
  }
  const lines = posts.map((p, i) => {
    const slot = SLOTS[p.plan as SlotPlan];
    const q = p.article?.quality as { judge?: { vi?: { score?: number }; en?: { score?: number } } } | undefined;
    const scoreInfo = q?.judge ? ` · EN ${q.judge.en?.score ?? '?'} · VI ${q.judge.vi?.score ?? '?'}` : '';
    const statusIcon = p.status === 'awaiting_feedback' ? '✏️ chờ góp ý' : '🕓 chờ duyệt';
    return `${i + 1}. ${slot?.emoji || '📄'} ${esc((p.article?.titleVi || p.topic || '').slice(0, 50))}\n    ${statusIcon}${scoreInfo}`;
  });

  const buttons: TgButton[][] = [];
  // Row of post buttons (max 3 per row)
  for (let i = 0; i < posts.length; i += 3) {
    const row = posts.slice(i, i + 3).map((p, j) => ({
      text: `📄 Bài ${i + j + 1}`, callback_data: `view:${p._id}`,
    }));
    buttons.push(row);
  }
  if (posts.length > 1) buttons.push([{ text: '✅ Duyệt tất cả', callback_data: 'queue:approve_all' }]);
  buttons.push([{ text: '🔙 Menu chính', callback_data: 'menu:main' }]);

  await sendMessage(chatId, `📬 <b>Bài đang chờ duyệt (${posts.length})</b>\n\n${lines.join('\n\n')}`, buttons);
}

async function handleStats(chatId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400_000);

  const [todayPosts, weekPosts, todayUsage, weekUsage] = await Promise.all([
    BotPost.find({ runDate: today }),
    BotPost.find({ createdAt: { $gte: weekAgo } }),
    AiUsage.aggregate([
      { $match: { createdAt: { $gte: new Date(today) } } },
      { $group: { _id: null, tokens: { $sum: { $add: ['$promptTokens', '$completionTokens'] } }, cost: { $sum: '$costUsd' } } },
    ]),
    AiUsage.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: null, tokens: { $sum: { $add: ['$promptTokens', '$completionTokens'] } }, cost: { $sum: '$costUsd' } } },
    ]),
  ]);

  const todayStat = {
    total: todayPosts.length,
    approved: todayPosts.filter((p) => p.status === 'approved').length,
    pending: todayPosts.filter((p) => p.status === 'pending' || p.status === 'awaiting_feedback').length,
    rejected: todayPosts.filter((p) => p.status === 'rejected').length,
    failed: todayPosts.filter((p) => p.status === 'failed').length,
  };
  const weekStat = {
    total: weekPosts.length,
    approved: weekPosts.filter((p) => p.status === 'approved').length,
    rejected: weekPosts.filter((p) => p.status === 'rejected').length,
  };

  const tToken = todayUsage[0]?.tokens || 0;
  const tCost = todayUsage[0]?.cost || 0;
  const wToken = weekUsage[0]?.tokens || 0;
  const wCost = weekUsage[0]?.cost || 0;

  const s = await getSettings();
  const fmtK = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);

  await sendMessage(chatId,
    `📊 <b>Thống kê Solis Daily Post</b>\n\n` +
    `📅 <b>Hôm nay</b> (${today}):\n` +
    `  ✅ ${todayStat.approved} đã đăng · 🕓 ${todayStat.pending} chờ duyệt · 🗑 ${todayStat.rejected} huỷ${todayStat.failed ? ` · ❌ ${todayStat.failed} lỗi` : ''}\n\n` +
    `📆 <b>7 ngày qua:</b>\n` +
    `  Tổng: ${weekStat.total} bài · Đăng: ${weekStat.approved} · Huỷ: ${weekStat.rejected}\n\n` +
    `💰 <b>Token \u0026 chi phí:</b>\n` +
    `  Hôm nay: ~${fmtK(tToken)} tokens · $${tCost.toFixed(3)}\n` +
    `  Tuần: ~${fmtK(wToken)} tokens · $${wCost.toFixed(3)}\n` +
    `  Model: ${esc(s?.aiModel || 'DeepSeek-V4-Flash')}`,
    [[{ text: '🔙 Menu chính', callback_data: 'menu:main' }]]);
}

async function handleSettingsMenu(chatId: string) {
  const s = await getSettings();
  const model = s?.aiModel || 'DeepSeek-V4-Flash';
  const cover = s?.autoCover !== false;
  const len = s?.articleLength || 'medium';
  const lenLabels: Record<string, string> = { short: 'Ngắn (~600 từ)', medium: 'Vừa (~800 từ)', long: 'Dài (~1500 từ)' };

  await sendMessage(chatId,
    `⚙️ <b>Cài đặt</b>\n\n🤖 Model: <b>${esc(model)}</b>\n🖼 Ảnh bìa tự động: <b>${cover ? 'Bật ✅' : 'Tắt 🔴'}</b>\n📏 Độ dài bài: <b>${lenLabels[len] || len}</b>`,
    [
      [{ text: '🤖 Đổi model', callback_data: 'set:model' }, { text: `🖼 Ảnh bìa: ${cover ? 'Tắt' : 'Bật'}`, callback_data: 'set:cover' }],
      [{ text: '📏 Độ dài', callback_data: 'set:length' }, { text: '🚪 Đăng xuất', callback_data: 'set:logout' }],
      [{ text: '🔙 Quay lại menu', callback_data: 'menu:main' }],
    ]);
}
