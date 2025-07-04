/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/banners/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Banner from '@/models/Banner';
import connectDB from '@/lib/dbConnect';
import { IBanner } from '@/lib/types/ibanner';
import { ApiResponse } from '@/lib/types/api-response';

// Utility function to validate MongoDB ObjectId
const isValidObjectId = (id: string | null): id is string => {
  return !!id && mongoose.isValidObjectId(id);
};

// GET: Fetch all banners or a specific banner by ID
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<IBanner | IBanner[]>>> {
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

      const banner = await Banner.findById(id);
      if (!banner) {
        return NextResponse.json(
          { success: false, message: 'Banner not found', statusCode: 404 },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: banner, statusCode: 200 },
        { status: 200 }
      );
    }

    const banners = await Banner.find().sort({ createdAt: -1 });
    return NextResponse.json(
      { success: true, data: banners, statusCode: 200 },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/banners error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// POST: Create a new banner
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<IBanner>>> {
  try {
    await connectDB();
    const body: IBanner = await req.json();

    // Validate required fields
    if (!body.image || !body.name?.en || !body.name?.vi) {
      return NextResponse.json(
        { success: false, message: 'Image and name (en, vi) are required', statusCode: 400 },
        { status: 400 }
      );
    }

    // Optional: Validate additional fields (e.g., link as URL)
    if (body.link && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(body.link)) {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format for link', statusCode: 400 },
        { status: 400 }
      );
    }

    const banner = await Banner.create(body);
    return NextResponse.json(
      {
        success: true,
        data: banner,
        message: 'Banner created successfully',
        statusCode: 201,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/banners error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// PUT: Update a banner by ID
export async function PUT(req: NextRequest): Promise<NextResponse<ApiResponse<IBanner>>> {
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

    const body: Partial<IBanner> = await req.json();

    // Optional: Validate fields if present
    if (body.name && (!body.name.en || !body.name.vi)) {
      return NextResponse.json(
        { success: false, message: 'Both English and Vietnamese names are required', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.link && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(body.link)) {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format for link', statusCode: 400 },
        { status: 400 }
      );
    }

    const banner = await Banner.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });

    if (!banner) {
      return NextResponse.json(
        { success: false, message: 'Banner not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: banner,
        message: 'Banner updated successfully',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT /api/banners error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// DELETE: Delete a banner by ID
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

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return NextResponse.json(
        { success: false, message: 'Banner not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Banner deleted successfully',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/banners error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}