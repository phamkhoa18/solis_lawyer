import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import BotPost from '@/models/BotPost';
import { publishPost } from '@/lib/dailyPipeline';
import { AUTH_COOKIE_NAME, verifyJWT } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 120;

async function auth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  return !!(token && (await verifyJWT(token)));
}

/** GET /api/ai/daily/posts — danh sách bài của xưởng hằng ngày (kể cả draft chờ duyệt) */
export async function GET(req: NextRequest) {
  if (!(await auth(req))) {
    return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
  }
  try {
    await connectDB();
    const posts = await BotPost.find().sort({ createdAt: -1 }).limit(60);
    return NextResponse.json({ success: true, data: posts });
  } catch {
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

/** POST /api/ai/daily/posts — { id, action: 'approve' | 'reject' } duyệt/huỷ ngay trên web */
export async function POST(req: NextRequest) {
  if (!(await auth(req))) {
    return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
  }
  try {
    await connectDB();
    const { id, action } = (await req.json()) as { id?: string; action?: 'approve' | 'reject' };
    const post = id ? await BotPost.findById(id) : null;
    if (!post || !post.article) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy bài' }, { status: 404 });
    }
    if (action === 'approve') {
      const link = await publishPost(post);
      return NextResponse.json({ success: true, link });
    }
    post.status = 'rejected';
    await post.save();
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'Lỗi' },
      { status: 500 }
    );
  }
}
