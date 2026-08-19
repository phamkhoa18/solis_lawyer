import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import ContactMessage from '@/models/ContactMessage';

export const runtime = 'nodejs';

/** POST /api/contact — form liên hệ public (rate-limit nhẹ in-memory) */
const recent = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const now = Date.now();
    const hits = (recent.get(ip) || []).filter((t) => now - t < 60_000);
    if (hits.length >= 5) {
      return NextResponse.json({ success: false, message: 'Quá nhiều lần gửi — thử lại sau ít phút' }, { status: 429 });
    }
    hits.push(now);
    recent.set(ip, hits);

    const body = (await req.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
      source?: string;
    };

    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const message = (body.message || '').trim();
    if (name.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || message.length < 5) {
      return NextResponse.json({ success: false, message: 'Vui lòng điền đủ tên, email hợp lệ và nội dung' }, { status: 400 });
    }

    await connectDB();
    await ContactMessage.create({
      name: name.slice(0, 120),
      email: email.slice(0, 160),
      phone: (body.phone || '').trim().slice(0, 40) || undefined,
      subject: (body.subject || '').trim().slice(0, 200) || undefined,
      message: message.slice(0, 4000),
      source: body.source === 'get-in-touch' ? 'get-in-touch' : 'contact-page',
    });

    return NextResponse.json({ success: true, message: 'Đã gửi liên hệ — Solis Lawyers sẽ phản hồi sớm.' });
  } catch {
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
