/**
 * Next.js instrumentation — chạy đúng 1 lần khi server start.
 * node-cron là Node-only: import qua comment ignore để webpack (production)
 * và Turbopack (dev) đều không bundle — tránh UnhandledSchemeError node:crypto.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️ Chưa cấu hình TELEGRAM_BOT_TOKEN — bỏ qua daily bot');
    return;
  }
  try {
    const cronMod = (await import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */ 'node-cron' as string
    )) as unknown as { default: { schedule: (expr: string, cb: () => void, opts?: { timezone?: string }) => void } };
    const { startTelegramPoller } = await import('@/lib/telegramPoller');

    const tz = process.env.CRON_TIMEZONE || 'Asia/Ho_Chi_Minh';

    // Đọc giờ cron từ DB (nếu có), fallback 7:00
    let cronHour = 7, cronMinute = 0;
    try {
      const { default: connectDB } = await import('@/lib/dbConnect');
      await connectDB();
      const { default: BotSetting } = await import('@/models/BotSetting');
      const s = await BotSetting.findOne({ key: 'admin' });
      if (s) {
        if (typeof s.cronHour === 'number') cronHour = s.cronHour;
        if (typeof s.cronMinute === 'number') cronMinute = s.cronMinute;
      }
    } catch {
      // DB chưa sẵn sàng → dùng default
    }

    const cronExpr = `${cronMinute} ${cronHour} * * *`;

    cronMod.default.schedule(
      cronExpr,
      async () => {
        try {
          // Kiểm tra cronEnabled trước khi chạy
          const { default: connectDB } = await import('@/lib/dbConnect');
          await connectDB();
          const { default: BotSetting } = await import('@/models/BotSetting');
          const s = await BotSetting.findOne({ key: 'admin' });
          if (s?.cronEnabled === false) {
            console.log('⏰ Cron: tự động đã TẮT — bỏ qua');
            return;
          }
          console.log('⏰ Cron: chạy daily pipeline');
          const { runDailyPipeline } = await import('@/lib/dailyPipeline');
          const r = await runDailyPipeline();
          console.log('⏰ Daily pipeline xong:', JSON.stringify(r));
        } catch (e) {
          console.error('⏰ Daily pipeline lỗi:', e instanceof Error ? e.message : e);
        }
      },
      { timezone: tz }
    );

    startTelegramPoller();
    console.log(`✅ Solis Daily Bot: cron ${String(cronHour).padStart(2, '0')}:${String(cronMinute).padStart(2, '0')} (${tz}) + Telegram poller đã chạy`);
  } catch (e) {
    console.error('❌ Khởi động daily bot lỗi:', e instanceof Error ? e.message : e);
  }
}
