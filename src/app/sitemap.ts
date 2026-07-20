import type { MetadataRoute } from 'next';
import connectDB from '@/lib/dbConnect';
import CaseStudyModel from '@/models/Casestudy';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://solislaw.com.au';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Static service pages
  const servicePages = [
    'criminal-law',
    'family-law',
    'migration-law',
    'conveyancing',
  ].map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Dynamic case study pages
  let caseStudyPages: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const caseStudies = await CaseStudyModel.find({ isActive: true }, 'slug updatedAt').lean();
    caseStudyPages = caseStudies.map((cs) => {
      const item = cs as unknown as { slug: string; updatedAt?: Date };
      return {
        url: `${baseUrl}/case-studies/${item.slug}`,
        lastModified: item.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });
  } catch (error) {
    console.error('Sitemap: Error fetching case studies:', error);
  }

  return [...staticPages, ...servicePages, ...caseStudyPages];
}
