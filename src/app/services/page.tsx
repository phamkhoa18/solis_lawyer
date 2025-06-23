'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Header from '../common/Header';
import Footer from '../common/Footer';
import PageTitle from '../components/PageTitle';
import GetInTouch from '../components/GetInTouch';
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
  description: string;
}

// Map IService to ServiceData based on language
const mapServiceToCard = (service: IService, lang: 'en' | 'vi'): ServiceData => {
  const title = service.name?.[lang] || 'Untitled Service';
  const description = service.description?.[lang] || 'No description available';
  const href = service.link || '#';

  // Log for debugging Vietnamese issues
  if (lang === 'vi') {
    console.log(`Service ${service._id || 'unknown'}:`, {
      title: service.name?.vi,
      description: service.description?.vi,
      href: service.link,
    });
  }

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

export default function ServicePage() {
  const { language } = useLanguage(); // Returns Lang ('EN' | 'VI')
  const normalizedLanguage = language.toLowerCase() as 'en' | 'vi';
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Log normalized language for debugging
  console.log('Normalized Language:', normalizedLanguage);

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
    <>
      <Header />
      <section className="services bg-gray-50 min-h-screen">
        <PageTitle
          title={normalizedLanguage === 'vi' ? 'Dịch Vụ Của Chúng Tôi' : 'Our Services'}
          backgroundImage="/images/bgbanner/page-title-bg.jpg"
          breadcrumb={[
            { label: normalizedLanguage === 'vi' ? 'Trang Chủ' : 'Home', href: '/' },
            { label: normalizedLanguage === 'vi' ? 'Dịch Vụ' : 'Services' },
          ]}
        />

        <div className="container mx-auto px-3.5 lg:py-16 py-8 flex flex-col gap-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-14 w-14" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center text-center">
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
          ) : services.length === 0 ? (
            <div className="flex items-center justify-center text-center">
              <p className="text-gray-500 text-lg">
                {normalizedLanguage === 'vi' ? 'Không có dịch vụ nào đang hoạt động.' : 'No active services available.'}
              </p>
            </div>
          ) : (
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
          )}

          {/* CTA Section */}
          <GetInTouch
            title={normalizedLanguage === 'vi' ? 'Cần Hỗ Trợ Pháp Lý?' : 'Need Legal Assistance?'}
            description={
              normalizedLanguage === 'vi'
                ? 'Liên hệ với chúng tôi hôm nay để thảo luận về cách chúng tôi có thể hỗ trợ nhu cầu pháp lý của bạn.'
                : 'Contact us today to discuss how we can support your legal needs.'
            }
          />
        </div>
      </section>
      <Footer />
    </>
  );
}