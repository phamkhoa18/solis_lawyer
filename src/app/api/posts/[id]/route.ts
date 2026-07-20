/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/dbConnect';
import { IPost } from '@/lib/types/ipost';
import { ApiResponse } from '@/lib/types/api-response';
import Post from '@/models/Post';

// Utility function to validate MongoDB ObjectId
const isValidObjectId = (id: string | null): id is string => {
  return !!id && mongoose.isValidObjectId(id);
};

// GET: Fetch a specific post by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<IPost>>> {
  try {
    await connectDB();
    const id = (await params).id;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID', statusCode: 400 },
        { status: 400 }
      );
    }

    const post = await Post.findById(id).populate('author', 'name email');
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: post, statusCode: 200 },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/posts/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// PUT: Update a post by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<IPost>>> {
  try {
    await connectDB();
    const id = (await params).id;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID', statusCode: 400 },
        { status: 400 }
      );
    }

    const body: Partial<IPost> = await req.json();

    if (body.title && !body.slug) {
      body.slug = body.title.toLowerCase().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
    }

    const post = await Post.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: post,
        message: 'Post updated successfully',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT /api/posts/[id] error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'A post with this slug already exists', statusCode: 409 },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// DELETE: Delete a post by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    await connectDB();
    const id = (await params).id;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID', statusCode: 400 },
        { status: 400 }
      );
    }

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Post deleted successfully',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/posts/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}
