/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/dbConnect';
import { ICaseStudy } from '@/lib/types/icasestudy';
import { ApiResponse } from '@/lib/types/api-response';

import Category from '@/models/Category';
import User from '@/models/User';
import CaseStudy from '@/models/Casestudy' ;

// Utility function to validate MongoDB ObjectId
const isValidObjectId = (id: string | null): id is string => {
  return !!id && mongoose.isValidObjectId(id);
};

// Validate URL format
const isValidUrl = (url: string): boolean => {
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(url);
};

// Validate slug format
const isValidSlug = (slug: string): boolean => {
  return /^[a-z0-9-]+$/.test(slug);
};

// GET: Fetch all case studies or a specific case study by ID
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<ICaseStudy | ICaseStudy[]>>> {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      if (!isValidObjectId(id)) {
        return NextResponse.json(
          { success: false, message: 'ID không hợp lệ', statusCode: 400 },
          { status: 400 }
        );
      }

      const caseStudy = await CaseStudy.findById(id).populate('category user');
      if (!caseStudy) {
        return NextResponse.json(
          { success: false, message: 'Nghiên cứu tình huống không tìm thấy', statusCode: 404 },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: caseStudy, statusCode: 200 },
        { status: 200 }
      );
    }

    const caseStudies = await CaseStudy.find({ isActive: true }).populate('category user');
    return NextResponse.json(
      { success: true, data: caseStudies, statusCode: 200 },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/casestudies error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server', statusCode: 500 },
      { status: 500 }
    );
  }
}

// POST: Create a new case study
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<ICaseStudy>>> {
  try {
    await connectDB();
    const body: ICaseStudy = await req.json();

    // Validate required fields
    if (
      !body.title?.en ||
      !body.title?.vi ||
      !body.description?.en ||
      !body.description?.vi ||
      !body.content?.en ||
      !body.content?.vi ||
      !body.slug ||
      !body.image ||
      !body.category ||
      !body.user
    ) {
      return NextResponse.json(
        { success: false, message: 'Tiêu đề (EN, VI), mô tả (EN, VI), nội dung (EN, VI), slug, hình ảnh, danh mục và người dùng là bắt buộc', statusCode: 400 },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!isValidSlug(body.slug)) {
      return NextResponse.json(
        { success: false, message: 'Slug không hợp lệ. Chỉ sử dụng chữ thường, số và dấu gạch ngang.', statusCode: 400 },
        { status: 400 }
      );
    }

    // Validate image URL
    if (!isValidUrl(body.image)) {
      return NextResponse.json(
        { success: false, message: 'URL hình ảnh không hợp lệ', statusCode: 400 },
        { status: 400 }
      );
    }

    // Validate category ObjectId
    if (!isValidObjectId(body.category.toString())) {
      return NextResponse.json(
        { success: false, message: 'ID danh mục không hợp lệ', statusCode: 400 },
        { status: 400 }
      );
    }
    const category = await Category.findById(body.category);
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Danh mục không tìm thấy', statusCode: 404 },
        { status: 404 }
      );
    }

    // Validate user ObjectId
    if (!isValidObjectId(body.user.toString())) {
      return NextResponse.json(
        { success: false, message: 'ID người dùng không hợp lệ', statusCode: 400 },
        { status: 400 }
      );
    }
    const user = await User.findById(body.user);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Người dùng không tìm thấy', statusCode: 404 },
        { status: 404 }
      );
    }

    // Validate description length
    if (body.description.en.length > 200 || body.description.vi.length > 200) {
      return NextResponse.json(
        { success: false, message: 'Mô tả không được vượt quá 200 ký tự', statusCode: 400 },
        { status: 400 }
      );
    }

    // Validate viewsCount
    if (body.viewsCount && body.viewsCount < 0) {
      return NextResponse.json(
        { success: false, message: 'Lượt xem không được nhỏ hơn 0', statusCode: 400 },
        { status: 400 }
      );
    }

    const caseStudy = await CaseStudy.create(body);
    return NextResponse.json(
      {
        success: true,
        data: caseStudy,
        message: 'Tạo nghiên cứu tình huống thành công',
        statusCode: 201,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/casestudies error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Slug đã tồn tại', statusCode: 400 },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Lỗi server', statusCode: 500 },
      { status: 500 }
    );
  }
}

// PUT: Update a case study by ID
export async function PUT(req: NextRequest): Promise<NextResponse<ApiResponse<ICaseStudy>>> {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ', statusCode: 400 },
        { status: 400 }
      );
    }

    const body: Partial<ICaseStudy> = await req.json();

    // Validate fields if present
    if (body.title && (!body.title.en || !body.title.vi)) {
      return NextResponse.json(
        { success: false, message: 'Cả tiêu đề tiếng Anh và tiếng Việt đều bắt buộc', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.description && (!body.description.en || !body.description.vi)) {
      return NextResponse.json(
        { success: false, message: 'Cả mô tả tiếng Anh và tiếng Việt đều bắt buộc', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.content && (!body.content.en || !body.content.vi)) {
      return NextResponse.json(
        { success: false, message: 'Cả nội dung tiếng Anh và tiếng Việt đều bắt buộc', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.slug && !isValidSlug(body.slug)) {
      return NextResponse.json(
        { success: false, message: 'Slug không hợp lệ. Chỉ sử dụng chữ thường, số và dấu gạch ngang.', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.image && !isValidUrl(body.image)) {
      return NextResponse.json(
        { success: false, message: 'URL hình ảnh không hợp lệ', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.category && !isValidObjectId(body.category.toString())) {
      return NextResponse.json(
        { success: false, message: 'ID danh mục không hợp lệ', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.category) {
      const category = await Category.findById(body.category);
      if (!category) {
        return NextResponse.json(
          { success: false, message: 'Danh mục không tìm thấy', statusCode: 404 },
          { status: 404 }
        );
      }
    }
    if (body.user && !isValidObjectId(body.user.toString())) {
      return NextResponse.json(
        { success: false, message: 'ID người dùng không hợp lệ', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.user) {
      const user = await User.findById(body.user);
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Người dùng không tìm thấy', statusCode: 404 },
          { status: 404 }
        );
      }
    }
    if (body.description && (body.description.en.length > 200 || body.description.vi.length > 200)) {
      return NextResponse.json(
        { success: false, message: 'Mô tả không được vượt quá 200 ký tự', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.viewsCount && body.viewsCount < 0) {
      return NextResponse.json(
        { success: false, message: 'Lượt xem không được nhỏ hơn 0', statusCode: 400 },
        { status: 400 }
      );
    }

    const caseStudy = await CaseStudy.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });

    if (!caseStudy) {
      return NextResponse.json(
        { success: false, message: 'Nghiên cứu tình huống không tìm thấy', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: caseStudy,
        message: 'Cập nhật nghiên cứu tình huống thành công',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT /api/casestudies error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Slug đã tồn tại', statusCode: 400 },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Lỗi server', statusCode: 500 },
      { status: 500 }
    );
  }
}

// DELETE: Delete a case study by ID
export async function DELETE(req: NextRequest): Promise<NextResponse<ApiResponse<null>>> {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'ID không hợp lệ', statusCode: 400 },
        { status: 400 }
      );
    }

    const caseStudy = await CaseStudy.findByIdAndDelete(id);

    if (!caseStudy) {
      return NextResponse.json(
        { success: false, message: 'Nghiên cứu tình huống không tìm thấy', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Xóa nghiên cứu tình huống thành công',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/casestudies error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server', statusCode: 500 },
      { status: 500 }
    );
  }
}