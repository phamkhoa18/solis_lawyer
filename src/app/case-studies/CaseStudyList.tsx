'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useLanguage } from '@/app/context/LanguageContext';
import { ICaseStudy } from '@/lib/types/icasestudy';

interface CaseStudyData {
  title: string;
  image: string;
  date: string;
  slug: string;
  alt: string;
  description: string;
}

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

  return {
    title,
    image: caseStudy.image || '/fallback-image.jpg',
    date,
    slug,
    alt: `${title} Case Study`,
    description,
  };
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

export default function CaseStudyList({ caseStudies }: { caseStudies: ICaseStudy[] }) {
  const { language } = useLanguage();
  const normalizedLanguage = language.toLowerCase() as 'en' | 'vi';
  const caseStudyCards = caseStudies.map((cs) => mapCaseStudyToCard(cs, normalizedLanguage));

  if (caseStudies.length === 0) {
    return (
      <div className="flex items-center justify-center text-center">
        <p className="text-gray-500 text-lg">
          {normalizedLanguage === 'vi' ? 'Không có nghiên cứu điển hình nào đang hoạt động.' : 'No active case studies available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {caseStudyCards.map((item, index) => (
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
  );
}
