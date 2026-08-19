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
    cronMod.default.schedule(
      '0 7 * * *',
      async () => {
        console.log('⏰ Cron 7h: chạy daily pipeline');
        try {
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
    console.log(`✅ Solis Daily Bot: cron 07:00 (${tz}) + Telegram poller đã chạy`);
  } catch (e) {
    console.error('❌ Khởi động daily bot lỗi:', e instanceof Error ? e.message : e);
  }
}
