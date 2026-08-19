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
        <MermaidRenderer
          className="prose prose-gray max-w-[75ch] mb-8
            [&_h2]:font_play [&_h2]:text-[1.65rem] [&_h2]:text-slate-800 [&_h2]:mt-10 [&_h2]:tracking-tight
            [&_h3]:font_play [&_h3]:text-xl [&_h3]:text-slate-700
            [&_>p:first-child::first-letter]:float-left [&_>p:first-child::first-letter]:font_play [&_>p:first-child::first-letter]:text-[3.4rem] [&_>p:first-child::first-letter]:leading-[0.85] [&_>p:first-child::first-letter]:text-[#9b6f45] [&_>p:first-child::first-letter]:pr-2.5 [&_>p:first-child::first-letter]:pt-1.5
            [&_blockquote]:border-l-4 [&_blockquote]:border-[#d5aa6d] [&_blockquote]:bg-[#fdf9f2] [&_blockquote]:py-3.5 [&_blockquote]:px-5 [&_blockquote]:rounded-r-2xl [&_blockquote]:text-slate-600 [&_blockquote]:not-italic [&_blockquote]:my-6
            [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse
            [&_th]:bg-[#faf7f2] [&_th]:text-left [&_th]:text-slate-700 [&_th]:font-semibold [&_th]:px-3 [&_th]:py-2.5 [&_th]:border-b-2 [&_th]:border-[#e9e4db]
            [&_td]:px-3 [&_td]:py-2.5 [&_td]:border-b [&_td]:border-slate-100
            [&_.mermaid-diagram]:my-8
            [&_a]:text-[#9b6f45] [&_a]:no-underline [&_a]:decoration-[#d5aa6d] [&_a]:underline-offset-4 [&_a:hover]:decoration-2"
          html={content}
        />
      </motion.div>

      {/* CTA */}
      <GetInTouch
        title={lang === 'vi' ? 'Cần Hỗ Trợ Pháp Lý?' : 'Need Legal Assistance?'}
        description={lang === 'vi' ? 'Liên hệ với chúng tôi hôm nay để thảo luận về nhu cầu pháp lý của bạn.' : 'Contact us today to discuss how we can support your legal needs.'}
      />
    </motion.div>
  );
}
