"use client"

/* eslint-disable @next/next/no-img-element */
import { MoveRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { motion, Variants } from 'framer-motion';

export default function Services() {
  // Animation variants for the heading
  const headingVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  // Animation variants for service cards (appear on scroll in, disappear on scroll out)
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        delay: i * 0.2, // Staggered delay for each card
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

  // Service data
  const services = [
    {
      icon: '/images/icons/gun.png',
      title: 'Criminal Law',
      alt: 'Criminal Law Icon',
      href: '/services/criminal-law',
    },
    {
      icon: '/images/icons/family.png',
      title: 'Family Law',
      alt: 'Family Law Icon',
      href: '/services/family-law',
    },
    {
      icon: '/images/icons/fly.png',
      title: 'Migration Law',
      alt: 'Migration Law Icon',
      href: '/services/migration-law',
    },
    {
      icon: '/images/icons/appeal.png',
      title: 'Conveyancing',
      alt: 'Conveyancing Icon',
      href: '/services/conveyancing',
    },
  ];

  return (
    <section className="services py-16">
      <div className="container mx-auto px-3.5">
        <div className="heading-1 flex items-center justify-center flex-col gap-4">
          <motion.h4
            className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold leading-[1.3]"
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            SERVICES
          </motion.h4>
          <motion.h2
            className="font_play text-4xl text-center"
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.2 }}
          >
            We are experts at all types of legal services
          </motion.h2>
        </div>

        <div className="body-service grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-12 md:px-0">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              className="group service-card mb-4 bg-white p-6 cursor-pointer transition-shadow duration-300 text-center flex flex-col justify-between border-2 border-[rgb(0_0_0_/_8%)] lg:border-0 lg:border-r-2 lg:border-r-[rgb(0_0_0_/_8%)] last:lg:border-r-0 hover:shadow-lg"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              exit="exit" // Trigger exit animation when out of viewport
              viewport={{ once: false, amount: 0.3 }} // Allow re-animation on scroll
              custom={index} // Pass index for staggered animation
            >
              <div className="icon mb-4 transition-all duration-500 ease-out group-hover:-translate-y-2">
                <img src={service.icon} alt={service.alt} className="mx-auto h-16 w-16" />
              </div>
              <h3 className="text-xl font-semibold mb-5 font_play">{service.title}</h3>
              <div className="overflow-hidden h-6">
                <Link
                  href={service.href}
                  className="text-gray-600 flex items-center gap-1.5 transition-all duration-700 ease-out translate-x-0 opacity-100 lg:-translate-x-5 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:text-right justify-center"
                >
                  View More
                  <MoveRight strokeWidth={1.5} size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}