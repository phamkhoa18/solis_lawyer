import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { Menu } from '@/models/Menu';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

    const menu = await Menu.findById(id).lean().exec();
    if (!menu) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy menu' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: menu }, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi lấy menu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const { name, link, slug, icon, parentId, isActive, order } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      return NextResponse.json(
        { success: false, message: 'parentId không hợp lệ' },
        { status: 400 }
      );
    }

    const existingMenu = await Menu.findById(id);
    if (!existingMenu) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy menu để cập nhật' },
        { status: 404 }
      );
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      {
        name: name || existingMenu.name,
        link: link !== undefined ? link : existingMenu.link,
        slug: slug || existingMenu.slug,
        icon: icon !== undefined ? icon : existingMenu.icon,
        parentId: parentId !== undefined ? parentId : existingMenu.parentId,
        isActive: isActive !== undefined ? isActive : existingMenu.isActive,
        order: order !== undefined ? order : existingMenu.order,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: updatedMenu }, { status: 200 });
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi server khi cập nhật menu',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const { order, parentId } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      return NextResponse.json(
        { success: false, message: 'parentId không hợp lệ' },
        { status: 400 }
      );
    }

    if (typeof order !== 'number' || order < 0) {
      return NextResponse.json(
        { success: false, message: 'Thứ tự không hợp lệ' },
        { status: 400 }
      );
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      { order, parentId: parentId || null },
      { new: true, runValidators: true }
    );

    if (!updatedMenu) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy menu để cập nhật' },
        { status: 404 }
      );
    }

    await Menu.updateMany(
      {
        _id: { $ne: id },
        parentId: parentId || null,
        order: { $gte: order },
      },
      { $inc: { order: 1 } }
    );

    return NextResponse.json(
      { success: true, data: updatedMenu },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating menu order:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi server khi cập nhật thứ tự',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

    const menu = await Menu.findById(id);
    if (!menu) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy menu để xóa' },
        { status: 404 }
      );
    }

    // Cập nhật parentId của các menu con thành null
    await Menu.updateMany(
      { parentId: id },
      { $set: { parentId: null } }
    );

    // Xóa menu
    await Menu.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'Xóa menu thành công' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting menu:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi xóa menu' },
      { status: 500 }
    );
  }
}