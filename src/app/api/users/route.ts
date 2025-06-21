import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import User from '@/models/User';

// GET: Lấy danh sách user
export async function GET() {
  try {
    await connectDB();

    const users = await User.find({}).sort({ name: 1 }).lean();

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách user:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

// POST: Tạo user mới
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Thiếu trường email, password hoặc name' },
        { status: 400 }
      );
    }

    // Kiểm tra email tồn tại
    const exist = await User.findOne({ email });
    if (exist) {
      return NextResponse.json(
        { success: false, message: 'Email đã tồn tại' },
        { status: 400 }
      );
    }

    // Tạo user mới
    const newUser = new User({
      email,
      password,
      name,
      role: role || 'admin',
    });

    await newUser.save();

    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return NextResponse.json({ success: true, data: userResponse }, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo user:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
