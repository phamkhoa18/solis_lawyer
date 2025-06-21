'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Header from '../common/Header';
import Footer from '../common/Footer';
import PageTitle from '../components/PageTitle';
import GetInTouch from '../components/GetInTouch';

const services = [
  {
    icon: '/images/icons/gun.png',
    title: 'Criminal Law',
    alt: 'Criminal Law Icon',
    href: '/services/criminal-law',
    description: 'Expert defense and representation in criminal cases, ensuring your rights are protected.',
  },
  {
    icon: '/images/icons/family.png',
    title: 'Family Law',
    alt: 'Family Law Icon',
    href: '/services/family-law',
    description: 'Compassionate legal support for family matters, including divorce and custody disputes.',
  },
  {
    icon: '/images/icons/fly.png',
    title: 'Migration Law',
    alt: 'Migration Law Icon',
    href: '/services/migration-law',
    description: 'Comprehensive assistance with visas, residency, and immigration compliance.',
  },
  {
    icon: '/images/icons/appeal.png',
    title: 'Conveyancing',
    alt: 'Conveyancing Icon',
    href: '/services/conveyancing',
    description: 'Seamless property transfer services with meticulous attention to legal details.',
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.6, -0.05, 0.01, 0.99],
      delay: i * 0.15,
    },
  }),
};


export default function ServicePage() {
  return (
    <>
      <Header />
      <section className="services bg-gray-50 min-h-screen">
        <PageTitle
          title="Our Services"
          backgroundImage="/images/bgbanner/page-title-bg.jpg"
          breadcrumb={[
            { label: 'Home', href: '/' },
            { label: 'Services' },
          ]}
        />

        <div className="container mx-auto px-3.5 lg:py-16 py-8 flex flex-col gap-8">
 
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                custom={index}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <Image
                      src={service.icon}
                      alt={service.alt}
                      width={56}
                      height={56}
                      className="group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xl font_play font-semibold text-gray-900 group-hover:text-[#B8967E] transition-colors duration-300">
                    {service.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {service.description}
                </p>
                <Link
                  href={service.href}
                  className="inline-flex items-center gap-2 text-[#B8967E] text-sm font-semibold uppercase tracking-wide group-hover:text-[#9b6f45] transition-colors duration-300"
                >
                  Learn More <ArrowRight size={16} strokeWidth={1.5} />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <GetInTouch title='Need Legal Assistance?' description='Contact us today to discuss how we can support your legal needs.'></GetInTouch>
        </div>
      </section>
      <Footer />
    </>
  );
}