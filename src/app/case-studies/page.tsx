import { Suspense } from 'react';
import type { Metadata } from "next";
import Header from '../common/Header';
import Footer from '../common/Footer';
import PageTitle from '../components/PageTitle';
import FilterSidebar from '../components/FilterSidebar';
import CaseStudyList from './CaseStudyList';
import connectDB from '@/lib/dbConnect';
import CaseStudy from '@/models/Casestudy';
import Category from '@/models/Category';
import { ICaseStudy } from '@/lib/types/icasestudy';

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Explore Solis Lawyers' case studies showcasing our expertise in migration law, corporate legal solutions, and successful client outcomes.",
  openGraph: {
    title: "Case Studies | Solis Lawyers",
    description:
      "Real-world legal case studies demonstrating our track record of success.",
    url: "https://solislaw.com.au/case-studies",
  },
};

async function getCaseStudies(): Promise<ICaseStudy[]> {
  try {
    await connectDB();
    const caseStudies = await CaseStudy.find({ isActive: true })
      .populate('category', 'name slug')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(caseStudies));
  } catch (error) {
    console.error('Error fetching case studies:', error);
    return [];
  }
}

async function getCategories(): Promise<{ name: string; link: string }[]> {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return categories.map((cat: any) => ({
      name: cat.name?.en || cat.name?.vi || 'Untitled',
      link: `/case-studies?category=${cat.slug}`,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

function getFeaturedCaseStudies(caseStudies: ICaseStudy[]): { title: string; link: string; date: string }[] {
  // Get the 5 most recent case studies as featured
  return caseStudies.slice(0, 5).map((cs) => ({
    title: cs.title?.en || cs.title?.vi || 'Untitled',
    link: `/case-studies/${cs.slug}`,
    date: cs.publishedAt
      ? new Date(cs.publishedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
      : cs.createdAt
        ? new Date(cs.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
        : '',
  }));
}

export default async function CaseStudiesPage() {
  const [caseStudies, categories] = await Promise.all([
    getCaseStudies(),
    getCategories(),
  ]);

  const featuredCaseStudies = getFeaturedCaseStudies(caseStudies);

  return (
    <>
      <Header />
      <section className="case-studies bg-gray-50 min-h-screen">
        <PageTitle
          title="Case Studies"
          backgroundImage="/images/bgbanner/page-title-bg.jpg"
          breadcrumb={[
            { label: 'Home', href: '/' },
            { label: 'Case Studies' },
          ]}
        />

        <div className="container mx-auto px-4 py-12 lg:flex lg:gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1,2,3,4].map(i => <div key={i} className="rounded-xl bg-gray-200 animate-pulse aspect-[4/3]" />)}</div>}>
              <CaseStudyList caseStudies={caseStudies} />
            </Suspense>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-1/3 mt-8 lg:mt-0">
            <FilterSidebar
              title="Service Insights"
              categories={categories}
              featuredItems={featuredCaseStudies}
              searchPlaceholder="Find case studies..."
            />
          </aside>
        </div>
      </section>
      <Footer />
    </>
  );
}