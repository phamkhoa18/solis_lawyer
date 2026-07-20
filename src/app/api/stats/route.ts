import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Banner from '@/models/Banner';
import Service from '@/models/Service';
import CaseStudy from '@/models/Casestudy';
import Member from '@/models/Member';
import Testimonial from '@/models/Testimonial';

export async function GET() {
  try {
    await connectDB();

    const [bannerCount, serviceCount, caseStudyCount, memberCount, testimonialCount] =
      await Promise.all([
        Banner.countDocuments(),
        Service.countDocuments(),
        CaseStudy.countDocuments(),
        Member.countDocuments(),
        Testimonial.countDocuments(),
      ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          banners: bannerCount,
          services: serviceCount,
          caseStudies: caseStudyCount,
          members: memberCount,
          testimonials: testimonialCount,
        },
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', statusCode: 500 },
      { status: 500 }
    );
  }
}
