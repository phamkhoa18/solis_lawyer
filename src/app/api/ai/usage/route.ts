import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import AiUsage from '@/models/AiUsage';
import { AUTH_COOKIE_NAME, verifyJWT } from '@/lib/auth';

export const runtime = 'nodejs';

/** GET /api/ai/usage — tổng hợp chi phí FPT API theo tháng + model */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token || !(await verifyJWT(token))) {
    return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
  }
  try {
    await connectDB();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [byModel, total, allTime] = await Promise.all([
      AiUsage.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        {
          $group: {
            _id: '$model',
            calls: { $sum: 1 },
            promptTokens: { $sum: '$promptTokens' },
            completionTokens: { $sum: '$completionTokens' },
            costUsd: { $sum: '$costUsd' },
          },
        },
        { $sort: { costUsd: -1 } },
      ]),
      AiUsage.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, calls: { $sum: 1 }, costUsd: { $sum: '$costUsd' } } },
      ]),
      AiUsage.aggregate([{ $group: { _id: null, calls: { $sum: 1 }, costUsd: { $sum: '$costUsd' } } }]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        month: {
          costUsd: Math.round((total[0]?.costUsd || 0) * 10000) / 10000,
          calls: total[0]?.calls || 0,
          byModel: byModel.map((m) => ({
            model: m._id,
            calls: m.calls,
            costUsd: Math.round(m.costUsd * 10000) / 10000,
            tokens: m.promptTokens + m.completionTokens,
          })),
        },
        allTime: {
          costUsd: Math.round((allTime[0]?.costUsd || 0) * 10000) / 10000,
          calls: allTime[0]?.calls || 0,
        },
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
