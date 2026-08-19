/**
 * Telegram poller — long-polling getUpdates (khỏi webhook, chạy localhost được).
 * Lệnh: /start /now /status /help
 * Nút: ap (duyệt đăng) · fb (nhập góp ý sửa) · sk (huỷ)
 * Khi đang chờ góp ý, tin nhắn text kế tiếp của admin = feedback → viết lại + gửi bản mới.
 */

import connectDB from '@/lib/dbConnect';
import BotPost from '@/models/BotPost';
import BotSetting from '@/models/BotSetting';
import { getUpdates, sendMessage, answerCallbackQuery, editMessageText, esc, TgUpdate } from '@/lib/telegram';
import { runDailyPipeline, publishPost, regeneratePost, flushUndeliveredPosts, getAdminChatId, SLOTS } from '@/lib/dailyPipeline';

let started = false;

export function startTelegramPoller() {
  if (started || !process.env.TELEGRAM_BOT_TOKEN) return;
  started = true;
  console.log('🤖 Telegram poller đã bật');
  void loop(0);
}

async function loop(offset: number) {
  // dừng 3 giây giữa các lượt để đỡ nóng CPU khi có lỗi
  const { updates, nextOffset } = await getUpdates(offset);
  for (const update of updates) {
    try {
      await handleUpdate(update);
    } catch (e) {
      console.error('Poller xử lý update lỗi:', e instanceof Error ? e.message : e);
    }
  }
  setTimeout(() => void loop(nextOffset), updates.length ? 0 : 3000);
}

async function isAdmin(userId: number): Promise<boolean> {
  const s = await BotSetting.findOne({ key: 'admin' });
  if (!s?.adminUserId) return false; // phải /start trước
  return String(userId) === s.adminUserId;
}

