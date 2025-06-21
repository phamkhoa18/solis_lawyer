'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Header from '../common/Header';
import Footer from '../common/Footer';
import PageTitle from '../components/PageTitle';
import FilterSidebar from '../components/FilterSidebar';

const sidebarVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99], delay: 0.3 },
  },
};

const caseStudies = [
  {
    title: 'Business Migration Success',
    image: '/images/casestudy/1.jpg',
    date: '15 Jun 2019',
    link: '/case-studies/business-migration',
    alt: 'Business Migration Case Study',
    excerpt: 'Streamlined migration process for a multinational company with tailored legal solutions.',
  },
  {
    title: 'Startup Legal Strategy',
    image: '/images/casestudy/1.jpg',
    date: '02 Dec 2020',
    link: '/case-studies/startup-strategy',
    alt: 'Startup Legal Strategy Case Study',
    excerpt: 'Built a robust legal framework to support a tech startup’s rapid growth.',
  },
  {
    title: 'Immigration Settlement Case',
    image: '/images/casestudy/1.jpg',
    date: '18 Mar 2023',
    link: '/case-studies/immigration-settlement',
    alt: 'Immigration Settlement Case Study',
    excerpt: 'Navigated complex immigration laws for a family’s successful settlement.',
  },
  {
    title: 'Corporate Restructuring Triumph',
    image: '/images/casestudy/1.jpg',
    date: '10 Sep 2022',
    link: '/case-studies/corporate-restructuring',
    alt: 'Corporate Restructuring Case Study',
    excerpt: 'Guided a corporation through seamless restructuring for operational efficiency.',
  },
];

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

        <div className="container mx-auto px-4 py-12 lg:flex lg:gap-8"> {/* Giữ layout cố định */}
          {/* Main Content */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caseStudies.map((item, index) => (
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
                      {item.date}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <h3 className="text-lg font_play font-semibold text-gray-900 group-hover:text-[#B8967E] transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {item.excerpt}
                    </p>
                    <Link
                      href={item.link}
                      className="inline-flex items-center gap-1 text-[#B8967E] text-sm font-medium hover:text-[#9b6f45] transition-colors duration-200"
                    >
                      Read More <Plus size={16} strokeWidth={1.5} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Reusable Filter Sidebar */}
            <motion.aside className="lg:w-1/3 mt-8 lg:mt-0"  variants={sidebarVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}>
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