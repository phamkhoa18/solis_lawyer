'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Header from '@/app/common/Header';
import Footer from '@/app/common/Footer';
import PageTitle from '@/app/components/PageTitle';
import GetInTouch from '@/app/components/GetInTouch';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import { IService } from '@/lib/types/iservice';
import { IMember } from '@/lib/types/imember';

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
  const { slug } = useParams() as { slug: string };
  const { language } = useLanguage();
  const lang = language.toLowerCase() as 'en' | 'vi';
  
  const [service, setService] = useState<IService | null>(null);
  const [allServices, setAllServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success && data.data) {
          const services: IService[] = data.data;
          setAllServices(services);
          // Find the service that matches the slug
          const found = services.find((s) => s.link === `/services/${slug}` || s.link.endsWith(`/${slug}`));
          setService(found || null);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-10 h-10 animate-spin text-[#B8967E]" />
        </div>
        <Footer />
      </>
    );
  }

  if (!service) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {lang === 'vi' ? 'Không tìm thấy dịch vụ' : 'Service not found'}
          </h1>
          <Link href="/services" className="text-[#B8967E] hover:underline">
            {lang === 'vi' ? 'Quay lại danh sách dịch vụ' : 'Back to services list'}
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const title = service.name?.[lang] || service.name?.en || '';
  const description = service.description?.[lang] || service.description?.en || '';
  const benefits = service.benefits?.[lang] || [];
  const team = (service.team || []) as IMember[];

  // Lấy danh sách các dịch vụ liên quan (loại trừ dịch vụ hiện tại)
  const relatedServices = allServices.filter((s) => s._id !== service._id).slice(0, 5);

  return (
    <>
      <Header />
      <section className="services bg-gray-50 min-h-screen">
        <PageTitle
          title={title}
          backgroundImage="/images/bgbanner/page-title-bg.jpg"
          breadcrumb={[
            { label: lang === 'vi' ? 'Trang chủ' : 'Home', href: '/' },
            { label: lang === 'vi' ? 'Dịch vụ' : 'Services', href: '/services' },
            { label: title, href: `/services/${slug}` },
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
                {(service.icon || service.img) && (
                  <Image
                    src={service.icon || service.img}
                    alt={title}
                    width={64}
                    height={64}
                    className="transition-transform duration-300 hover:scale-110 object-contain h-16 w-16"
                  />
                )}
                <h1 className="text-3xl font_play font-bold text-gray-900">{title}</h1>
              </div>
              
              {service.img && !service.icon && (
                <div className="w-full h-64 md:h-96 relative mb-6 rounded-xl overflow-hidden">
                   <Image src={service.img} alt={title} fill className="object-cover" />
                </div>
              )}

              <p className="text-gray-600 text-lg leading-relaxed mb-6 whitespace-pre-wrap">{description}</p>
              
              {benefits.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={cardVariants}
                      custom={index}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle className="text-[#d5aa6d] mt-1 flex-shrink-0" size={20} />
                      <p className="text-gray-700 text-base">{benefit}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#d5aa6d] text-white rounded-lg hover:bg-[#9b6f45] transition-colors duration-300"
              >
                {lang === 'vi' ? 'Yêu Cầu Tư Vấn' : 'Request Consultation'} <ArrowRight size={18} />
              </Link>
            </motion.div>

            {/* Team Section */}
            {team.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl shadow-sm p-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font_play font-semibold text-gray-900 mb-6">
                  {lang === 'vi' ? 'Đội Ngũ Chuyên Gia' : 'Our Experts'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {team.map((member, index) => (
                    <motion.div
                      key={member._id as string}
                      variants={cardVariants}
                      custom={index}
                      className="flex items-center gap-4"
                    >
                      <Image
                        src={member.image}
                        alt={member.name?.[lang] || ''}
                        width={80}
                        height={80}
                        className="rounded-full object-cover w-20 h-20 shadow-sm border border-gray-100"
                      />
                      <div>
                        <h3 className="text-lg font_play font-medium text-gray-900">{member.name?.[lang]}</h3>
                        <p className="text-gray-600 text-sm">{member.position?.[lang]}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font_play font-semibold text-gray-900 mb-4">
                {lang === 'vi' ? 'Dịch Vụ Liên Quan' : 'Related Services'}
              </h3>
              {relatedServices.length > 0 ? (
                <ul className="space-y-3">
                  {relatedServices.map((rs) => (
                    <li key={rs._id as string}>
                      <Link
                        href={rs.link || '#'}
                        className="flex items-center gap-2 text-gray-700 text-sm font-medium hover:text-[#B8967E] transition-colors duration-300"
                      >
                        <ArrowRight size={16} className="text-[#d5aa6d]" />
                        {rs.name?.[lang] || rs.name?.en}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  {lang === 'vi' ? 'Chưa có dịch vụ liên quan' : 'No related services yet'}
                </p>
              )}
            </div>
          </aside>
        </div>

        {/* CTA Section */}
        <GetInTouch
          title={lang === 'vi' ? 'Cần Hỗ Trợ Pháp Lý?' : 'Need Legal Assistance?'}
          description={lang === 'vi' ? 'Liên hệ với chúng tôi hôm nay để thảo luận về nhu cầu pháp lý của bạn.' : 'Contact us today to discuss how we can support your legal needs.'}
        />
      </section>
      <Footer />
    </>
  );
}