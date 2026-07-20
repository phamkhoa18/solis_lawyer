'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useLanguage } from '@/app/context/LanguageContext';
import { IService } from '@/lib/types/iservice';

interface ServiceData {
  icon: string;
  title: string;
  alt: string;
  href: string;
  description: string;
}

const mapServiceToCard = (service: IService, lang: 'en' | 'vi'): ServiceData => {
  const title = service.name?.[lang] || service.name?.en || 'Untitled Service';
  const description = service.description?.[lang] || service.description?.en || 'No description available';
  const href = service.link || '#';

  return {
    icon: service.img || '/fallback-image.jpg',
    title,
    alt: `${title} Icon`,
    href,
    description,
  };
};

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

export default function ServiceList({ services }: { services: IService[] }) {
  const { language } = useLanguage();
  const normalizedLanguage = language.toLowerCase() as 'en' | 'vi';
  const serviceCards = services.map((service) => mapServiceToCard(service, normalizedLanguage));

  if (services.length === 0) {
    return (
      <div className="flex items-center justify-center text-center">
        <p className="text-gray-500 text-lg">
          {normalizedLanguage === 'vi' ? 'Không có dịch vụ nào đang hoạt động.' : 'No active services available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 gap-6">
      {serviceCards.map((service, index) => (
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
            {normalizedLanguage === 'vi' ? 'Tìm Hiểu Thêm' : 'Learn More'}{' '}
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
