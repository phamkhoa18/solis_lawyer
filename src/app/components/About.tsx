"use client"

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';


// Định nghĩa interface cho nội dung
interface Content {
  aboutUs: string;
  title: string;
  description1: string;
  description2: string;
  learnMore: string;
}

// Nội dung tiếng Việt và tiếng Anh
const content: Record<'VI' | 'EN', Content> = {
  VI: {
    aboutUs: "VỀ CHÚNG TÔI",
    title: "Chuyên Nghiệp – Tận Tâm – Hiệu Quả",
    description1: "**Solis Lawyers** là một **hãng luật uy tín tại Úc**, được thành lập với sứ mệnh mang đến các dịch vụ pháp lý chuyên sâu, tận tâm và hiệu quả cho cộng đồng. Chúng tôi tập trung vào **bốn lĩnh vực cốt lõi**: **luật hình sự**, **luật di trú**, **hôn nhân – gia đình** và **kháng cáo tại tòa cấp trên**. Với đội ngũ luật sư dày dạn kinh nghiệm, Solis Lawyers đã đại diện và bảo vệ quyền lợi cho nhiều khách hàng trong các **vụ án hình sự phức tạp**, hỗ trợ thành công trong các **hồ sơ di trú và kháng cáo di trú**.",
    description2: "Chúng tôi luôn đặt **lợi ích của khách hàng làm trung tâm**, kết hợp giữa **chuyên môn pháp lý vững chắc** và **sự tận tâm trong từng vụ việc**, nhằm mang đến giải pháp tối ưu và sự an tâm tuyệt đối. Với phương châm **\"Chuyên nghiệp – Tận tâm – Hiệu quả\"**, Solis Lawyers cam kết tiếp tục đồng hành và bảo vệ quyền lợi hợp pháp của khách hàng trong mọi tình huống pháp lý, từ đơn giản đến phức tạp.",
    learnMore: "Tìm Hiểu Thêm"
  },
  EN: {
    aboutUs: "ABOUT US",
    title: "Professionalism – Dedication – Effectiveness",
    description1: "**Solis Lawyers** is a **trusted law firm in Australia**, established with the mission of providing specialised, dedicated, and effective legal services to the community. Our practice focuses on **four core areas**: **criminal law**, **immigration law**, **family law**, and **appellate advocacy before higher courts**. With a team of highly experienced lawyers, Solis Lawyers has successfully represented and protected clients in **complex criminal cases**, provided strategic support in **immigration matters and appeals**.",
    description2: "At Solis Lawyers, we place our **clients' interests at the centre** of everything we do. By combining **strong legal expertise** with a **client-focused approach**, we are committed to delivering optimal legal solutions and ensuring peace of mind in every case, whether simple or highly complex. Guided by the principle of **\"Professionalism – Dedication – Effectiveness\"**, Solis Lawyers continues to stand as a reliable partner, safeguarding the legal rights of our clients across all challenging circumstances.",
    learnMore: "Learn More"
  }
};

export default function About() {
  // Sử dụng context để quản lý ngôn ngữ
  const { language } = useLanguage();
  
  // Lấy nội dung theo ngôn ngữ hiện tại
  const currentContent = content[language];

  // Hàm để render text với bold formatting
  const renderTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <strong 
            key={index} 
            className="font-bold"
          >
            {boldText}
          </strong>
        );
      }
      return part;
    });
  };

  const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="about lg:py-20 py-16 lg:pb-24 relative overflow-hidden">

      <motion.div
        className="absolute bottom-0 left-0 z-[-1] lg:block hidden"
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img src="/images/about/about-image2.png" alt="Background decoration" />
      </motion.div>
      
      <div className="container mx-auto px-3.5">
        <div className="flex lg:flex-row flex-col gap-8">
          <motion.div
            key={language} // Key để trigger re-animation khi đổi ngôn ngữ
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="lg:w-[48%] w-full"
          >
            <div className="heading-1 flex justify-center flex-col gap-4">
              <h4 className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold">
                {currentContent.aboutUs}
              </h4>
              <h2 className="font_play lg:text-4xl text-3xl leading-[1.3]">
                {currentContent.title}
              </h2>
              <p className="text-justify text-[var(--paragraph)] leading-relaxed text-lg">
                {renderTextWithBold(currentContent.description1)}
              </p>
              <p className="text-justify text-[var(--paragraph)] leading-relaxed text-lg">
                {renderTextWithBold(currentContent.description2)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:flex-row">
              <Link
                href=""
                className="mt-7 inline-block bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out"
              >
                {currentContent.learnMore}
              </Link>
            </div>
          </motion.div>

          <div className="lg:w-[52%] w-full">
            <motion.div
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.3 }}
            >
              <img src="/images/about/about-image1.png" alt="About us image" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}