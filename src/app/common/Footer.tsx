"use client"

/* eslint-disable @next/next/no-img-element */
import { ChevronRight, Mail, MapPinHouse, Phone } from 'lucide-react'
import { Bird, Camera, PlayCircle, Briefcase, Users } from "lucide-react";
import React from 'react'
import { useLanguage } from '../context/LanguageContext'; // Adjust path as needed
import Link from 'next/link';

// Định nghĩa interface cho nội dung
interface FooterContent {
  quicklinks: string;
  headOffice: string;
  vietnamOffice: string;
  copyright: string;
  allRightsReserved: string;
  menuItems: {
    home: string;
    about: string;
    services: string;
    contact: string;
    team: string;
  };
  offices: {
    nsw: {
      title: string;
      address: string;
    };
    vic: {
      title: string;
      address: string;
    };
    qld: {
      title: string;
      address: string;
    };
    hcmc: {
      title: string;
      address: string;
    };
    haiphong: {
      title: string;
      address: string;
    };
  };
}

// Nội dung tiếng Việt và tiếng Anh
const content: Record<'VI' | 'EN', FooterContent> = {
  VI: {
    quicklinks: "Liên Kết Nhanh",
    headOffice: "Văn Phòng Úc",
    vietnamOffice: "Văn Phòng Việt Nam",
    copyright: "© Bản quyền 2025. Tất cả quyền được bảo lưu.",
    allRightsReserved: "Solis Lawyers",
    menuItems: {
      home: "Trang Chủ",
      about: "Giới Thiệu",
      services: "Dịch Vụ",
      contact: "Liên Hệ",
      team: "Đội Ngũ"
    },
    offices: {
      nsw: {
        title: "Trụ Sở Chính NSW",
        address: "Suite 34, Liberty Plaza, 256 Chapel Rd, Bankstown NSW 2200"
      },
      vic: {
        title: "Chi Nhánh Victoria",
        address: "Suite B03 / 93 Furlong Rd, Cairnlea VIC 3023"
      },
      qld: {
        title: "Chi Nhánh Queensland",
        address: "Suite 10 / 13 Karp Court, Bundall QLD 4217"
      },
      hcmc: {
        title: "VP TP. Hồ Chí Minh",
        address: "124 Điện Biên Phủ, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh"
      },
      haiphong: {
        title: "VP Hải Phòng",
        address: "HA1, 62 Vinhomes Marina Cầu Rào, An Biên, Lê Chân, Hải Phòng"
      }
    }
  },
  EN: {
    quicklinks: "Quick Links",
    headOffice: "Australia Offices",
    vietnamOffice: "Vietnam Offices",
    copyright: "© Copyright 2025. All rights reserved.",
    allRightsReserved: "Solis Lawyers",
    menuItems: {
      home: "Home",
      about: "About",
      services: "Services",
      contact: "Contact",
      team: "Our Team"
    },
    offices: {
      nsw: {
        title: "Head Office NSW",
        address: "Suite 34, Liberty Plaza, 256 Chapel Rd, Bankstown NSW 2200"
      },
      vic: {
        title: "Victoria Branch",
        address: "Suite B03 / 93 Furlong Rd, Cairnlea VIC 3023"
      },
      qld: {
        title: "Queensland Branch",
        address: "Suite 10 / 13 Karp Court, Bundall QLD 4217"
      },
      hcmc: {
        title: "Ho Chi Minh City Office",
        address: "124 Điện Biên Phủ, Đa Kao Ward, District 1, Ho Chi Minh City"
      },
      haiphong: {
        title: "Hai Phong Office",
        address: "HA1, 62 Vinhomes Marina Cầu Rào, An Biên, Lê Chân, Hai Phong"
      }
    }
  }
};

