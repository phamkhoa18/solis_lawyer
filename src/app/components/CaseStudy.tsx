'use client'

import { Plus } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, Variants } from 'framer-motion';

const caseStudies = [
  {
    title: 'Business Migration Success',
    image: '/images/casestudy/1.jpg',
    date: '15 Jun 2019',
    link: '/case-studies/business-migration',
    alt: 'Business Migration Case Study',
  },
  {
    title: 'Startup Legal Strategy',
    image: '/images/casestudy/1.jpg',
    date: '02 Dec 2020',
    link: '/case-studies/startup-strategy',
    alt: 'Startup Legal Strategy Case Study',
  },
  {
    title: 'Immigration Settlement Case',
    image: '/images/casestudy/1.jpg',
    date: '18 Mar 2023',
    link: '/case-studies/immigration-settlement',
    alt: 'Immigration Settlement Case Study',
  },
];

export default function CaseStudyCarousel() {
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

    emblaApi.on('select', onSelect);
    onSelect();

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
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  // Animation variants for slides
  const slideVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        delay: i * 0.2,
      },
    }),
    exit: {
      opacity: 0,
      y: 30,
      transition: {
        duration: 0.4,
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
    <section className="casestudy py-16">
      <div className="container mx-auto px-3.5">
        <div className="heading-1 flex items-center justify-center flex-col gap-4 mb-10">
          <motion.h4
            className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold"
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            Case Studies
          </motion.h4>
          <motion.h2
            className="font_play text-4xl text-center"
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.2 }}
          >
            Discover how we’ve helped our clients
          </motion.h2>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {caseStudies.map((item, index) => (
              <motion.div
                key={item.title}
                className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] lg:px-3 md:px-2 px-0"
                variants={slideVariants}
                initial="hidden"
                whileInView="visible"
                exit="exit"
                viewport={{ once: false, amount: 0.3 }}
                custom={index}
              >
                <div className="item relative group overflow-hidden rounded-xl cursor-pointer">
                  <div className="thumbnail relative w-full aspect-square overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      className="object-cover group-hover:scale-110 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />
                    <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-3.5 z-20">
                      <h3 className="text-white text-2xl font_play font-medium">
                        {item.title}
                      </h3>
                      <a
                        href={item.link}
                        className="flex items-center gap-1.5 text-[#B8967E] underline uppercase text-sm font-semibold"
                      >
                        Read More <Plus size={20} strokeWidth={1.5} />
                      </a>
                    </div>
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] rounded-xl m-4 z-20">
                      <span className="text-sm p-4 text-white">{item.date}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="flex justify-center gap-2 mt-6"
          variants={dotVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {caseStudies.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                selectedIndex === index ? 'bg-[#d5aa6d]' : 'bg-gray-400/50'
              }`}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}