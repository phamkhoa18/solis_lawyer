/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Header from '../common/Header';
import Footer from '../common/Footer';
import PageTitle from '../components/PageTitle';
import FilterSidebar from '../components/FilterSidebar';
import { ICaseStudy } from '@/lib/types/icasestudy';
import { ApiResponse } from '@/lib/types/api-response';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-hot-toast';

// Define case study data structure
interface CaseStudyData {
  title: string;
  image: string;
  date: string;
  slug: string;
  alt: string;
  description: string;
}

// Map ICaseStudy to CaseStudyData based on language
const mapCaseStudyToCard = (caseStudy: ICaseStudy, lang: 'en' | 'vi'): CaseStudyData => {
  const title = caseStudy.title?.[lang] || 'Untitled Case Study';
  const description = caseStudy.description?.[lang] || 'No description available';
  const slug = caseStudy.slug || '#';
  const date = caseStudy.publishedAt
    ? new Date(caseStudy.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Unknown Date';

  return {
    title,
    image: caseStudy.image || '/fallback-image.jpg',
    date,
    slug,
    alt: `${title} Case Study`,
    description,
  };
};

const sidebarVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99], delay: 0.3 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.1,
    },
  }),
};

export default function CaseStudies() {
  const { language } = useLanguage(); // Returns Lang ('EN' | 'VI')
  const normalizedLanguage = language.toLowerCase() as 'en' | 'vi';
  const [caseStudies, setCaseStudies] = useState<ICaseStudy[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Log normalized language for debugging
  console.log('Normalized Language:', normalizedLanguage);

  const fetchCaseStudies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/casestudies');
      const data: ApiResponse<ICaseStudy[]> = await res.json();
      if (data.success && data.data) {
        console.log('API Response:', data.data);
        setCaseStudies(data.data.filter((cs) => cs.isActive)); // Chỉ lấy case studies đang hoạt động
      } else {
        setError(data.message || (normalizedLanguage === 'vi' ? 'Không thể tải nghiên cứu điển hình' : 'Unable to load case studies'));
        toast.error(data.message || (normalizedLanguage === 'vi' ? 'Không thể tải nghiên cứu điển hình' : 'Unable to load case studies'));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : (normalizedLanguage === 'vi' ? 'Lỗi kết nối server' : 'Server connection error');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  // Map case studies to card data using normalized language
  const caseStudyCards = caseStudies.map((caseStudy) => mapCaseStudyToCard(caseStudy, normalizedLanguage));

  // Static categories and featured case studies (có thể thay bằng API nếu cần)
  const categories = [
    { name: normalizedLanguage === 'vi' ? 'Di cư Doanh nghiệp' : 'Corporate Migration', link: '/categories/corporate-migration' },
    { name: normalizedLanguage === 'vi' ? 'Chiến lược Pháp lý' : 'Legal Strategy', link: '/categories/legal-strategy' },
    { name: normalizedLanguage === 'vi' ? 'Giải pháp Di cư' : 'Immigration Solutions', link: '/categories/immigration-solutions' },
    { name: normalizedLanguage === 'vi' ? 'Tuân thủ & Tái cấu trúc' : 'Compliance & Restructuring', link: '/categories/compliance-restructuring' },
  ];

  const featuredCaseStudies = [
    {
      title: normalizedLanguage === 'vi' ? 'Thành công Mở rộng Toàn cầu' : 'Global Expansion Success',
      link: '/case-studies/global-expansion',
      date: '20 Nov 2024',
    },
    {
      title: normalizedLanguage === 'vi' ? 'Khung Tuân thủ Khởi nghiệp' : 'Startup Compliance Framework',
      link: '/case-studies/compliance-framework',
      date: '15 Aug 2024',
    },
  ];

  return (
    <>
      <Header />
      <section className="case-studies bg-gray-50 min-h-screen">
        <PageTitle
          title={normalizedLanguage === 'vi' ? 'Nghiên cứu Điển hình' : 'Case Studies'}
          backgroundImage="/images/bgbanner/page-title-bg.jpg"
          breadcrumb={[
            { label: normalizedLanguage === 'vi' ? 'Trang Chủ' : 'Home', href: '/' },
            { label: normalizedLanguage === 'vi' ? 'Nghiên cứu Điển hình' : 'Case Studies' },
          ]}
        />

        <div className="container mx-auto px-4 py-12 lg:flex lg:gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="rounded-xl overflow-hidden bg-white shadow-sm">
                    <Skeleton className="w-full aspect-[4/3]" />
                    <div className="p-5 flex flex-col gap-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center text-center">
                <div className="space-y-4">
                  <p className="text-red-500 text-lg">{error}</p>
                  <Button
                    onClick={fetchCaseStudies}
                    className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white hover:opacity-90"
                  >
                    {normalizedLanguage === 'vi' ? 'Thử lại' : 'Try Again'}
                  </Button>
                </div>
              </div>
            ) : caseStudies.length === 0 ? (
              <div className="flex items-center justify-center text-center">
                <p className="text-gray-500 text-lg">
                  {normalizedLanguage === 'vi' ? 'Không có nghiên cứu điển hình nào đang hoạt động.' : 'No active case studies available.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {caseStudyCards.map((item:any, index) => (
                  <motion.div
                    key={item.title}
                    className="group rounded-xl cursor-pointer overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    custom={index}
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        fill
                        priority={index < 2}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] rounded-full px-3 py-1 text-white text-xs font-medium">
                        {item.updatedAt}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col gap-3">
                      <h3 className="text-lg font_play font-semibold text-gray-900 group-hover:text-[#B8967E] transition-colors duration-200">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                      <Link
                        href={`/case-studies/${item.slug}`}
                        className="inline-flex items-center gap-1 text-[#B8967E] text-sm font-medium hover:text-[#9b6f45] transition-colors duration-200"
                      >
                        {normalizedLanguage === 'vi' ? 'Đọc Thêm' : 'Read More'} <Plus size={16} strokeWidth={1.5} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Reusable Filter Sidebar */}
          <motion.aside
            className="lg:w-1/3 mt-8 lg:mt-0"
            variants={sidebarVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <FilterSidebar
              title={normalizedLanguage === 'vi' ? 'Thông tin Dịch vụ' : 'Service Insights'}
              categories={categories}
              featuredItems={featuredCaseStudies}
              searchPlaceholder={normalizedLanguage === 'vi' ? 'Tìm dịch vụ...' : 'Find services...'}
            />
          </motion.aside>
        </div>
      </section>
      <Footer />
    </>
  );
}