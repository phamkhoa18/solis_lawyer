'use client';

import { AlignRight, ChevronDown, Globe, Mail, MapPinHouse, Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'VN'>('EN');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: language === 'EN' ? 'Home' : 'Trang Chủ', href: '/' },
    { name: language === 'EN' ? 'About' : 'Giới Thiệu', href: '/about' },
    {
      name: language === 'EN' ? 'Services' : 'Dịch Vụ',
      href: '/services',
      children: [
        { name: language === 'EN' ? 'Corporate Law' : 'Luật Doanh Nghiệp', href: '/services/corporate' },
        { name: language === 'EN' ? 'Family Law' : 'Luật Gia Đình', href: '/services/family' },
        { name: language === 'EN' ? 'Criminal Law' : 'Luật Hình Sự', href: '/services/criminal' },
      ],
    },
    { name: language === 'EN' ? 'Contact' : 'Liên Hệ', href: '/contact' },
  ];

  const languages = [
    { code: 'EN', label: 'English' },
    { code: 'VN', label: 'Tiếng Việt' },
  ];

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const mobileMenuVariants: Variants = {
    hidden: { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: '100%', transition: { duration: 0.3 } },
  };

  const searchPopupVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Top Header (Hides on Scroll) */}
      <div className={`top-header border-b border-white/20 bg-transparent ${isScrolled ? 'hidden' : 'block'}`}>
        <div className="container mx-auto px-4">
          <div className="py-4 justify-between lg:flex hidden text-sm text-white/80">
            <div className="time">{language === 'EN' ? 'Mon – Sun: 9:00 AM – 8:00 PM' : 'Thứ Hai – Chủ Nhật: 9:00 – 20:00'}</div>
            <div className="info flex gap-6">
              <a
                href="https://maps.google.com/?q=121+King+Street,+Melbourne"
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-2.5 items-center hover:text-[#d5aa6d] transition-colors"
              >
                <MapPinHouse color="#d5aa6d" strokeWidth={1.4} size={20} />
                121 King Street, Melbourne
              </a>
              <a
                href="mailto:info@solislaw.com.au"
                className="flex gap-2.5 items-center hover:text-[#d5aa6d] transition-colors"
              >
                <Mail color="#d5aa6d" strokeWidth={1.4} size={20} />
                info@solislaw.com.au
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div
        className={`main-header py-4 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Image
              src={isScrolled ? 'https://solislaw.com.au/wp-content/uploads/2023/08/solislaw-logo-dark.png' : '/images/logo/solislaw.png'}
              alt="Solis Law Logo"
              width={60}
              height={60}
              className="h-11 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 font-semibold transition-colors ${
                      isScrolled ? 'text-gray-800 hover:text-[#d5aa6d]' : 'text-white hover:text-[#d5aa6d]'
                    }`}
                  >
                    {item.name}
                    {item.children && (
                      <motion.div
                        animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown
                          size={17}
                          strokeWidth={2}
                          className={isScrolled ? 'text-gray-800' : 'text-white'}
                        />
                      </motion.div>
                    )}
                  </Link>
                  {item.children && (
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`absolute top-full left-0 mt-2 w-48 rounded-lg border shadow-lg ${
                            isScrolled ? 'bg-white border-gray-100' : 'bg-white/95 backdrop-blur-sm border-white/20'
                          } z-50`}
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block px-4 py-2 text-sm text-gray-800 hover:bg-[#d5aa6d] hover:text-white transition-colors"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Search Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(true)}
              className={`transition-colors ${
                isScrolled ? 'text-gray-800 hover:text-[#d5aa6d]' : 'text-white hover:text-[#d5aa6d]'
              }`}
            >
              <Search size={24} strokeWidth={1.5} />
            </motion.button>

            {/* Desktop Language Toggle */}
            <div
              className="relative"
              onMouseEnter={() => setIsLanguageDropdownOpen(true)}
              onMouseLeave={() => setIsLanguageDropdownOpen(false)}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`flex items-center gap-1 font-semibold transition-colors ${
                  isScrolled ? 'text-gray-800 hover:text-[#d5aa6d]' : 'text-white hover:text-[#d5aa6d]'
                }`}
              >
                <Globe size={20} strokeWidth={1.5} />
                {language}
              </motion.button>
              <AnimatePresence>
                {isLanguageDropdownOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`absolute top-full right-0 mt-2 w-32 rounded-lg border shadow-lg ${
                      isScrolled ? 'bg-white border-gray-100' : 'bg-white/95 backdrop-blur-sm border-white/20'
                    } z-50`}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as 'EN' | 'VN');
                          setIsLanguageDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-[#d5aa6d] hover:text-white transition-colors"
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Get Started CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              {language === 'EN' ? 'Get Started' : 'Bắt Đầu'}
            </motion.button>
          </div>

          {/* Mobile Icons */}
          <div className="flex items-center gap-4 lg:hidden">
            {/* Mobile Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className={`transition-colors ${
                isScrolled ? 'text-gray-800 hover:text-[#d5aa6d]' : 'text-white hover:text-[#d5aa6d]'
              } p-2`}
            >
              <Globe size={24} strokeWidth={1.5} />
            </motion.button>
            <AnimatePresence>
              {isLanguageDropdownOpen && !isMobileMenuOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute top-16 right-4 w-32 rounded-lg border shadow-lg bg-white border-gray-100 z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as 'EN' | 'VN');
                        setIsLanguageDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-[#d5aa6d] hover:text-white transition-colors"
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Search Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(true)}
              className={`transition-colors ${
                isScrolled ? 'text-gray-800 hover:text-[#d5aa6d]' : 'text-white hover:text-[#d5aa6d]'
              } p-2`}
            >
              <Search size={24} strokeWidth={1.5} />
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`transition-colors ${
                isScrolled ? 'text-gray-800 hover:text-[#d5aa6d]' : 'text-white hover:text-[#d5aa6d]'
              } p-2`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <AlignRight size={24} strokeWidth={1.5} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search Popup */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            variants={searchPopupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-white/95 backdrop-blur-sm z-60 flex items-center justify-center"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 text-gray-800"
              onClick={() => setIsSearchOpen(false)}
            >
              <X size={32} strokeWidth={2} />
            </motion.button>
            <div className="w-full max-w-2xl px-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder={language === 'EN' ? 'Search...' : 'Tìm kiếm...'}
                  className="w-full py-4 px-6 pr-12 text-lg rounded-full border border-gray-300 focus:outline-none focus:border-[#d5aa6d] text-gray-800 shadow-lg"
                  autoFocus
                />
                <Search
                  size={24}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 lg:hidden flex flex-col justify-center items-center"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 text-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={32} strokeWidth={2} />
            </motion.button>
            <nav className="flex flex-col items-center gap-6 text-center">
              {menuItems.map((item) => (
                <div key={item.name} className="w-full">
                  <Link
                    href={item.href}
                    className="block text-2xl font-semibold text-gray-800 hover:text-[#d5aa6d] transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.children && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                      className="mt-2"
                    >
                      <ChevronDown
                        size={20}
                        strokeWidth={2}
                        className={`transition-transform text-gray-800 ${
                          activeDropdown === item.name ? 'rotate-180' : ''
                        }`}
                      />
                    </motion.button>
                  )}
                  {item.children && activeDropdown === item.name && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="mt-2"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block py-2 text-lg text-gray-700 hover:text-[#d5aa6d] transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
              {/* Mobile Language Toggle */}
              <div className="mt-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center gap-2 text-lg text-gray-800 hover:text-[#d5aa6d]"
                >
                  <Globe size={20} strokeWidth={1.5} />
                  {language}
                </motion.button>
                <AnimatePresence>
                  {isLanguageDropdownOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="mt-2 w-32 rounded-lg border shadow-lg bg-white border-gray-100"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code as 'EN' | 'VN');
                            setIsLanguageDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-[#d5aa6d] hover:text-white transition-colors"
                        >
                          {lang.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}