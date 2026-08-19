import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/dbConnect';
import ServiceModel from '@/models/Service';
import ServiceDetailClient from './ServiceDetailClient';

async function getService(slug: string) {
  try {
    await connectDB();
    const service = await ServiceModel.findOne({ isActive: true, link: { $regex: new RegExp(`/${slug}$`) } }).lean();
    return service ? JSON.parse(JSON.stringify(service)) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: 'Service Not Found' };
  const name = service.name?.en || service.name?.vi || 'Service';
  return {
    title: `${name} | Solis Lawyers`,
    description: (service.description?.en || service.description?.vi || '').slice(0, 160),
    openGraph: { title: name, type: 'website' },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();
  return <ServiceDetailClient service={service} />;
}
