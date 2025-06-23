'use client';
/* eslint-disable @next/next/no-img-element */
import { MoveRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { IService } from '@/lib/types/iservice';
import { ApiResponse } from '@/lib/types/api-response';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-hot-toast';

// Define service data structure
interface ServiceData {
  icon: string;
  title: string;
  alt: string;
  href: string;
}

// Map IService to ServiceData based on language
const mapServiceToCard = (service: IService, lang: 'en' | 'vi'): ServiceData => {
  const title = service.name?.[lang] || 'Untitled Service';
  const href = service.link || '#';

  // Log for debugging Vietnamese issues
  if (lang === 'vi') {
    console.log(`Service ${service._id || 'unknown'}:`, {
      title: service.name?.vi,
      href: service.link,
    });
  }

  return {
    icon: service.img || '/fallback-image.jpg',
    title,
    alt: `${title} Icon`,
    href,
  };
};

export default function Services() {
  const { language } = useLanguage(); // Returns Lang ('EN' | 'VI')
  const normalizedLanguage = language.toLowerCase() as 'en' | 'vi';
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Log normalized language for debugging
  console.log('Normalized Language:', normalizedLanguage);

  // Animation variants for the heading
  const headingVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  // Animation variants for service cards
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        delay: i * 0.2,
      },
  }),
    exit: {
      opacity: 0,
      y: 30,
      transition: {
        duration: 0.4,
        ease: 'easeIn',
      },
    },
  };

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/services');
      const data: ApiResponse<IService[]> = await res.json();
      if (data.success && data.data) {
        console.log('API Response:', data.data);
        setServices(data.data);
      } else {
        setError(data.message || 'Không thể tải dịch vụ');
        toast.error(data.message || 'Không thể tải dịch vụ');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi kết nối server';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Map services to card data using normalized language
  const serviceCards = services.map((service) => mapServiceToCard(service, normalizedLanguage));

  return (
    <section className="services py-16">
      <div className="container mx-auto px-3.5">
        <div className="heading-1 flex items-center justify-center flex-col gap-4">
          <motion.h4
            className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold leading-[1.3]"
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {normalizedLanguage === 'vi' ? 'DỊCH VỤ' : 'SERVICES'}
          </motion.h4>
          <motion.h2
            className="font_play text-4xl text-center"
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.2 }}
          >
            {normalizedLanguage === 'vi'
              ? 'Chúng tôi là chuyên gia trong mọi loại dịch vụ pháp lý'
              : 'We are experts at all types of legal services'}
          </motion.h2>
        </div>

        {isLoading ? (
          <div className="body-service grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-12 md:px-0">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="service-card mb-4 bg-white p-6 text-center flex flex-col justify-between border-2 border-[rgb(0_0_0_/_8%)] lg:border-0 lg:border-r-2 lg:border-r-[rgb(0_0_0_/_8%)] last:lg:border-r-0"
              >
                <Skeleton className="h-16 w-16 mx-auto mb-4" />
                <Skeleton className="h-6 w-3/4 mx-auto mb-5" />
                <Skeleton className="h-4 w-1/3 mx-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center text-center mt-12">
            <div className="space-y-4">
              <p className="text-red-500 text-lg">{error}</p>
              <Button
                onClick={fetchServices}
                className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white hover:opacity-90"
              >
                {normalizedLanguage === 'vi' ? 'Thử lại' : 'Try Again'}
              </Button>
            </div>
          </div>
        ) : serviceCards.length === 0 ? (
          <div className="flex items-center justify-center text-center mt-12">
            <p className="text-gray-500 text-lg">
              {normalizedLanguage === 'vi' ? 'Không có dịch vụ nào đang hoạt động.' : 'No active services available.'}
            </p>
          </div>
        ) : (
          <div className="body-service grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-12 md:px-0">
            {serviceCards.map((service, index) => (
              <motion.div
                key={service.title}
                className="group service-card mb-4 bg-white p-6 cursor-pointer transition-shadow duration-300 text-center flex flex-col justify-between border-2 border-[rgb(0_0_0_/_8%)] lg:border-0 lg:border-r-2 lg:border-r-[rgb(0_0_0_/_8%)] last:lg:border-r-0 hover:shadow-lg"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                exit="exit"
                viewport={{ once: false, amount: 0.3 }}
                custom={index}
              >
                <div className="icon mb-4 transition-all duration-500 ease-out group-hover:-translate-y-2">
                  <img src={service.icon} alt={service.alt} className="mx-auto h-16 w-16" />
                </div>
                <h3 className="text-xl font-semibold mb-5 font_play">{service.title}</h3>
                <div className="overflow-hidden h-6">
                  <Link
                    href={service.href}
                    className="text-gray-600 flex items-center gap-1.5 transition-all duration-700 ease-out translate-x-0 opacity-100 lg:-translate-x-5 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:text-right justify-center"
                  >
                    {normalizedLanguage === 'vi' ? 'Xem Thêm' : 'View More'}
                    <MoveRight strokeWidth={1.5} size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}