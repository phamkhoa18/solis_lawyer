// Contact Component
"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin, Building2, Clock, Send, CheckCircle } from 'lucide-react';

interface Office {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  isMain?: boolean;
}

interface ContactContent {
  pageTitle: string;
  pageSubtitle: string;
  formTitle: string;
  offices: Office[];
  form: {
    fullName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    submit: string;
    submitting: string;
    success: string;
  };
  workingHours: {
    title: string;
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

const content: Record<'VI' | 'EN', ContactContent> = {
  VI: {
    pageTitle: "Liên Hệ Với Chúng Tôi",
    pageSubtitle: "Hãy để chúng tôi hỗ trợ bạn trong mọi vấn đề pháp lý",
    formTitle: "Gửi Tin Nhắn Cho Chúng Tôi",
    offices: [
      {
        id: "nsw",
        name: "Trụ Sở Chính NSW",
        address: "Suite 34, Liberty Plaza, 256 Chapel Rd, Bankstown NSW 2200",
        phone: "+61 2 8102 5657",
        email: "contact@solislaw.com.au",
        description: "Trụ sở chính tại Bankstown, trung tâm điều phối toàn hệ thống với đội ngũ luật sư dày dạn kinh nghiệm.",
        isMain: true
      },
      {
        id: "vic",
        name: "Chi Nhánh Victoria",
        address: "Suite B03 / 93 Furlong Rd, Cairnlea VIC 3023",
        phone: "+61 2 8102 5657",
        email: "melbourne@solislaw.com.au",
        description: "Phục vụ khách hàng tại Melbourne và các vùng lân cận với dịch vụ pháp lý chuyên nghiệp."
      },
      {
        id: "qld",
        name: "Chi Nhánh Queensland",
        address: "Suite 10 / 13 Karp Court, Bundall QLD 4217",
        phone: "+61 2 8102 5657",
        email: "goldcoast@solislaw.com.au",
        description: "Tại trung tâm Gold Coast, cung cấp dịch vụ pháp lý nhanh chóng và hiệu quả."
      },
      {
        id: "hcmc",
        name: "VP TP. Hồ Chí Minh",
        address: "124 Điện Biên Phủ, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh",
        phone: "+84 28 1234 5678",
        email: "hcmc@solislaw.com.au",
        description: "Cầu nối quan trọng giữa Solis Lawyers và khách hàng tại Việt Nam, hỗ trợ các vấn đề pháp lý xuyên biên giới."
      },
      {
        id: "haiphong",
        name: "VP Hải Phòng",
        address: "HA1, 62 Vinhomes Marina Cầu Rào, An Biên, Lê Chân, Hải Phòng",
        phone: "+84 225 1234 567",
        email: "haiphong@solislaw.com.au",
        description: "Phục vụ nhu cầu pháp lý ngày càng tăng của khách hàng tại khu vực phía Bắc Việt Nam."
      }
    ],
    form: {
      fullName: "Họ và Tên",
      email: "Email",
      phone: "Số Điện Thoại",
      subject: "Chủ Đề",
      message: "Tin Nhắn",
      submit: "Gửi Tin Nhắn",
      submitting: "Đang Gửi...",
      success: "Tin nhắn đã được gửi thành công!"
    },
    workingHours: {
      title: "Giờ Làm Việc",
      weekdays: "Thứ Hai - Thứ Sáu: 9:00 - 17:00",
      saturday: "Thứ Bảy: 9:00 - 12:00",
      sunday: "Chủ Nhật: Đóng cửa"
    }
  },
  EN: {
    pageTitle: "Contact Us",
    pageSubtitle: "Let us help you with all your legal needs",
    formTitle: "Send Us a Message",
    offices: [
      {
        id: "nsw",
        name: "Head Office NSW",
        address: "Suite 34, Liberty Plaza, 256 Chapel Rd, Bankstown NSW 2200",
        phone: "+61 2 8102 5657",
        email: "contact@solislaw.com.au",
        description: "Our head office in Bankstown, the strategic coordination center with highly experienced legal team.",
        isMain: true
      },
      {
        id: "vic",
        name: "Victoria Branch",
        address: "Suite B03 / 93 Furlong Rd, Cairnlea VIC 3023",
        phone: "+61 2 8102 5657",
        email: "melbourne@solislaw.com.au",
        description: "Serving clients in Melbourne and surrounding areas with professional legal services."
      },
      {
        id: "qld",
        name: "Queensland Branch",
        address: "Suite 10 / 13 Karp Court, Bundall QLD 4217",
        phone: "+61 2 8102 5657",
        email: "goldcoast@solislaw.com.au",
        description: "Located in the heart of Gold Coast, providing timely and effective legal services."
      },
      {
        id: "hcmc",
        name: "Ho Chi Minh City Office",
        address: "124 Điện Biên Phủ, Đa Kao Ward, District 1, Ho Chi Minh City",
        phone: "+84 28 1234 5678",
        email: "hcmc@solislaw.com.au",
        description: "Important bridge between Solis Lawyers and clients in Vietnam, supporting cross-border legal issues."
      },
      {
        id: "haiphong",
        name: "Hai Phong Office",
        address: "HA1, 62 Vinhomes Marina Cầu Rào, An Biên, Lê Chân, Hai Phong",
        phone: "+84 225 1234 567",
        email: "haiphong@solislaw.com.au",
        description: "Meeting the growing legal needs of clients in Northern Vietnam region."
      }
    ],
    form: {
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      subject: "Subject",
      message: "Message",
      submit: "Send Message",
      submitting: "Sending...",
      success: "Message sent successfully!"
    },
    workingHours: {
      title: "Working Hours",
      weekdays: "Monday - Friday: 9:00 AM - 5:00 PM",
      saturday: "Saturday: 9:00 AM - 12:00 PM",
      sunday: "Sunday: Closed"
    }
  }
};

export default function Contact() {
  const { language } = useLanguage();
  const currentContent = content[language];
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-[#d5aa6d]/5 to-[#9b6f45]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-[#d5aa6d]/3 to-[#9b6f45]/3 rounded-full blur-2xl"></div>

      <div className="container mx-auto px-4 py-8 lg:py-24 relative z-10">


        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-12">
          
          {/* Office Locations - 2 columns on desktop, full width on mobile */}
          <div className="lg:col-span-2 space-y-6">
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl lg:text-3xl font_play text-[var(--heading-color)] mb-6 lg:mb-8"
            >
              {language === 'VI' ? 'Hệ Thống Văn Phòng' : 'Our Office Network'}
            </motion.h2>
            
            {/* Mobile: Stack vertically, Desktop: 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {currentContent.offices.map((office, index) => (
                <motion.div
                  key={office.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className={`group bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 ${
                    office.isMain 
                      ? 'border-[#d5aa6d]/30 bg-gradient-to-br from-[#d5aa6d]/5 to-white' 
                      : 'border-gray-100 hover:border-[#d5aa6d]/20'
                  }`}
                >
                  
                  {/* Office Header */}
                  <div className="flex items-start gap-3 lg:gap-4 mb-3 lg:mb-4">
                    <div className={`p-2 lg:p-3 rounded-lg lg:rounded-xl flex-shrink-0 ${
                      office.isMain 
                        ? 'bg-gradient-to-br from-[#d5aa6d] to-[#9b6f45] text-white' 
                        : 'bg-gradient-to-br from-[#d5aa6d]/10 to-[#9b6f45]/10 text-[#d5aa6d] group-hover:from-[#d5aa6d] group-hover:to-[#9b6f45] group-hover:text-white'
                    } transition-all duration-300`}>
                      <Building2 size={20} className="lg:w-6 lg:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base lg:text-lg xl:text-xl font-bold mb-1 ${
                        office.isMain ? 'text-[#d5aa6d]' : 'text-[var(--heading-color)] group-hover:text-[#d5aa6d]'
                      } transition-colors duration-300 leading-tight`}>
                        {office.name}
                        {office.isMain && (
                          <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0 text-xs bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white px-2 py-1 rounded-full">
                            {language === 'VI' ? 'Trụ sở chính' : 'Head Office'}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs lg:text-sm text-[var(--paragraph)] leading-relaxed">
                        {office.description}
                      </p>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-2 lg:space-y-3">
                    <div className="flex items-start gap-2 lg:gap-3">
                      <MapPin size={14} className="text-[#9b6f45] mt-1 flex-shrink-0 lg:w-4 lg:h-4" />
                      <p className="text-xs lg:text-sm text-[var(--paragraph)] leading-relaxed">
                        {office.address}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Phone size={14} className="text-[#9b6f45] flex-shrink-0 lg:w-4 lg:h-4" />
                      <a 
                        href={`tel:${office.phone}`}
                        className="text-xs lg:text-sm text-[var(--paragraph)] hover:text-[#d5aa6d] transition-colors duration-300"
                      >
                        {office.phone}
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Mail size={14} className="text-[#9b6f45] flex-shrink-0 lg:w-4 lg:h-4" />
                      <a 
                        href={`mailto:${office.email}`}
                        className="text-xs lg:text-sm text-[var(--paragraph)] hover:text-[#d5aa6d] transition-colors duration-300 break-all"
                      >
                        {office.email}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact Form & Working Hours - 1 column, full width on mobile */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-6">
            
            {/* Working Hours */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                <Clock className="text-[#d5aa6d]" size={20} />
                <h3 className="text-lg lg:text-xl font-bold text-[var(--heading-color)]">
                  {currentContent.workingHours.title}
                </h3>
              </div>
              <div className="space-y-1 lg:space-y-2 text-xs lg:text-sm text-[var(--paragraph)]">
                <p className="font-medium">{currentContent.workingHours.weekdays}</p>
                <p>{currentContent.workingHours.saturday}</p>
                <p className="text-gray-400">{currentContent.workingHours.sunday}</p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 xl:p-8 shadow-xl border border-gray-100"
            >
              <h3 className="text-xl lg:text-2xl font_play text-[var(--heading-color)] mb-4 lg:mb-6 text-center">
                {currentContent.formTitle}
              </h3>

              {/* Success Message */}
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-lg lg:rounded-xl p-3 lg:p-4 mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3"
                >
                  <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                  <p className="text-green-800 font-medium text-sm lg:text-base">
                    {currentContent.form.success}
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
                
                {/* Name & Email Row - Stack on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--heading-color)] mb-1 lg:mb-2">
                      {currentContent.form.fullName}
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-lg lg:rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#d5aa6d] focus:border-[#d5aa6d] transition-all duration-300 outline-none text-sm lg:text-base"
                      placeholder={currentContent.form.fullName}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--heading-color)] mb-1 lg:mb-2">
                      {currentContent.form.email}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-lg lg:rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#d5aa6d] focus:border-[#d5aa6d] transition-all duration-300 outline-none text-sm lg:text-base"
                      placeholder={currentContent.form.email}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-[var(--heading-color)] mb-1 lg:mb-2">
                    {currentContent.form.phone}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-lg lg:rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#d5aa6d] focus:border-[#d5aa6d] transition-all duration-300 outline-none text-sm lg:text-base"
                    placeholder={currentContent.form.phone}
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-[var(--heading-color)] mb-1 lg:mb-2">
                    {currentContent.form.subject}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-lg lg:rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#d5aa6d] focus:border-[#d5aa6d] transition-all duration-300 outline-none text-sm lg:text-base"
                    placeholder={currentContent.form.subject}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-[var(--heading-color)] mb-1 lg:mb-2">
                    {currentContent.form.message}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-lg lg:rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#d5aa6d] focus:border-[#d5aa6d] transition-all duration-300 outline-none resize-none text-sm lg:text-base lg:rows-5"
                    placeholder={currentContent.form.message}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  className={`w-full py-3 lg:py-4 px-4 lg:px-6 rounded-lg lg:rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 lg:gap-3 text-sm lg:text-base ${
                    isSubmitting || isSuccess
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] hover:from-[#b8975b] hover:to-[#8a623d] hover:scale-105'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {currentContent.form.submitting}
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle size={18} />
                      {currentContent.form.success}
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {currentContent.form.submit}
                    </>
                  )}
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}