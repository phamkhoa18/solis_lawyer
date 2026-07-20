import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/app/common/Header';
import Footer from '@/app/common/Footer';
import PageTitle from '@/app/components/PageTitle';
import FilterSidebar from '@/app/components/FilterSidebar';
import CaseStudyContent from './CaseStudyContent';
import connectDB from '@/lib/dbConnect';
import CaseStudyModel from '@/models/Casestudy';

const categories = [
  { name: 'Corporate Migration', link: '/categories/corporate-migration' },
  { name: 'Legal Strategy', link: '/categories/legal-strategy' },
  { name: 'Immigration Solutions', link: '/categories/immigration-solutions' },
  { name: 'Compliance & Restructuring', link: '/categories/compliance-restructuring' },
];

const featuredCaseStudies = [
  { title: 'Global Expansion Success', link: '/case-studies/global-expansion', date: '20 Nov 2024' },
  { title: 'Startup Compliance Framework', link: '/case-studies/compliance-framework', date: '15 Aug 2024' },
];

async function getCaseStudyBySlug(slug: string) {
  try {
    await connectDB();
    const caseStudy = await CaseStudyModel.findOne({ slug, isActive: true })
      .populate('category', 'name')
      .populate('user', 'name')
      .lean();
    return caseStudy ? JSON.parse(JSON.stringify(caseStudy)) : null;
  } catch (error) {
    console.error('Error fetching case study:', error);
    return null;
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);

  if (!caseStudy) {
    return {
      title: 'Case Study Not Found',
    };
  }

  return {
    title: caseStudy.title?.en || 'Case Study',
    description: caseStudy.description?.en || 'Read this case study from Solis Lawyers.',
    openGraph: {
      title: `${caseStudy.title?.en || 'Case Study'} | Solis Lawyers`,
      description: caseStudy.description?.en || '',
      url: `https://solislaw.com.au/case-studies/${slug}`,
      images: caseStudy.image ? [{ url: caseStudy.image }] : [],
      type: 'article',
    },
  };
}

// Generate static params for known case studies
export async function generateStaticParams() {
  try {
    await connectDB();
    const caseStudies = await CaseStudyModel.find({ isActive: true }, 'slug').lean();
    return caseStudies.map((cs) => {
      const item = cs as unknown as { slug: string };
      return { slug: item.slug };
    });
  } catch {
    return [];
  }
}

export default async function DetailCaseStudies({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);

  if (!caseStudy) {
    notFound();
  }

  return (
    <>
      <Header />
      <section className="case-studies bg-gray-50 min-h-screen">
        <PageTitle
          title={caseStudy.title?.en || 'Case Study'}
          backgroundImage="/images/bgbanner/page-title-bg.jpg"
          breadcrumb={[
            { label: 'Home', href: '/' },
            { label: 'Case Studies', href: '/case-studies' },
            { label: caseStudy.title?.en || 'Detail' },
          ]}
        />

        <div className="container mx-auto px-4 lg:py-16 py-8 lg:flex lg:gap-8">
          {/* Main Content - Client component for interactivity */}
          <CaseStudyContent caseStudy={caseStudy} />

          {/* Sidebar */}
          <aside className="lg:w-1/3 mt-12 lg:mt-0">
            <FilterSidebar
              title="Service Insights"
              categories={categories}
              featuredItems={featuredCaseStudies}
              searchPlaceholder="Find services..."
            />
          </aside>
        </div>
      </section>

      <Footer />
    </>
  );
}