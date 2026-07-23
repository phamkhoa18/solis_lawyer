import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import User from '@/models/User';

// GET: Lấy danh sách user
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
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
      return NextResponse.json({ success: false, message: 'Thiếu trường email, password hoặc name' }, { status: 400 });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return NextResponse.json({ success: false, message: 'Email đã tồn tại' }, { status: 400 });
    }

    const newUser = new User({ email, password, name, role: role || 'admin' });
    await newUser.save();

    const userResponse = {
      _id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role,
      isActive: newUser.isActive, createdAt: newUser.createdAt, updatedAt: newUser.updatedAt,
    };

    return NextResponse.json({ success: true, data: userResponse }, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo user:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

// PUT: Cập nhật user
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'Thiếu ID' }, { status: 400 });

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.role) updateData.role = body.role;
    if (typeof body.isActive === 'boolean') updateData.isActive = body.isActive;
    if (body.password && body.password.trim()) updateData.password = body.password;

    if (body.email) {
      const exist = await User.findOne({ email: body.email, _id: { $ne: id } });
      if (exist) return NextResponse.json({ success: false, message: 'Email đã tồn tại' }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password').lean();
    if (!updated) return NextResponse.json({ success: false, message: 'Không tìm thấy user' }, { status: 404 });

    return NextResponse.json({ success: true, data: updated, message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật user:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

// DELETE: Xóa user
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'Thiếu ID' }, { status: 400 });

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Không tìm thấy user' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa user:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
