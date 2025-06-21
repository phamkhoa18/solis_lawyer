'use client'

import React, { } from 'react';
import Image from 'next/image';
import { ChevronRight, } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Header from '@/app/common/Header';
import Footer from '@/app/common/Footer';
import PageTitle from '@/app/components/PageTitle';
import GetInTouch from '@/app/components/GetInTouch';
import FilterSidebar from '@/app/components/FilterSidebar';

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

const caseStudy = {
  title: 'Global Business Migration',
  image: '/images/casestudy/1.jpg',
  date: '15 Jun 2019',
  alt: 'Global Business Migration Case Study',
  introduction:
    'We partnered with a multinational corporation to streamline their cross-border relocation, overcoming complex legal and regulatory challenges.',
  challenges: [
    'Navigating diverse immigration laws across multiple countries.',
    'Ensuring compliance with local labor regulations.',
    'Minimizing downtime during the transition process.',
  ],
  solutions: [
    'Developed a tailored legal strategy for each jurisdiction.',
    'Implemented a compliance framework to meet local standards.',
    'Coordinated with global teams to ensure a seamless transition.',
  ],
  results:
    'The client successfully relocated 500+ employees across three continents with zero compliance issues, achieving full operations within six months.',
};

const sidebarVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99], delay: 0.3 },
  },
};

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


export default function DetailCaseStudies() {

  return (
    <>
      <Header />
      <section className="case-studies bg-gray-50 min-h-screen">
        <PageTitle
          title={caseStudy.title}
          backgroundImage="/images/bgbanner/page-title-bg.jpg"
          breadcrumb={[
            { label: 'Home', href: '/' },
            { label: 'Case Studies', href: '/case-studies' },
            { label: caseStudy.title },
          ]}
        />

        <div className="container mx-auto px-4 lg:py-16 py-8 lg:flex lg:gap-8">
          {/* Main Content */}
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
                src={caseStudy.image}
                alt={caseStudy.alt}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] rounded-full px-4 py-1.5 text-white text-sm font-medium">
                {caseStudy.date}
              </div>
            </div>

            {/* Title and Introduction */}
            <motion.div variants={sectionVariants} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h1 className="text-3xl md:text-4xl font_play font-bold text-gray-900 mb-4">
                {caseStudy.title}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {caseStudy.introduction}
              </p>
            </motion.div>

            {/* Challenges */}
            <motion.div variants={sectionVariants} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl font_play font-semibold text-gray-900 mb-4">
                Challenges
              </h2>
              <ul className="space-y-3 mb-8">
                {caseStudy.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-[#B8967E] mt-1.5" />
                    <span className="text-gray-600 text-base">{challenge}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Solutions */}
            <motion.div variants={sectionVariants} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl font_play font-semibold text-gray-900 mb-4">
                Solutions
              </h2>
              <ul className="space-y-3 mb-8">
                {caseStudy.solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-[#B8967E] mt-1.5" />
                    <span className="text-gray-600 text-base">{solution}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Results */}
            <motion.div variants={sectionVariants} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl font_play font-semibold text-gray-900 mb-4">
                Results
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-8">
                {caseStudy.results}
              </p>
            </motion.div>

            {/* CTA */}
            <GetInTouch title='Need Legal Assistance?' description='Contact us today to discuss how we can support your legal needs.'></GetInTouch>
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            className="lg:w-1/3 mt-12 lg:mt-0"
            variants={sidebarVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <FilterSidebar
            title="Service Insights"
            categories={categories}
            featuredItems={featuredCaseStudies}
            searchPlaceholder="Find services..."
            />
          </motion.aside>
        </div>
      </section>

      <Footer />
    </>
  );
}