export default function Footer() {
  // Sử dụng context để quản lý ngôn ngữ
  const { language } = useLanguage();
  
  // Lấy nội dung theo ngôn ngữ hiện tại
  const currentContent = content[language];

  return (
    <section className='footer py-16 bg-[#121212] text-white'>
      <div className="container mx-auto px-3.5">
        <div className="grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 gap-8 mt-12">
          
          {/* Logo Section */}
          <div className="lg:col-span-1">
            <img className='w-[120px] mb-4' src="/images/logo/solislaw.png" alt="Solis Lawyers" />
            <p className="text-sm text-gray-400 leading-relaxed">
              {language === 'VI' 
                ? "Hãng luật uy tín tại Úc với hơn 10 năm kinh nghiệm trong lĩnh vực luật hình sự, di trú, gia đình và kháng cáo."
                : "Trusted law firm in Australia with over 10 years of experience in criminal law, immigration, family law and appeals."
              }
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h2 className="relative mb-6 text-xl font_play custom-title text-white">
              {currentContent.quicklinks}
            </h2>
            <div className="list-menu flex flex-col gap-3 text-[var(--paragraph)]">
              <Link href="/" className='flex gap-2 items-center hover:text-[#d5aa6d] transition-colors duration-300'>
                <ChevronRight className='text-[#d5aa6d]' size={18} strokeWidth={1.5} />
                <span>{currentContent.menuItems.home}</span>
              </Link>
              <a href="/about" className='flex gap-2 items-center hover:text-[#d5aa6d] transition-colors duration-300'>
                <ChevronRight className='text-[#d5aa6d]' size={18} strokeWidth={1.5} />
                <span>{currentContent.menuItems.about}</span>
              </a>
              <Link href="/services" className='flex gap-2 items-center hover:text-[#d5aa6d] transition-colors duration-300'>
                <ChevronRight className='text-[#d5aa6d]' size={18} strokeWidth={1.5} />
                <span>{currentContent.menuItems.services}</span>
              </Link>
              <a href="/team" className='flex gap-2 items-center hover:text-[#d5aa6d] transition-colors duration-300'>
                <ChevronRight className='text-[#d5aa6d]' size={18} strokeWidth={1.5} />
                <span>{currentContent.menuItems.team}</span>
              </a>
              <a href="/contact" className='flex gap-2 items-center hover:text-[#d5aa6d] transition-colors duration-300'>
                <ChevronRight className='text-[#d5aa6d]' size={18} strokeWidth={1.5} />
                <span>{currentContent.menuItems.contact}</span>
              </a>
            </div>
          </div>

          {/* Australia Offices */}
          <div className="lg:col-span-1">
            <h2 className="relative mb-6 text-xl font_play custom-title text-white">
              {currentContent.headOffice}
            </h2>
            <div className="space-y-4 text-sm">
              
              {/* NSW Office */}
              <div className="border-l-2 border-[#d5aa6d] pl-4">
                <h3 className="font-semibold text-[#d5aa6d] mb-2">{currentContent.offices.nsw.title}</h3>
                <div className="flex items-start gap-2 mb-2">
                  <MapPinHouse size={16} strokeWidth={1.5} className="shrink-0 text-[#d5aa6d] mt-0.5" />
                  <span className="text-gray-300 leading-relaxed">{currentContent.offices.nsw.address}</span>
                </div>
              </div>

              {/* VIC Office */}
              <div className="border-l-2 border-gray-600 pl-4">
                <h3 className="font-semibold text-gray-300 mb-2">{currentContent.offices.vic.title}</h3>
                <div className="flex items-start gap-2">
                  <MapPinHouse size={16} strokeWidth={1.5} className="shrink-0 text-gray-500 mt-0.5" />
                  <span className="text-gray-400 leading-relaxed text-xs">{currentContent.offices.vic.address}</span>
                </div>
              </div>

              {/* QLD Office */}
              <div className="border-l-2 border-gray-600 pl-4">
                <h3 className="font-semibold text-gray-300 mb-2">{currentContent.offices.qld.title}</h3>
                <div className="flex items-start gap-2">
                  <MapPinHouse size={16} strokeWidth={1.5} className="shrink-0 text-gray-500 mt-0.5" />
                  <span className="text-gray-400 leading-relaxed text-xs">{currentContent.offices.qld.address}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Vietnam Offices */}
          <div className="lg:col-span-1">
            <h2 className="relative mb-6 text-xl font_play custom-title text-white">
              {currentContent.vietnamOffice}
            </h2>
            <div className="space-y-4 text-sm">
              
              {/* HCMC Office */}
              <div className="border-l-2 border-[#d5aa6d] pl-4">
                <h3 className="font-semibold text-[#d5aa6d] mb-2">{currentContent.offices.hcmc.title}</h3>
                <div className="flex items-start gap-2">
                  <MapPinHouse size={16} strokeWidth={1.5} className="shrink-0 text-[#d5aa6d] mt-0.5" />
                  <span className="text-gray-300 leading-relaxed">{currentContent.offices.hcmc.address}</span>
                </div>
              </div>

              {/* Hai Phong Office */}
              <div className="border-l-2 border-gray-600 pl-4">
                <h3 className="font-semibold text-gray-300 mb-2">{currentContent.offices.haiphong.title}</h3>
                <div className="flex items-start gap-2">
                  <MapPinHouse size={16} strokeWidth={1.5} className="shrink-0 text-gray-500 mt-0.5" />
                  <span className="text-gray-400 leading-relaxed text-xs">{currentContent.offices.haiphong.address}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="relative mb-6 text-xl font_play custom-title text-white">
              {language === 'VI' ? 'Liên Hệ' : 'Contact Info'}
            </h2>
            <div className="list-menu flex flex-col gap-4 text-sm">
              <a href="tel:+61281025657" className="flex items-start gap-3 hover:text-[#d5aa6d] transition-colors duration-300">
                <Phone size={18} strokeWidth={1.5} className="shrink-0 text-[#d5aa6d] mt-0.5" />
                <span className="break-words leading-relaxed">(+61) 2 8102 5657</span>
              </a>

              <a href="mailto:contact@solislaw.com.au" className="flex items-start gap-3 hover:text-[#d5aa6d] transition-colors duration-300">
                <Mail size={18} strokeWidth={1.5} className="shrink-0 text-[#d5aa6d] mt-0.5" />
                <span className="break-words leading-relaxed">contact@solislaw.com.au</span>
              </a>

              <div className="mt-4">
                <h4 className="font-semibold text-white mb-3">
                  {language === 'VI' ? 'Giờ Làm Việc' : 'Office Hours'}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {language === 'VI' 
                    ? 'Thứ Hai - Thứ Sáu: 9:00 - 17:00\nThứ Bảy: 9:00 - 12:00'
                    : 'Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 9:00 AM - 12:00 PM'
                  }
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-white/10 mt-12 pt-6">
        <div className="container mx-auto px-3.5 flex flex-col lg:flex-row justify-between items-center gap-4 text-sm text-[var(--paragraph)]">
          
          {/* Copyright */}
          <p className="text-center lg:text-left">
            {currentContent.copyright}{" "}
            <span className="text-[#d5aa6d] font-semibold">{currentContent.allRightsReserved}</span>
          </p>

          {/* Social Icons */}
          <div className="flex items-center justify-center gap-4 text-white">
            <a href="#" target="_blank" className="hover:text-[#d5aa6d] transition-colors duration-300">
              <Users size={20} strokeWidth={1.5} />
            </a>
            <a href="#" target="_blank" className="hover:text-[#d5aa6d] transition-colors duration-300">
              <Bird size={20} strokeWidth={1.5} />
            </a>
            <a href="#" target="_blank" className="hover:text-[#d5aa6d] transition-colors duration-300">
              <Camera size={20} strokeWidth={1.5} />
            </a>
            <a href="#" target="_blank" className="hover:text-[#d5aa6d] transition-colors duration-300">
              <PlayCircle size={20} strokeWidth={1.5} />
            </a>
            <a href="#" target="_blank" className="hover:text-[#d5aa6d] transition-colors duration-300">
              <Briefcase size={20} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}