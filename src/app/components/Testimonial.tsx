'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, Variants } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-hot-toast';
import { ITestimonial } from '@/lib/types/itestimonial';
import { ApiResponse } from '@/lib/types/api-response';

// Define testimonial data structure for rendering
interface TestimonialData {
  name: string;
  content: string;
  image: string;
  rating: number; // Rating is not in ITestimonial, so we'll default it
}

// Map ITestimonial to TestimonialData based on language
const mapTestimonialToCard = (testimonial: ITestimonial, lang: 'en' | 'vi'): TestimonialData => {
  const name = testimonial.name?.[lang] || 'Anonymous';
  const content = testimonial.content?.[lang] || 'No content available';

  // Log for debugging Vietnamese issues
  if (lang === 'vi') {
    console.log(`Testimonial ${testimonial._id || 'unknown'}:`, {
      name: testimonial.name?.vi,
      content: testimonial.content?.vi,
    });
  }

  return {
    name,
    content,
    image: testimonial.image || '/images/testinomial/user.jpg',
    rating: 5, // Default rating since not in ITestimonial
  };
};

export default function Testimonial() {
  const { language } = useLanguage(); // Returns Lang ('EN' | 'VI')
  const normalizedLanguage = language.toLowerCase() as 'en' | 'vi';
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<ITestimonial[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Log normalized language for debugging
  console.log('Normalized Language:', normalizedLanguage);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // Fetch testimonials from API
  const fetchTestimonials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/testimonials');
      const data: ApiResponse<ITestimonial[]> = await res.json();
      if (data.success && data.data) {
        console.log('API Response:', data.data);
        setTestimonials(data.data.filter((t) => t.isActive)); // Only active testimonials
      } else {
        setError(data.message || (normalizedLanguage === 'vi' ? 'Không thể tải lời chứng thực' : 'Unable to load testimonials'));
        toast.error(data.message || (normalizedLanguage === 'vi' ? 'Không thể tải lời chứng thực' : 'Unable to load testimonials'));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : (normalizedLanguage === 'vi' ? 'Lỗi kết nối server' : 'Server connection error');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Map testimonials to card data using normalized language
  const testimonialCards = testimonials.map((testimonial) => mapTestimonialToCard(testimonial, normalizedLanguage));

  // Animation variants for heading
  const headingVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  // Animation variants for slides
  const slideVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        delay: i * 0.2,
      },
    }),
    exit: {
      opacity: 0,
      y: 30,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  // Animation variants for dots
  const dotVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut', delay: 0.6 },
    },
  };

  return (
    <section
      className={`
        testimonial relative py-20
        bg-[#f7f7f7] 
        bg-no-repeat bg-[length:24%_auto] 
        bg-[position:105%_226px]
        lg:bg-fixed
        bg-[url('/images/testinomial/image.png')]
      `}
    >
      <div className="container mx-auto px-4">
        <div className="heading-1 flex items-center justify-center flex-col gap-4 mb-10">
          <motion.h4
            className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold"
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {normalizedLanguage === 'vi' ? 'Lời Chứng Thực' : 'Our Testimonials'}
          </motion.h4>
          <motion.h2
            className="font_play text-4xl text-center"
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.2 }}
          >
            {normalizedLanguage === 'vi' ? 'Họ Nói Gì Về Chúng Tôi' : 'What They Are Saying About Us'}
          </motion.h2>
        </div>

        {isLoading ? (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex-[0_0_100%] md:flex-[0_0_100%] lg:flex-[0_0_100%] px-4">
                  <div className="flex flex-col lg:flex-row items-center gap-6 max-w-4xl mx-auto">
                    <div className="flex flex-col items-center lg:items-start">
                      <Skeleton className="w-36 h-36 rounded-full" />
                      <Skeleton className="h-6 w-24 mt-4" />
                    </div>
                    <div className="text-center lg:text-left">
                      <Skeleton className="h-20 w-full mb-4" />
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center text-center mt-12">
            <div className="space-y-4">
              <p className="text-red-500 text-lg">{error}</p>
              <Button
                onClick={fetchTestimonials}
                className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white hover:opacity-90"
              >
                {normalizedLanguage === 'vi' ? 'Thử lại' : 'Try Again'}
              </Button>
            </div>
          </div>
        ) : testimonialCards.length === 0 ? (
          <div className="flex items-center justify-center text-center mt-12">
            <p className="text-gray-500 text-lg">
              {normalizedLanguage === 'vi' ? 'Không có lời chứng thực nào đang hoạt động.' : 'No active testimonials available.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {testimonialCards.map((item, index) => (
                <motion.div
                  key={item.name + index} // Use index to ensure uniqueness
                  className="flex-[0_0_100%] md:flex-[0_0_100%] lg:flex-[0_0_100%] px-4"
                  variants={slideVariants}
                  initial="hidden"
                  whileInView="visible"
                  exit="exit"
                  viewport={{ once: false, amount: 0.3 }}
                  custom={index}
                >
                  <div className="flex flex-col lg:flex-row items-center gap-6 max-w-4xl mx-auto">
                    {/* Image + Stars */}
                    <div className="flex flex-col items-center lg:items-start">
                      <div className="relative w-36 h-36 rounded-full border border-dotted border-[#d5aa6d] p-1">
                        <Image
                          src={item.image}
                          alt={`${item.name}'s image`}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="mt-4 bg-[#031a3d] px-4 py-2 flex gap-2 rounded">
                        {Array(item.rating)
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className="text-yellow-400 fill-yellow-400"
                            />
                          ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center lg:text-left">
                      <p className="text-xl text-[#031a3d] leading-relaxed mb-4">{item.content}</p>
                      <p className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold">
                        {item.name}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Dots */}
        {!isLoading && !error && testimonialCards.length > 0 && (
          <motion.div
            className="flex justify-center gap-2 mt-6"
            variants={dotVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {testimonialCards.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-3 h-3 rounded-full ${
                  selectedIndex === index ? 'bg-[#d5aa6d]' : 'bg-gray-400/50'
                }`}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}