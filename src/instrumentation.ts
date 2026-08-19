/**
 * Next.js instrumentation — chạy đúng 1 lần khi server start.
 * Node-only deps (node-cron) nằm ở file riêng để webpack không bundle sai runtime.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️ Chưa cấu hình TELEGRAM_BOT_TOKEN — bỏ qua daily bot');
    return;
  }
  try {
    const mod = (await import(/* webpackIgnore: true */ './instrumentation-node' as string)) as { startDailyBot: () => void };
    mod.startDailyBot();
  } catch (e) {
    console.error('❌ Khởi động daily bot lỗi:', e instanceof Error ? e.message : e);
  }
}
