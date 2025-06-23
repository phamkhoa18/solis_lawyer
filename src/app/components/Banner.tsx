/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { IBanner } from '@/lib/types/ibanner';
import { ApiResponse } from '@/lib/types/api-response';
import { useLanguage } from '../context/LanguageContext';

// Define slide data structure
interface SlideData {
  image: string;
  title: string;
  subtitle: string;
  cta: { text: string; href: string };
}

// Map IBanner to SlideData based on language
const mapBannerToSlide = (banner: IBanner, lang: 'en' | 'vi'): SlideData => {
  const title = banner.name?.[lang] || 'Untitled Banner';
  const subtitle = banner.description?.[lang] || 'No description available';
  const ctaText = banner.buttonText?.[lang] || 'Learn More';

  // Log for debugging Vietnamese issues
  if (lang === 'vi') {
    console.log(`Banner ${banner._id || 'unknown'}:`, {
      title: banner.name?.vi,
      subtitle: banner.description?.vi,
      ctaText: banner.buttonText?.vi,
    });
  }

  return {
    image: banner.image || '/fallback-image.jpg',
    title,
    subtitle,
    cta: {
      text: ctaText,
      href: banner.link || '#',
    },
  };
};

export default function Banner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage(); // Returns Lang ('EN' | 'VI')

  // Convert Lang to 'en' | 'vi'
  const normalizedLanguage = language.toLowerCase() as 'en' | 'vi';

  // Log normalized language for debugging
  console.log('Normalized Language:', normalizedLanguage);

  const scrollTo = (index: number) => emblaApi?.scrollTo(index);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/banners');
      const data: ApiResponse<IBanner[]> = await res.json();
      if (data.success && data.data) {
        console.log('API Response:', data.data);
        setBanners(data.data.filter((banner) => banner.isActive));
      } else {
        setError(data.message || 'Không thể tải banner');
        toast.error(data.message || 'Không thể tải banner');
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
    fetchBanners();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      if (emblaApi) {
        setSelectedIndex(emblaApi.selectedScrollSnap());
      }
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      if (emblaApi) {
        emblaApi.off('select', onSelect);
      }
    };
  }, [emblaApi]);

  // Map banners to slides using normalized language
  const slides = banners.map((banner) => mapBannerToSlide(banner, normalizedLanguage));

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  return (
    <motion.section
      className="relative h-screen w-full overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {isLoading ? (
        <div className="h-full relative">
          <Skeleton className="h-full w-full absolute inset-0" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div className="max-w-3xl space-y-4">
              <Skeleton className="h-12 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-2/3 mx-auto" />
              <Skeleton className="h-10 w-32 mx-auto" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="h-full flex items-center justify-center text-center">
          <div className="space-y-4">
            <p className="text-red-500 text-lg">{error}</p>
            <Button
              onClick={fetchBanners}
              className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white hover:opacity-90"
            >
              {normalizedLanguage === 'vi' ? 'Thử lại' : 'Try Again'}
            </Button>
          </div>
        </div>
      ) : banners.length === 0 ? (
        <div className="h-full flex items-center justify-center text-center">
          <p className="text-gray-500 text-lg">
            {normalizedLanguage === 'vi' ? 'Không có banner nào đang hoạt động.' : 'No active banners available.'}
          </p>
        </div>
      ) : (
        <>
          <div className="embla h-full" ref={emblaRef}>
            <div className="embla__container flex h-full">
              {slides.map((slide, index) => (
                <Slide key={index} slide={slide} isActive={selectedIndex === index} />
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full z-30 hover:bg-black/60 hover:scale-105 transition-all duration-300"
            aria-label={normalizedLanguage === 'vi' ? 'Slide trước' : 'Previous slide'}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full z-30 hover:bg-black/60 hover:scale-105 transition-all duration-300"
            aria-label={normalizedLanguage === 'vi' ? 'Slide sau' : 'Next slide'}
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  selectedIndex === i ? 'bg-[#d5aa6d]' : 'bg-white/50 hover:bg-white/80 hover:scale-110'
                }`}
                onClick={() => scrollTo(i)}
                aria-label={normalizedLanguage === 'vi' ? `Đi đến slide ${i + 1}` : `Go to slide ${i + 1}`}
                aria-current={selectedIndex === i ? 'true' : 'false'}
              />
            ))}
          </div>
        </>
      )}
    </motion.section>
  );
}

function Slide({ slide, isActive }: { slide: SlideData; isActive: boolean }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.5 });

  return (
    <div ref={ref} className="embla__slide min-w-full relative h-full">
      <Image
        src={slide.image}
        alt={slide.title}
        fill
        className="object-cover object-center"
        priority={isActive}
      />
      <div className="absolute inset-0 bg-black/60 z-10" />

      <div className="absolute inset-0 flex items-center justify-center z-20 text-center px-4">
        <AnimatePresence mode="wait">
          {inView && isActive && (
            <motion.div
              key={slide.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-white max-w-3xl"
            >
              <h1 className="text-3xl md:text-6xl font-bold mb-6 font_play" aria-live="polite">
                <Typewriter
                  words={[slide.title]}
                  cursor
                  cursorStyle="_"
                  typeSpeed={60}
                  deleteSpeed={50}
                  delaySpeed={2000}
                />
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-lg md:text-xl text-gray-200 mb-8"
              >
                {slide.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Link
                  href={slide.cta.href}
                  className="inline-block bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out"
                  aria-label={slide.cta.text}
                >
                  {slide.cta.text}
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}