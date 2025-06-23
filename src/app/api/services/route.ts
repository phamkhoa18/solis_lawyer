/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/dbConnect';
import { IService } from '@/lib/types/iservice';
import { ApiResponse } from '@/lib/types/api-response';
import Service from '@/models/Service';

// Utility function to validate MongoDB ObjectId
const isValidObjectId = (id: string | null): id is string => {
  return !!id && mongoose.isValidObjectId(id);
};

// GET: Fetch all services or a specific service by ID
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<IService | IService[]>>> {
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

      const service = await Service.findById(id);
      if (!service) {
        return NextResponse.json(
          { success: false, message: 'Service not found', statusCode: 404 },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: service, statusCode: 200 },
        { status: 200 }
      );
    }

    const services = await Service.find();
    return NextResponse.json(
      { success: true, data: services, statusCode: 200 },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/services error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// POST: Create a new service
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<IService>>> {
  try {
    await connectDB();
    const body: IService = await req.json();

    // Validate required fields
    if (!body.name?.en || !body.name?.vi || !body.img || !body.description?.en || !body.description?.vi) {
      return NextResponse.json(
        { success: false, message: 'Name (en, vi), image, and description (en, vi) are required', statusCode: 400 },
        { status: 400 }
      );
    }

    // Validate URL format for img
    if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(body.img)) {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format for image', statusCode: 400 },
        { status: 400 }
      );
    }

    const service = await Service.create(body);
    return NextResponse.json(
      {
        success: true,
        data: service,
        message: 'Service created successfully',
        statusCode: 201,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/services error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// PUT: Update a service by ID
export async function PUT(req: NextRequest): Promise<NextResponse<ApiResponse<IService>>> {
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

    const body: Partial<IService> = await req.json();

    // Validate fields if present
    if (body.name && (!body.name.en || !body.name.vi)) {
      return NextResponse.json(
        { success: false, message: 'Both English and Vietnamese names are required', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.description && (!body.description.en || !body.description.vi)) {
      return NextResponse.json(
        { success: false, message: 'Both English and Vietnamese descriptions are required', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.img && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(body.img)) {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format for image', statusCode: 400 },
        { status: 400 }
      );
    }

    const service = await Service.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: service,
        message: 'Service updated successfully',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT /api/services error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// DELETE: Delete a service by ID
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

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Service deleted successfully',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/services error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}