'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Header from '@/app/common/Header';
import Footer from '@/app/common/Footer';
import PageTitle from '@/app/components/PageTitle';
import GetInTouch from '@/app/components/GetInTouch';
import { useParams } from 'next/navigation';

const serviceData = {
  'criminal-law': {
    title: 'Criminal Law',
    icon: '/images/icons/gun.png',
    alt: 'Criminal Law Icon',
    description: 'Our criminal law experts provide robust defense and representation to protect your rights in all types of criminal cases, from minor offenses to serious felonies.',
    benefits: [
      'Expert legal defense tailored to your case',
      '24/7 availability for emergencies',
      'Proven track record in court victories',
      'Confidential and compassionate support',
    ],
    team: [
      { name: 'John Doe', role: 'Lead Criminal Attorney', image: '/images/team/john-doe.jpg' },
      { name: 'Jane Smith', role: 'Senior Associate', image: '/images/team/jane-smith.jpg' },
    ],
  },
  'family-law': {
    title: 'Family Law',
    icon: '/images/icons/family.png',
    alt: 'Family Law Icon',
    description: 'We offer compassionate and strategic legal support for family-related matters, including divorce, child custody, and spousal support.',
    benefits: [
      'Personalized family law solutions',
      'Mediation and litigation expertise',
      'Child-focused custody arrangements',
      'Emotional and legal guidance',
    ],
    team: [
      { name: 'Emily Brown', role: 'Family Law Specialist', image: '/images/team/emily-brown.jpg' },
      { name: 'Michael Lee', role: 'Associate Attorney', image: '/images/team/michael-lee.jpg' },
    ],
  },
  'migration-law': {
    title: 'Migration Law',
    icon: '/images/icons/fly.png',
    alt: 'Migration Law Icon',
    description: 'Our migration law services ensure seamless visa applications, residency processes, and compliance with immigration regulations.',
    benefits: [
      'Expert visa and residency guidance',
      'Tailored immigration strategies',
      'Appeal support for denied applications',
      'Up-to-date legal compliance',
    ],
    team: [
      { name: 'Sarah Kim', role: 'Migration Law Expert', image: '/images/team/sarah-kim.jpg' },
      { name: 'David Chen', role: 'Immigration Consultant', image: '/images/team/david-chen.jpg' },
    ],
  },
  'conveyancing': {
    title: 'Conveyancing',
    icon: '/images/icons/appeal.png',
    alt: 'Conveyancing Icon',
    description: 'We provide meticulous conveyancing services to ensure smooth and legally sound property transactions.',
    benefits: [
      'Thorough property title checks',
      'Efficient transfer processes',
      'Legal risk mitigation',
      'Transparent fee structure',
    ],
    team: [
      { name: 'Robert Taylor', role: 'Conveyancing Specialist', image: '/images/team/robert-taylor.jpg' },
      { name: 'Lisa Adams', role: 'Property Law Associate', image: '/images/team/lisa-adams.jpg' },
    ],
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
    },
  }),
};

export default function ServiceDetailPage() {
  const { slug } = useParams() as { slug: string }
  const service = serviceData[slug as keyof typeof serviceData] || serviceData['criminal-law'];

  return (
    <>
      <Header />
      <section className="services bg-gray-50 min-h-screen">
        <PageTitle
          title={service.title}
          backgroundImage="/images/bgbanner/page-title-bg.jpg"
          breadcrumb={[
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/services' },
            { label: service.title, href: `/services/${slug}` },
          ]}
        />

        <div className="container mx-auto px-3.5 lg:py-16 py-8 flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <motion.div
              className="bg-white rounded-2xl shadow-sm p-8 mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-6 mb-6">
                <Image
                  src={service.icon}
                  alt={service.alt}
                  width={64}
                  height={64}
                  className="transition-transform duration-300 hover:scale-110"
                />
                <h1 className="text-3xl font_play font-bold text-gray-900">{service.title}</h1>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{service.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {service.benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    variants={cardVariants}
                    custom={index}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="text-[#d5aa6d] mt-1 flex-shrink-0" size={20} />
                    <p className="text-gray-700 text-base">{benefit}</p>
                  </motion.div>
                ))}
              </div>
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#d5aa6d] text-white rounded-lg hover:bg-[#9b6f45] transition-colors duration-300"
              >
                Request Consultation <ArrowRight size={18} />
              </Link>
            </motion.div>

            {/* Team Section */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm p-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font_play font-semibold text-gray-900 mb-6">Our Experts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {service.team.map((member, index) => (
                  <motion.div
                    key={member.name}
                    variants={cardVariants}
                    custom={index}
                    className="flex items-center gap-4"
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font_play font-medium text-gray-900">{member.name}</h3>
                      <p className="text-gray-600 text-sm">{member.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar (Filter or Related Services) */}
          <aside className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font_play font-semibold text-gray-900 mb-4">Related Services</h3>
              <ul className="space-y-3">
                {Object.keys(serviceData)
                  .filter((key) => key !== slug)
                  .map((key) => (
                    <li key={key}>
                      <Link
                        href={`/services/${key}`}
                        className="flex items-center gap-2 text-gray-700 text-sm font-medium hover:text-[#B8967E] transition-colors duration-300"
                      >
                        <ArrowRight size={16} className="text-[#d5aa6d]" />
                        {serviceData[key as keyof typeof serviceData].title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* CTA Section */}
        <GetInTouch
          title="Need Legal Assistance?"
          description="Contact us today to discuss how we can support your legal needs."
        />
      </section>
      <Footer />
    </>
  );
}