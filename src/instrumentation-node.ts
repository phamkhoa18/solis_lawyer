/**
 * Chỉ chạy trên Node runtime (được instrumentation.ts gọi động) —
 * tránh webpack bundle node-cron/child_process vào edge/client.
 */
import cron from 'node-cron';
import { startTelegramPoller } from '@/lib/telegramPoller';

export function startDailyBot() {
  const tz = process.env.CRON_TIMEZONE || 'Asia/Ho_Chi_Minh';
  cron.schedule(
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
}
