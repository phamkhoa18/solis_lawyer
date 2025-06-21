import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Banner from '@/models/Banner';
import connectDB from '@/lib/dbConnect';
import {IBanner} from '@/lib/types/iBanner'  ;
// GET: Fetch all banners or a specific banner by ID
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }
      
      const banner = await Banner.findById(id);
      if (!banner) {
        return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
      }
      return NextResponse.json(banner);
    }

    const banners = await Banner.find().sort({ createdAt: -1 });
    return NextResponse.json(banners);
  } catch (error) {
    console.error('GET /api/banners error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new banner
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body: IBanner = await req.json();
    
    // Validate required fields
    if (!body.image || !body.name?.en || !body.name?.vi) {
      return NextResponse.json(
        { error: 'Image and name (en, vi) are required' },
        { status: 400 }
      );
    }

    const banner = await Banner.create(body);
    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('POST /api/banners error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update a banner by ID
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body: Partial<IBanner> = await req.json();
    
    const banner = await Banner.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('PUT /api/banners error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete a banner by ID
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const banner = await Banner.findByIdAndDelete(id);
    
    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/banners error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}