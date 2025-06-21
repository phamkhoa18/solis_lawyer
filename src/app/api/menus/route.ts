/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/menus/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import { IMenuTree } from '@/lib/types/imenu';
import { ApiResponse } from '@/lib/types/api-response';
import { Menu } from '@/models/Menu';

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<IMenuTree[]>>> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('active') !== 'false'; // default = true
    const parentId = searchParams.get('parentId'); // null nếu không truyền

    // Nếu có parentId: chỉ trả danh sách con
    if (parentId == 'null') {
      const children = await Menu.find({
        parentId: null,
        ...(isActive && { isActive: true }),
      }).sort({ order: 1 })
      .populate({
        path: 'children',
        match: isActive ? { isActive: true } : {},
        options: { sort: { order: 1 } },
      });
      
      return NextResponse.json({ success: true, data: children, statusCode: 200 });
    }

    // Nếu không có parentId: lấy menu root + populate children
    const parents = await Menu.find({
      ...(isActive && { isActive: true }),
    })
      .sort({ order: 1 })
    return NextResponse.json({ success: true, data: parents, statusCode: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, message: error.message, statusCode: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse<ApiResponse<IMenuTree>>> {
  try {
    await connectDB();
    const body = await req.json();
    const { name, link, slug, icon, order, parentId, isActive } = body;

    if (!name?.en || !name?.vi) {
      return NextResponse.json({ success: false, message: 'Tên tiếng Anh và tiếng Việt là bắt buộc', statusCode: 400 }, { status: 400 });
    }

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ success: false, message: 'Slug không hợp lệ', statusCode: 400 }, { status: 400 });
    }

    const existingSlug = await Menu.findOne({ slug });
    if (existingSlug) {
      return NextResponse.json({ success: false, message: 'Slug đã tồn tại', statusCode: 400 }, { status: 400 });
    }

    const menu = new Menu({
      name,
      link: link || '/',
      slug,
      icon: icon || '',
      order: order || 0,
      parentId: parentId || null,
      isActive: isActive !== undefined ? isActive : true,
      children: [],
    });

    await menu.save();

    if (parentId) {
      await Menu.findByIdAndUpdate(parentId, { $addToSet: { children: menu._id } });
    }

    return NextResponse.json({
      success: true,
      data: { ...menu.toObject(), _id: menu._id.toString(), children: [] },
      message: 'Thêm menu thành công',
      statusCode: 201,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error, statusCode: 500 }, { status: 500 });
  }
}
