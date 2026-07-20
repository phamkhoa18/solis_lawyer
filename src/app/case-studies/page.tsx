import type { Metadata } from "next";
import Header from '../common/Header';
import Footer from '../common/Footer';
import PageTitle from '../components/PageTitle';
import FilterSidebar from '../components/FilterSidebar';
import CaseStudyList from './CaseStudyList';
import connectDB from '@/lib/dbConnect';
import CaseStudy from '@/models/Casestudy';
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
      .populate('category', 'name')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(caseStudies));
  } catch (error) {
    console.error('Error fetching case studies:', error);
    return [];
  }
}

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

export default async function CaseStudiesPage() {
  const caseStudies = await getCaseStudies();

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
            <CaseStudyList caseStudies={caseStudies} />
          </div>

          {/* Sidebar */}
          <aside className="lg:w-1/3 mt-8 lg:mt-0">
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