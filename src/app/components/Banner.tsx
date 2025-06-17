'use client'

import React, { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const slides = [
  {
    image: 'https://solislaw.com.au/wp-content/themes/lawsight/assets/images/bg-page-title.jpg',
    title: 'Trusted Legal Solutions',
    subtitle: 'Expert guidance to protect your rights and secure your future.',
    cta: { text: 'Contact Us', href: '/contact' },
  },
  {
    image: 'https://solislaw.com.au/wp-content/themes/lawsight/assets/images/bg-page-title.jpg',
    title: 'Justice with Integrity',
    subtitle: 'Dedicated legal support for corporate, family, and criminal law.',
    cta: { text: 'Our Services', href: '/services' },
  },
  {
    image: 'https://solislaw.com.au/wp-content/themes/lawsight/assets/images/bg-page-title.jpg',
    title: 'Your Partner in Law',
    subtitle: 'Personalized solutions tailored to your unique needs.',
    cta: { text: 'Learn More', href: '/about' },
  },
]

export default function Banner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollTo = (index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on('select', onSelect)
    onSelect()

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {slides.map((slide, index) => (
            <div key={index} className="embla__slide min-w-full relative h-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover object-center"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/50 z-10" />
              <div className="absolute inset-0 flex items-center justify-center z-20 text-center px-4">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="text-white max-w-3xl"
                >
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">{slide.title}</h1>
                  <p className="text-lg md:text-xl text-gray-200 mb-8">{slide.subtitle}</p>
                  <Link
                    href={slide.cta.href}
                    className="mt-7 inline-block bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out"
                  >
                    {slide.cta.text}
                  </Link>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full z-30"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full z-30"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              selectedIndex === i ? 'bg-[#d5aa6d]' : 'bg-white/50'
            }`}
            onClick={() => scrollTo(i)}
          />
        ))}
      </div>
    </section>
  )
}
