/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/dbConnect';
import { ITestimonial } from '@/lib/types/itestimonial';
import { ApiResponse } from '@/lib/types/api-response';
import Testimonial from '@/models/Testimonial';

// Utility function to validate MongoDB ObjectId
const isValidObjectId = (id: string | null): id is string => {
  return !!id && mongoose.isValidObjectId(id);
};

// GET: Fetch all testimonials or a specific testimonial by ID
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<ITestimonial | ITestimonial[]>>> {
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

      const testimonial = await Testimonial.findById(id);
      if (!testimonial) {
        return NextResponse.json(
          { success: false, message: 'Testimonial not found', statusCode: 404 },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: testimonial, statusCode: 200 },
        { status: 200 }
      );
    }

    const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json(
      { success: true, data: testimonials, statusCode: 200 },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/testimonials error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// POST: Create a new testimonial
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<ITestimonial>>> {
  try {
    await connectDB();
    const body: ITestimonial = await req.json();

    // Validate required fields
    if (!body.name?.en || !body.name?.vi || !body.image || !body.content?.en || !body.content?.vi) {
      return NextResponse.json(
        { success: false, message: 'Name (en, vi), image, and content (en, vi) are required', statusCode: 400 },
        { status: 400 }
      );
    }

    // Validate URL format for image
    if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(body.image)) {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format for image', statusCode: 400 },
        { status: 400 }
      );
    }

    const testimonial = await Testimonial.create(body);
    return NextResponse.json(
      {
        success: true,
        data: testimonial,
        message: 'Testimonial created successfully',
        statusCode: 201,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/testimonials error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// PUT: Update a testimonial by ID
export async function PUT(req: NextRequest): Promise<NextResponse<ApiResponse<ITestimonial>>> {
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

    const body: Partial<ITestimonial> = await req.json();

    // Validate fields if present
    if (body.name && (!body.name.en || !body.name.vi)) {
      return NextResponse.json(
        { success: false, message: 'Both English and Vietnamese names are required', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.content && (!body.content.en || !body.content.vi)) {
      return NextResponse.json(
        { success: false, message: 'Both English and Vietnamese content are required', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.image && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(body.image)) {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format for image', statusCode: 400 },
        { status: 400 }
      );
    }

    const testimonial = await Testimonial.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });

    if (!testimonial) {
      return NextResponse.json(
        { success: false, message: 'Testimonial not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: testimonial,
        message: 'Testimonial updated successfully',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT /api/testimonials error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// DELETE: Delete a testimonial by ID
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

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return NextResponse.json(
        { success: false, message: 'Testimonial not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Testimonial deleted successfully',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/testimonials error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}