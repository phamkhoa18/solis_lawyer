'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, ChevronLeft, ChevronRight, SearchX, X } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useLanguage } from '@/app/context/LanguageContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { ICaseStudy } from '@/lib/types/icasestudy';

interface CaseStudyData {
  title: string;
  image: string;
  date: string;
  slug: string;
  alt: string;
  description: string;
}

const ITEMS_PER_PAGE = 6;

const mapCaseStudyToCard = (caseStudy: ICaseStudy, lang: 'en' | 'vi'): CaseStudyData => {
  const title = caseStudy.title?.[lang] || caseStudy.title?.en || 'Untitled Case Study';
  const description = caseStudy.description?.[lang] || caseStudy.description?.en || 'No description available';
  const slug = caseStudy.slug || '#';
  const date = caseStudy.publishedAt
    ? new Date(caseStudy.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return { title, image: caseStudy.image || '/fallback-image.jpg', date, slug, alt: `${title} Case Study`, description };
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.1 },
  }),
};

export default function CaseStudyList({ caseStudies }: { caseStudies: ICaseStudy[] }) {
  const { language } = useLanguage();
  const normalizedLanguage = language.toLowerCase() as 'en' | 'vi';
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('q') || '';

  const allCards = useMemo(() => caseStudies.map((cs) => mapCaseStudyToCard(cs, normalizedLanguage)), [caseStudies, normalizedLanguage]);

  // Filter by search query
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return allCards;
    const q = searchQuery.toLowerCase();
    return allCards.filter(
      (card) =>
        card.title.toLowerCase().includes(q) ||
        card.description.toLowerCase().includes(q)
    );
  }, [allCards, searchQuery]);

  const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE);
  const paginatedCards = filteredCards.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset to page 1 when search changes
  useMemo(() => { setCurrentPage(1); }, [searchQuery]);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); return pages; }
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    router.push('/case-studies');
  };

  if (caseStudies.length === 0) {
    return (
      <div className="flex items-center justify-center text-center py-20">
        <p className="text-gray-500 text-lg">
          {normalizedLanguage === 'vi' ? 'Không có nghiên cứu điển hình nào đang hoạt động.' : 'No active case studies available.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Results Header */}
      {searchQuery && (
        <div className="mb-6 flex items-center justify-between bg-white rounded-xl px-5 py-3 shadow-sm">
          <p className="text-sm text-gray-600">
            {normalizedLanguage === 'vi'
              ? `Kết quả tìm kiếm cho "${searchQuery}" — ${filteredCards.length} bài viết`
              : `Search results for "${searchQuery}" — ${filteredCards.length} articles`}
          </p>
          <button
            onClick={clearSearch}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#9b6f45] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            {normalizedLanguage === 'vi' ? 'Xóa bộ lọc' : 'Clear'}
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredCards.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <SearchX className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium text-lg mb-1">
            {normalizedLanguage === 'vi' ? 'Không tìm thấy kết quả' : 'No results found'}
          </p>
          <p className="text-gray-400 text-sm mb-4">
            {normalizedLanguage === 'vi'
              ? `Không có bài viết nào phù hợp với "${searchQuery}"`
              : `No articles match "${searchQuery}"`}
          </p>
          <button
            onClick={clearSearch}
            className="text-sm text-[#9b6f45] hover:underline font-medium"
          >
            {normalizedLanguage === 'vi' ? 'Xem tất cả bài viết' : 'View all articles'}
          </button>
        </div>
      )}

      {/* Grid */}
      {filteredCards.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedCards.map((item, index) => (
              <motion.div
                key={item.slug}
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
                  {item.date && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] rounded-full px-3 py-1 text-white text-xs font-medium">
                      {item.date}
                    </div>
                  )}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-[#d5aa6d] hover:text-white hover:border-[#d5aa6d] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-200 transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((page, i) =>
                typeof page === 'string' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-gray-400">…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white shadow-md'
                        : 'border border-gray-200 text-gray-600 hover:bg-[#d5aa6d]/10 hover:border-[#d5aa6d]/50 hover:text-[#9b6f45]'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-[#d5aa6d] hover:text-white hover:border-[#d5aa6d] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-200 transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Counter */}
          {totalPages > 1 && (
            <p className="text-center text-sm text-gray-400 mt-3">
              {normalizedLanguage === 'vi'
                ? `Trang ${currentPage} / ${totalPages} (${filteredCards.length} bài viết)`
                : `Page ${currentPage} of ${totalPages} (${filteredCards.length} articles)`}
            </p>
          )}
        </>
      )}
    </div>
  );
}
