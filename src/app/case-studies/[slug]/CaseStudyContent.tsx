'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useLanguage } from '@/app/context/LanguageContext';
import GetInTouch from '@/app/components/GetInTouch';
import MermaidRenderer from '@/components/MermaidRenderer';

interface CaseStudyDetailData {
  title: { en: string; vi: string };
  description: { en: string; vi: string };
  content: { en: string; vi: string };
  image: string;
  publishedAt?: string;
}

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99], delay: 0.2 },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99], delay: i * 0.2 },
  }),
};

export default function CaseStudyContent({ caseStudy }: { caseStudy: CaseStudyDetailData }) {
  const { language } = useLanguage();
  const lang = language.toLowerCase() as 'en' | 'vi';

  const title = caseStudy.title?.[lang] || caseStudy.title?.en || '';
  const description = caseStudy.description?.[lang] || caseStudy.description?.en || '';
  const content = caseStudy.content?.[lang] || caseStudy.content?.en || '';
  const date = caseStudy.publishedAt
    ? new Date(caseStudy.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <motion.div
      className="lg:w-2/3"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={contentVariants}
    >
      {/* Hero Image */}
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg mb-8">
        <Image
          src={caseStudy.image || '/fallback-image.jpg'}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {date && (
          <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] rounded-full px-4 py-1.5 text-white text-sm font-medium">
            {date}
          </div>
        )}
      </div>

      {/* Title and Description */}
      <motion.div variants={sectionVariants} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h1 className="text-3xl md:text-4xl font_play font-bold text-gray-900 mb-4">
          {title}
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          {description}
        </p>
      </motion.div>

      {/* Content */}
      <motion.div variants={sectionVariants} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <MermaidRenderer className="prose prose-gray max-w-none mb-8" html={content} />
      </motion.div>

      {/* CTA */}
      <GetInTouch
        title={lang === 'vi' ? 'Cần Hỗ Trợ Pháp Lý?' : 'Need Legal Assistance?'}
        description={lang === 'vi' ? 'Liên hệ với chúng tôi hôm nay để thảo luận về nhu cầu pháp lý của bạn.' : 'Contact us today to discuss how we can support your legal needs.'}
      />
    </motion.div>
  );
}
