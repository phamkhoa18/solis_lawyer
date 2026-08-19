import { NextRequest, NextResponse } from 'next/server';
import { runDailyPipeline, SlotPlan } from '@/lib/dailyPipeline';

export const runtime = 'nodejs';
export const maxDuration = 800;

/**
 * POST /api/ai/daily/run — chạy tay xưởng bài hằng ngày (test hoặc chạy bù).
 * Body: { slots?: ('criminal'|'family'|'academic')[], force?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { slots?: SlotPlan[]; force?: boolean };
    const results = await runDailyPipeline({
      slots: body.slots,
      force: body.force,
    });
    return NextResponse.json({ success: true, data: results });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Lỗi không xác định';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
