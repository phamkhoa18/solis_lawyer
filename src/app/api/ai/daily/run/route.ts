import { NextRequest, NextResponse } from 'next/server';
import { runDailyPipeline, SlotPlan } from '@/lib/dailyPipeline';

export const runtime = 'nodejs';
export const maxDuration = 800;

/**
 * POST /api/ai/daily/run — chạy tay xưởng bài hằng ngày (test hoặc chạy bù).
 * Body: { slots?: ('criminal'|'family'|'academic')[], force?: boolean }
 * Trả về NGAY — công việc chạy nền, kết quả đến qua Telegram.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { slots?: SlotPlan[]; force?: boolean };
    // chạy nền — không giữ client chờ (pipeline có thể mất vài phút)
    void runDailyPipeline({ slots: body.slots, force: body.force }).catch((e) =>
      console.error('daily/run nền lỗi:', e instanceof Error ? e.message : e)
    );
    return NextResponse.json({
      success: true,
      message: 'Đã bắt đầu chạy nền — kết quả sẽ gửi vào Telegram (mỗi bài ~1-2 phút)',
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Lỗi không xác định';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
