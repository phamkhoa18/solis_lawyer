/**
 * Next.js instrumentation — khởi chạy đúng 1 lần khi server start:
 *  1. Cron 7h00 sáng hàng ngày (múi giờ CRON_TIMEZONE) → viết 3 bài + gửi Telegram duyệt
 *  2. Telegram poller (long-polling, không cần webhook) — nhận lệnh + nút duyệt
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️ Chưa cấu hình TELEGRAM_BOT_TOKEN — bỏ qua daily bot');
    return;
  }

  try {
    const [{ default: cron }, { startTelegramPoller }] = await Promise.all([
      import('node-cron'),
      import('@/lib/telegramPoller'),
    ]);

    const tz = process.env.CRON_TIMEZONE || 'Asia/Ho_Chi_Minh';
    // 7h sáng: giờ vàng duyệt bài trước khi làm việc
    cron.schedule('0 7 * * *', async () => {
      console.log('⏰ Cron 7h: chạy daily pipeline');
      try {
        const { runDailyPipeline } = await import('@/lib/dailyPipeline');
        const r = await runDailyPipeline();
        console.log('⏰ Daily pipeline xong:', JSON.stringify(r));
      } catch (e) {
        console.error('⏰ Daily pipeline lỗi:', e instanceof Error ? e.message : e);
      }
    }, { timezone: tz });

    startTelegramPoller();
    console.log(`✅ Solis Daily Bot: cron 07:00 (${tz}) + Telegram poller đã chạy`);
  } catch (e) {
    console.error('❌ Khởi động daily bot lỗi:', e instanceof Error ? e.message : e);
  }
}
