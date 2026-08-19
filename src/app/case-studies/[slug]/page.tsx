/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/app/common/Header';
import Footer from '@/app/common/Footer';
import PageTitle from '@/app/components/PageTitle';
import FilterSidebar from '@/app/components/FilterSidebar';
import CaseStudyContent from './CaseStudyContent';
import connectDB from '@/lib/dbConnect';
import CaseStudyModel from '@/models/Casestudy';
import Category from '@/models/Category';

async function getCaseStudyBySlug(slug: string) {
  try {
    await connectDB();
    const caseStudy = await CaseStudyModel.findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .populate('user', 'name')
      .lean();
    return caseStudy ? JSON.parse(JSON.stringify(caseStudy)) : null;
  } catch (error) {
    console.error('Error fetching case study:', error);
    return null;
  }
}

async function getCategories(): Promise<{ name: string; link: string }[]> {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    return categories.map((cat: any) => ({
      name: cat.name?.en || cat.name?.vi || 'Untitled',
      link: `/case-studies?category=${cat.slug}`,
    }));
  } catch {
    return [];
  }
}

async function getRecentCaseStudies(excludeSlug: string): Promise<{ title: string; link: string; date: string }[]> {
  try {
    await connectDB();
    const recent = await CaseStudyModel.find({ isActive: true, slug: { $ne: excludeSlug } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title slug publishedAt createdAt')
      .lean();
    return (recent as any[]).map((cs) => ({
      title: cs.title?.en || cs.title?.vi || 'Untitled',
      link: `/case-studies/${cs.slug}`,
      date: cs.publishedAt
        ? new Date(cs.publishedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
        : cs.createdAt
          ? new Date(cs.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
          : '',
    }));
  } catch {
    return [];
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
    return { title: 'Case Study Not Found' };
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

// Trích FAQ từ HTML: <h3>câu hỏi</h3> + <p>câu trả lời</p> liền sau (dùng cho schema SEO rich results)
function extractFaq(html: string): { question: string; answer: string }[] {
  const text = (s: string) =>
    s
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  const faqs: { question: string; answer: string }[] = [];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && faqs.length < 8) {
    const q = text(m[1]);
    const a = text(m[2]);
    if (q.length > 8 && q.includes('?') && a.length > 20) {
      faqs.push({ question: q, answer: a.slice(0, 500) });
    }
  }
  return faqs;
}

function buildJsonLd(caseStudy: any): string[] {
  const url = `https://solislaw.com.au/case-studies/${caseStudy.slug}`;
  const schemas: string[] = [
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: (caseStudy.title?.en || caseStudy.title?.vi || '').slice(0, 110),
      description: caseStudy.description?.en || caseStudy.description?.vi || '',
      image: caseStudy.image ? [caseStudy.image.startsWith('http') ? caseStudy.image : `https://solislaw.com.au${caseStudy.image}`] : undefined,
      datePublished: caseStudy.publishedAt || caseStudy.createdAt,
      dateModified: caseStudy.updatedAt || caseStudy.createdAt,
      inLanguage: ['en', 'vi'],
      author: { '@type': 'Person', name: caseStudy.user?.name || 'Solis Lawyers' },
      publisher: {
        '@type': 'Organization',
        name: 'Solis Lawyers',
        logo: { '@type': 'ImageObject', url: 'https://solislaw.com.au/images/logo/solislaw.png' },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    }),
  ];
  const faqs = extractFaq(caseStudy.content?.en || caseStudy.content?.vi || '');
  if (faqs.length >= 2) {
    schemas.push(
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      })
    );
  }
  return schemas;
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
  const [caseStudy, categories, recentCaseStudies] = await Promise.all([
    getCaseStudyBySlug(slug),
    getCategories(),
    getRecentCaseStudies(slug),
  ]);

  if (!caseStudy) {
    notFound();
  }

  return (
    <>
      <Header />
      {/* Schema.org JSON-LD: Article + FAQ (SEO rich results) */}
      {buildJsonLd(caseStudy).map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: s }} />
      ))}
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
          {/* Main Content */}
          <CaseStudyContent caseStudy={caseStudy} />

          {/* Sidebar */}
          <aside className="lg:w-1/3 mt-12 lg:mt-0">
            <FilterSidebar
              title="Service Insights"
              categories={categories}
              featuredItems={recentCaseStudies}
              searchPlaceholder="Find case studies..."
            />
          </aside>
        </div>
      </section>

      <Footer />
    </>
  );
}