/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/dbConnect';
import { ICategory } from '@/lib/types/icategory';
import { ApiResponse } from '@/lib/types/api-response';
import Category from '@/models/Category';

// Utility function to validate MongoDB ObjectId
const isValidObjectId = (id: string | null): id is string => {
  return !!id && mongoose.isValidObjectId(id);
};

// Validate slug format (lowercase letters, numbers, hyphens)
const isValidSlug = (slug: string): boolean => {
  return /^[a-z0-9-]+$/.test(slug);
};

// GET: Fetch all categories or a specific category by ID
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<ICategory | ICategory[]>>> {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      if (!isValidObjectId(id)) {
        return NextResponse.json(
          { success: false, message: 'Invalid ID', statusCode: 400 },
          { status: 400 }
        );
      }

      const category = await Category.findById(id);
      if (!category) {
        return NextResponse.json(
          { success: false, message: 'Category not found', statusCode: 404 },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: category, statusCode: 200 },
        { status: 200 }
      );
    }

    const categories = await Category.find({ isActive: true });
    return NextResponse.json(
      { success: true, data: categories, statusCode: 200 },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// POST: Create a new category
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<ICategory>>> {
  try {
    await connectDB();
    const body: ICategory = await req.json();

    // Validate required fields
    if (!body.name?.en || !body.name?.vi || !body.slug) {
      return NextResponse.json(
        { success: false, message: 'Name (en, vi) and slug are required', statusCode: 400 },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!isValidSlug(body.slug)) {
      return NextResponse.json(
        { success: false, message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.', statusCode: 400 },
        { status: 400 }
      );
    }

    const category = await Category.create(body);
    return NextResponse.json(
      {
        success: true,
        data: category,
        message: 'Category created successfully',
        statusCode: 201,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/categories error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Slug already exists', statusCode: 400 },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// PUT: Update a category by ID
export async function PUT(req: NextRequest): Promise<NextResponse<ApiResponse<ICategory>>> {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID', statusCode: 400 },
        { status: 400 }
      );
    }

    const body: Partial<ICategory> = await req.json();

    // Validate fields if present
    if (body.name && (!body.name.en || !body.name.vi)) {
      return NextResponse.json(
        { success: false, message: 'Both English and Vietnamese names are required', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.slug && !isValidSlug(body.slug)) {
      return NextResponse.json(
        { success: false, message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.', statusCode: 400 },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: 'Category updated successfully',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT /api/categories error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Slug already exists', statusCode: 400 },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// DELETE: Delete a category by ID
export async function DELETE(req: NextRequest): Promise<NextResponse<ApiResponse<null>>> {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID', statusCode: 400 },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Category deleted successfully',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/categories error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}