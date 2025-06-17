'use client';

import { AlignRight, ChevronDown, Mail, MapPinHouse, Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Home', href: '/' },
    {
      name: 'Services',
      href: '/services',
      children: [
        { name: 'Corporate Law', href: '/services/corporate' },
        { name: 'Family Law', href: '/services/family' },
        { name: 'Criminal Law', href: '/services/criminal' },
      ],
    },
    {
      name: 'About',
      href: '/about',
      children: [
        { name: 'Our Team', href: '/about/team' },
        { name: 'Our Story', href: '/about/story' },
      ],
    },
    { name: 'Contact', href: '/contact' },
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

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Top Header (Unchanged on Scroll) */}
      <div className={`top-header border-b border-white/20 bg-transparent ${isScrolled ? 'hidden' : 'block'}`}>
        <div className="container mx-auto px-4">
          <div className="py-4 justify-between lg:flex hidden text-sm text-white/80">
            <div className="time">Mon – Sun: 9.00 am – 8.00pm</div>
            <div className="info flex gap-6">
              <a
                href="#"
                className="flex gap-2.5 items-center hover:text-[#d5aa6d] transition-colors"
              >
                <MapPinHouse color="#d5aa6d" strokeWidth={1.4} size={20} />
                121 King Street, Melbourne
              </a>
              <a
                href="mailto:info.company@gmail.com"
                className="flex gap-2.5 items-center hover:text-[#d5aa6d] transition-colors"
              >
                <Mail color="#d5aa6d" strokeWidth={1.4} size={20} />
                info.company@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header (Changes on Scroll) */}
      <div
        className={`main-header py-4 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Image
              src={`${isScrolled ? 'https://solislaw.com.au/wp-content/uploads/2023/08/solislaw-logo-dark.png' : '/images/logo/solislaw.png'}`}
              alt="Solis Law Logo"
              width={60}
              height={60}
              className="h-11 w-auto object-contain"
              priority
            />
            
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex gap-8">
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
                      isScrolled
                        ? 'text-gray-800 hover:text-[#d5aa6d]'
                        : 'text-white hover:text-[#d5aa6d]'
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

                  {/* Dropdown Menu */}
                  {item.children && (
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`absolute top-full left-0 mt-2 w-48 rounded-lg border shadow-lg ${
                            isScrolled
                              ? 'bg-white border-gray-100'
                              : 'bg-white/95 backdrop-blur-sm border-white/20'
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

            {/* Search Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`transition-colors ${
                isScrolled ? 'text-gray-800 hover:text-[#d5aa6d]' : 'text-white hover:text-[#d5aa6d]'
              }`}
            >
              <Search size={24} strokeWidth={1.5} />
            </motion.button>

            {/* Search Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`transition-colors ${
                isScrolled ? 'text-gray-800 hover:text-[#d5aa6d]' : 'text-white hover:text-[#d5aa6d]'
              }`}
            >
              <AlignRight size={24} strokeWidth={1.5} />
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`lg:hidden ${
              isScrolled ? 'text-gray-800' : 'text-white'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X size={24} strokeWidth={1.5} />
            ) : (
              <AlignRight size={24} strokeWidth={1.5} />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu (Full-Screen) */}
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
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === item.name ? null : item.name
                        )
                      }
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
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}