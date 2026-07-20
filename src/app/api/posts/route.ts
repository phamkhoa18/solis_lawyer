/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import { IPost } from '@/lib/types/ipost';
import { ApiResponse } from '@/lib/types/api-response';
import Post from '@/models/Post';

// GET: Fetch all posts
export async function GET(): Promise<NextResponse<ApiResponse<IPost[]>>> {
  try {
    await connectDB();
    
    // Using populate to load author data. Ensure User model is registered if testing isolated
    const posts = await Post.find().populate('author', 'name email').sort({ createdAt: -1 });
    
    return NextResponse.json(
      { success: true, data: posts, statusCode: 200 },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// POST: Create a new post
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<IPost>>> {
  try {
    await connectDB();
    const body: IPost = await req.json();

    // Basic validation
    if (!body.title || !body.content || !body.author) {
      return NextResponse.json(
        { success: false, message: 'Title, content, and author are required', statusCode: 400 },
        { status: 400 }
      );
    }

    // Generate slug if missing
    if (!body.slug) {
      body.slug = body.title.toLowerCase().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
    }

    const post = await Post.create(body);
    
    return NextResponse.json(
      {
        success: true,
        data: post,
        message: 'Post created successfully',
        statusCode: 201,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/posts error:', error);
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
