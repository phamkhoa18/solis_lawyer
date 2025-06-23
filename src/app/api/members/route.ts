/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/dbConnect';
import { IMember } from '@/lib/types/imember';
import { ApiResponse } from '@/lib/types/api-response';
import Member from '@/models/Member';

// Utility function to validate MongoDB ObjectId
const isValidObjectId = (id: string | null): id is string => {
  return !!id && mongoose.isValidObjectId(id);
};

// Validate URL format
const isValidUrl = (url: string): boolean => {
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(url);
};

// GET: Fetch all members or a specific member by ID
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<IMember | IMember[]>>> {
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

      const member = await Member.findById(id);
      if (!member) {
        return NextResponse.json(
          { success: false, message: 'Member not found', statusCode: 404 },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: member, statusCode: 200 },
        { status: 200 }
      );
    }

    const members = await Member.find({ isActive: true })
    return NextResponse.json(
      { success: true, data: members, statusCode: 200 },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/members error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// POST: Create a new member
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<IMember>>> {
  try {
    await connectDB();
    const body: IMember = await req.json();

    // Validate required fields
    if (!body.name?.en || !body.name?.vi || !body.position?.en || !body.position?.vi || !body.image) {
      return NextResponse.json(
        { success: false, message: 'Name (en, vi), position (en, vi), and image are required', statusCode: 400 },
        { status: 400 }
      );
    }

    // Validate URL format for image
    if (!isValidUrl(body.image)) {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format for image', statusCode: 400 },
        { status: 400 }
      );
    }

    // Validate socialLinks URLs if provided
    if (body.socialLinks) {
      for (const [key, url] of Object.entries(body.socialLinks)) {
        if (url && !isValidUrl(url)) {
          return NextResponse.json(
            { success: false, message: `Invalid URL format for socialLinks.${key}`, statusCode: 400 },
            { status: 400 }
          );
        }
      }
    }

    const member = await Member.create(body);
    return NextResponse.json(
      {
        success: true,
        data: member,
        message: 'Member created successfully',
        statusCode: 201,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/members error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// PUT: Update a member by ID
export async function PUT(req: NextRequest): Promise<NextResponse<ApiResponse<IMember>>> {
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

    const body: Partial<IMember> = await req.json();

    // Validate fields if present
    if (body.name && (!body.name.en || !body.name.vi)) {
      return NextResponse.json(
        { success: false, message: 'Both English and Vietnamese names are required', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.position && (!body.position.en || !body.position.vi)) {
      return NextResponse.json(
        { success: false, message: 'Both English and Vietnamese positions are required', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.image && !isValidUrl(body.image)) {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format for image', statusCode: 400 },
        { status: 400 }
      );
    }
    if (body.socialLinks) {
      for (const [key, url] of Object.entries(body.socialLinks)) {
        if (url && !isValidUrl(url)) {
          return NextResponse.json(
            { success: false, message: `Invalid URL format for socialLinks.${key}`, statusCode: 400 },
            { status: 400 }
          );
        }
      }
    }

    const member = await Member.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: member,
        message: 'Member updated successfully',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT /api/members error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}

// DELETE: Delete a member by ID
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

    const member = await Member.findByIdAndDelete(id);

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found', statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Member deleted successfully',
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/members error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}