async function handleUpdate(update: TgUpdate) {
  await connectDB();

  // ── Lệnh / tin nhắn text ──
  if (update.message?.text) {
    const chatId = String(update.message.chat.id);
    const from = update.message.from;
    const text = update.message.text.trim();

    // /start — admin đầu tiên đăng ký
    if (text.startsWith('/start')) {
      const existing = await BotSetting.findOne({ key: 'admin' });
      const envAdmin = process.env.TELEGRAM_ADMIN_USER_ID;
      if (!existing) {
        if (envAdmin && String(from?.id) !== envAdmin) {
          await sendMessage(chatId, '⛔️ Bot này dành riêng cho quản trị viên Solis Lawyers.');
          return;
        }
        console.log(`🤖 Admin Telegram đã kích hoạt: ${from?.first_name} (${from?.id})`);
        await BotSetting.create({
          key: 'admin',
          adminChatId: chatId,
          adminUserId: String(from?.id),
          adminName: from?.first_name,
        });
        await sendMessage(
          chatId,
          `👋 Chào <b>${from?.first_name || 'Admin'}</b>!\n\nBạn là quản trị viên của <b>Solis Daily Post</b>.\n\nMỗi sáng 7h (giờ VN), em sẽ viết 3 bài:\n⚖️ Luật Hình Sự · 👨‍👩‍👧 Luật Gia Đình · 📚 Phân Tích Án Lệ\n\nGửi kèm ảnh bìa + điểm chất lượng — anh bấm <b>Duyệt</b> là bài tự lên web, không duyệt thì bấm <b>Yêu cầu sửa</b> và ghi lí do, em viết lại gửi duyệt tiếp.\n\nGõ /help xem lệnh.`
        );
        const n = await flushUndeliveredPosts();
        if (n > 0) await sendMessage(chatId, `📨 Đã gửi lại ${n} bài đang chờ duyệt từ trước.`);
      } else if (String(from?.id) !== existing.adminUserId) {
        await sendMessage(chatId, '⛔️ Bot này dành riêng cho quản trị viên Solis Lawyers.');
        return;
      } else {
        await sendMessage(chatId, '✅ Em đây sẵn sàng! /now để chạy ngay, /status xem hàng đợi.');
      }
      return;
    }

    if (!(from && (await isAdmin(from.id)))) return;

    // Đang có bài chờ góp ý → tin này LÀ feedback
    const awaiting = await BotPost.findOne({ status: 'awaiting_feedback' }).sort({ updatedAt: -1 });
    if (awaiting && text.length > 3 && !text.startsWith('/')) {
      await sendMessage(chatId, '📝 Đã nhận góp ý! Em đang viết lại bài theo hướng của anh — 1-2 phút nữa gửi lại duyệt nhé...');
      try {
        await regeneratePost(awaiting, text);
      } catch (e) {
        await sendMessage(chatId, `❌ Viết lại lỗi: ${e instanceof Error ? e.message : 'không rõ'}\nGõ góp ý lại hoặc /now để thử buổi mới.`);
        awaiting.status = 'pending';
        await awaiting.save();
      }
      return;
    }

    if (text.startsWith('/now')) {
      await sendMessage(chatId, '🚀 Bắt đầu viết 3 bài hôm nay... (mỗi bài ~1-2 phút)');
      const results = await runDailyPipeline({ force: text.includes('force') });
      const lines = Object.entries(results).map(
        ([k, v]) => {
          const r = v as { status: string; detail?: string };
          const icon = r.status === 'sent' ? '✅' : r.status === 'queued' ? '📬' : r.status === 'skipped' ? '⏭' : '❌';
          return `${icon} ${SLOTS[k as 'criminal' | 'family' | 'academic']?.label || k}: ${r.status}${r.detail ? ` (${r.detail})` : ''}`;
        }
      );
      await sendMessage(chatId, `Kết quả:\n${lines.join('\n')}`);
      return;
    }

    if (text.startsWith('/status')) {
      const today = new Date().toISOString().slice(0, 10);
      const posts = await BotPost.find({ runDate: today }).sort({ createdAt: 1 });
      if (!posts.length) {
        await sendMessage(chatId, 'Hôm nay chưa viết bài nào. Gõ /now để chạy ngay.');
        return;
      }
      const lines = posts.map((p) => {
        const icons: Record<string, string> = { pending: '🕓 chờ duyệt', approved: '✅ đã đăng', rejected: '🗑 đã huỷ', failed: '❌ lỗi', awaiting_feedback: '✏️ chờ góp ý' };
        return `${SLOTS[p.plan as 'criminal']?.emoji} ${esc(p.article?.titleVi || p.topic)}\n    → ${icons[p.status]}${p.casestudySlug ? ` · <a href="${p.casestudySlug}">/case-studies/${p.casestudySlug}</a>` : ''}`;
      });
      await sendMessage(chatId, `<b>Hàng đợi hôm nay</b> (${today}):\n\n${lines.join('\n\n')}`);
      return;
    }

    if (text.startsWith('/help')) {
      await sendMessage(
        chatId,
        '<b>Lệnh</b>\n' +
          '/now — viết &amp; gửi duyệt 3 bài ngay (/now force bỏ qua đã chạy)\n' +
          '/status — xem hàng đợi hôm nay\n' +
          '/help — trợ giúp\n\n' +
          '<b>Nút duyệt</b>\n' +
          '✅ Duyệt &amp; Đăng ngay — bài + ảnh lên web, em gửi link lại\n' +
          '✏️ Yêu cầu sửa — anh gõ lí do + hướng sửa, em viết lại gửi duyệt\n' +
          '🗑 Huỷ hẳn — bỏ bài này'
      );
      return;
    }
    return;
  }

  // ── Nút bấm ──
  const cb = update.callback_query;
  if (!cb?.data) return;
  const [action, id] = cb.data.split(':');
  const chatId = cb.message ? String(cb.message.chat.id) : await getAdminChatId();
  if (!chatId || !(await isAdmin(cb.from.id))) {
    await answerCallbackQuery(cb.id, '⛔️ Không có quyền');
    return;
  }

  const post = await BotPost.findById(id);
  if (!post) {
    await answerCallbackQuery(cb.id, '❌ Không tìm thấy bài');
    return;
  }

  if (action === 'ap') {
    await answerCallbackQuery(cb.id, '⏳ Đang đăng bài...');
    try {
      const link = await publishPost(post);
      if (post.tgChatId && post.tgControlMessageId) {
        await editMessageText(post.tgChatId, post.tgControlMessageId, '✅ <b>ĐÃ ĐĂNG</b> — bấm nút bên dưới để xem thành phẩm.');
      }
      await sendMessage(chatId, `🎉 Bài đã lên web!\n\n<b>${esc(post.article?.titleVi || '')}</b>\n<i>${esc(post.article?.titleEn || '')}</i>`, [
        [{ text: '🔗 Xem bài trên website', url: link }],
      ]);
    } catch (e) {
      await sendMessage(chatId, `❌ Đăng lỗi: ${e instanceof Error ? e.message : 'không rõ'}`);
    }
    return;
  }

  if (action === 'fb') {
    post.status = 'awaiting_feedback';
    await post.save();
    await answerCallbackQuery(cb.id, '✅ Đang chờ góp ý');
    await sendMessage(
      chatId,
      '✏️ <b>Yêu cầu sửa bài</b>\n\nAnh ghi rõ:\n1️⃣ Lí do không duyệt\n2️⃣ Hướng sửa muốn em làm\n\nVí dụ: "Phần mở đầu hơi khô, thêm ví dụ thực tế cho gia đình Việt; tiêu đề chưa hút, đổi thành câu hỏi"...',
      [[{ text: '🔙 Huỷ, thôi không sửa', callback_data: `un:${id}` }]]
    );
    return;
  }

  if (action === 'un') {
    if (post.status === 'awaiting_feedback') {
      post.status = 'pending';
      await post.save();
    }
    await answerCallbackQuery(cb.id, '✅ Đã huỷ chế độ góp ý');
    return;
  }

  if (action === 'sk') {
    post.status = 'rejected';
    await post.save();
    await answerCallbackQuery(cb.id, '🗑 Đã huỷ bài');
    if (post.tgChatId && post.tgControlMessageId) {
      await editMessageText(post.tgChatId, post.tgControlMessageId, '🗑 <b>ĐÃ HUỶ</b> bài này.');
    }
    return;
  }
}
