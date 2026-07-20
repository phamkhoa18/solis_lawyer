'use client';

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
import { useLanguage } from '@/app/context/LanguageContext';

interface ServiceDetail {
  title: { en: string; vi: string };
  icon: string;
  alt: string;
  description: { en: string; vi: string };
  benefits: { en: string[]; vi: string[] };
  team: { name: string; role: { en: string; vi: string }; image: string }[];
}

const serviceData: Record<string, ServiceDetail> = {
  'criminal-law': {
    title: { en: 'Criminal Law', vi: 'Luật Hình Sự' },
    icon: '/images/icons/gun.png',
    alt: 'Criminal Law Icon',
    description: {
      en: 'Our criminal law experts provide robust defense and representation to protect your rights in all types of criminal cases, from minor offenses to serious felonies.',
      vi: 'Các chuyên gia luật hình sự của chúng tôi cung cấp dịch vụ bào chữa và đại diện mạnh mẽ để bảo vệ quyền lợi của bạn trong mọi loại vụ án hình sự.',
    },
    benefits: {
      en: [
        'Expert legal defense tailored to your case',
        '24/7 availability for emergencies',
        'Proven track record in court victories',
        'Confidential and compassionate support',
      ],
      vi: [
        'Bào chữa pháp lý chuyên nghiệp phù hợp với vụ việc của bạn',
        'Hỗ trợ 24/7 cho trường hợp khẩn cấp',
        'Thành tích chiến thắng tại tòa đã được chứng minh',
        'Hỗ trợ bảo mật và tận tâm',
      ],
    },
    team: [
      { name: 'John Doe', role: { en: 'Lead Criminal Attorney', vi: 'Luật sư Hình sự Trưởng' }, image: '/images/team/john-doe.jpg' },
      { name: 'Jane Smith', role: { en: 'Senior Associate', vi: 'Luật sư Cao cấp' }, image: '/images/team/jane-smith.jpg' },
    ],
  },
  'family-law': {
    title: { en: 'Family Law', vi: 'Luật Gia Đình' },
    icon: '/images/icons/family.png',
    alt: 'Family Law Icon',
    description: {
      en: 'We offer compassionate and strategic legal support for family-related matters, including divorce, child custody, and spousal support.',
      vi: 'Chúng tôi cung cấp hỗ trợ pháp lý chiến lược và tận tâm cho các vấn đề gia đình, bao gồm ly hôn, quyền nuôi con và cấp dưỡng.',
    },
    benefits: {
      en: [
        'Personalized family law solutions',
        'Mediation and litigation expertise',
        'Child-focused custody arrangements',
        'Emotional and legal guidance',
      ],
      vi: [
        'Giải pháp luật gia đình cá nhân hóa',
        'Chuyên môn hòa giải và tố tụng',
        'Sắp xếp quyền nuôi con lấy trẻ em làm trung tâm',
        'Hướng dẫn pháp lý và tinh thần',
      ],
    },
    team: [
      { name: 'Emily Brown', role: { en: 'Family Law Specialist', vi: 'Chuyên gia Luật Gia đình' }, image: '/images/team/emily-brown.jpg' },
      { name: 'Michael Lee', role: { en: 'Associate Attorney', vi: 'Luật sư Phối hợp' }, image: '/images/team/michael-lee.jpg' },
    ],
  },
  'migration-law': {
    title: { en: 'Migration Law', vi: 'Luật Di Trú' },
    icon: '/images/icons/fly.png',
    alt: 'Migration Law Icon',
    description: {
      en: 'Our migration law services ensure seamless visa applications, residency processes, and compliance with immigration regulations.',
      vi: 'Dịch vụ luật di trú của chúng tôi đảm bảo quá trình xin visa, thường trú và tuân thủ quy định nhập cư suôn sẻ.',
    },
    benefits: {
      en: [
        'Expert visa and residency guidance',
        'Tailored immigration strategies',
        'Appeal support for denied applications',
        'Up-to-date legal compliance',
      ],
      vi: [
        'Hướng dẫn visa và thường trú chuyên nghiệp',
        'Chiến lược nhập cư phù hợp',
        'Hỗ trợ kháng cáo cho đơn bị từ chối',
        'Tuân thủ pháp lý cập nhật',
      ],
    },
    team: [
      { name: 'Sarah Kim', role: { en: 'Migration Law Expert', vi: 'Chuyên gia Luật Di trú' }, image: '/images/team/sarah-kim.jpg' },
      { name: 'David Chen', role: { en: 'Immigration Consultant', vi: 'Tư vấn Nhập cư' }, image: '/images/team/david-chen.jpg' },
    ],
  },
  'conveyancing': {
    title: { en: 'Conveyancing', vi: 'Chuyển Nhượng Bất Động Sản' },
    icon: '/images/icons/appeal.png',
    alt: 'Conveyancing Icon',
    description: {
      en: 'We provide meticulous conveyancing services to ensure smooth and legally sound property transactions.',
      vi: 'Chúng tôi cung cấp dịch vụ chuyển nhượng tỉ mỉ để đảm bảo các giao dịch bất động sản suôn sẻ và hợp pháp.',
    },
    benefits: {
      en: [
        'Thorough property title checks',
        'Efficient transfer processes',
        'Legal risk mitigation',
        'Transparent fee structure',
      ],
      vi: [
        'Kiểm tra quyền sở hữu bất động sản kỹ lưỡng',
        'Quy trình chuyển nhượng hiệu quả',
        'Giảm thiểu rủi ro pháp lý',
        'Cấu trúc phí minh bạch',
      ],
    },
    team: [
      { name: 'Robert Taylor', role: { en: 'Conveyancing Specialist', vi: 'Chuyên gia Chuyển nhượng' }, image: '/images/team/robert-taylor.jpg' },
      { name: 'Lisa Adams', role: { en: 'Property Law Associate', vi: 'Luật sư Bất động sản' }, image: '/images/team/lisa-adams.jpg' },
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
  const { slug } = useParams() as { slug: string };
  const { language } = useLanguage();
  const lang = language.toLowerCase() as 'en' | 'vi';
  const service = serviceData[slug as keyof typeof serviceData] || serviceData['criminal-law'];

  const title = service.title[lang] || service.title.en;
  const description = service.description[lang] || service.description.en;
  const benefits = service.benefits[lang] || service.benefits.en;

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
                <Image
                  src={service.icon}
                  alt={service.alt}
                  width={64}
                  height={64}
                  className="transition-transform duration-300 hover:scale-110"
                />
                <h1 className="text-3xl font_play font-bold text-gray-900">{title}</h1>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
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
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#d5aa6d] text-white rounded-lg hover:bg-[#9b6f45] transition-colors duration-300"
              >
                {lang === 'vi' ? 'Yêu Cầu Tư Vấn' : 'Request Consultation'} <ArrowRight size={18} />
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
              <h2 className="text-2xl font_play font-semibold text-gray-900 mb-6">
                {lang === 'vi' ? 'Đội Ngũ Chuyên Gia' : 'Our Experts'}
              </h2>
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
                      <p className="text-gray-600 text-sm">{member.role[lang] || member.role.en}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font_play font-semibold text-gray-900 mb-4">
                {lang === 'vi' ? 'Dịch Vụ Liên Quan' : 'Related Services'}
              </h3>
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
                        {serviceData[key as keyof typeof serviceData].title[lang] || serviceData[key as keyof typeof serviceData].title.en}
                      </Link>
                    </li>
                  ))}
              </ul>
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