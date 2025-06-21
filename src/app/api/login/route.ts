import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();
    console.log('Login:', email, password);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Thiếu email hoặc mật khẩu' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}
