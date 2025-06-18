'use client'

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, Variants } from 'framer-motion';

const testimonials = [
  {
    name: 'Kourtney Holland',
    role: 'Real Estate Client',
    avatar: '/images/testinomial/user.jpg',
    content:
      'The entire team, from attorneys to paralegals, was courteous and efficient. Their level of commitment and expertise exceeded my expectations.',
    rating: 5,
  },
  {
    name: 'William Carter',
    role: 'Business Owner',
    avatar: '/images/testinomial/user.jpg',
    content:
      'A law firm that truly cares. They listened carefully and represented me with integrity. Highly recommended for legal guidance.',
    rating: 5,
  },
  {
    name: 'Emily Clark',
    role: 'Immigration Client',
    avatar: '/images/testinomial/user.jpg',
    content:
      'Their attention to detail and deep understanding of immigration law made a huge difference in my case. I couldn’t have asked for better support.',
    rating: 5,
  },
];

export default function Testimonial() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

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
            Our Testimonials
          </motion.h4>
          <motion.h2
            className="font_play text-4xl text-center"
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.2 }}
          >
            What They Are Saying About Us
          </motion.h2>
        </div>

        {/* Embla carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {testimonials.map((item, index) => (
              <motion.div
                key={item.name}
                className="flex-[0_0_100%] md:flex-[0_0_100%] lg:flex-[0_0_100%] px-4"
                variants={slideVariants}
                initial="hidden"
                whileInView="visible"
                exit="exit"
                viewport={{ once: false, amount: 0.3 }}
                custom={index}
              >
                <div className="flex flex-col lg:flex-row items-center gap-6 max-w-4xl mx-auto">
                  {/* Avatar + Stars */}
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="relative w-36 h-36 rounded-full border border-dotted border-[#d5aa6d] p-1">
                      <Image
                        src={item.avatar}
                        alt={`${item.name}'s avatar`}
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
                    <p className="text-xl text-[#031a3d] leading-relaxed mb-4">
                      {item.content}
                    </p>
                    <p className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold">
                      {item.name}
                    </p>
                    <p className="text-gray-500 text-sm">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <motion.div
          className="flex justify-center gap-2 mt-6"
          variants={dotVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full ${
                selectedIndex === index ? 'bg-[#d5aa6d]' : 'bg-gray-400/50'
              }`}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}