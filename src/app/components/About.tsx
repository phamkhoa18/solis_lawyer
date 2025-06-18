"use client"

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import React from 'react';
import { motion, Variants } from 'framer-motion';

export default function About() {
  const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="about lg:py-20 py-16 lg:pb-24 relative overflow-hidden">
      <motion.div
        className="absolute bottom-0 left-0 z-[-1] lg:block hidden"
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img src="/images/about/about-image2.png" alt="Background decoration" />
      </motion.div>
      <div className="container mx-auto px-3.5">
        <div className="flex lg:flex-row flex-col gap-8">
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="lg:w-[48%] w-full"
          >
            <div className="heading-1 flex justify-center flex-col gap-4">
              <h4 className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold">
                ABOUT US
              </h4>
              <h2 className="font_play lg:text-5xl text-3xl leading-[1.3]">
                We Champion Justice <br />& Human Rights
              </h2>
              <p className="text-justify text-[var(--paragraph)]">
                Solis Lawyers is a dedicated and experienced legal team who deliver expertise in criminal law, migration law, family law, and conveyancing. We strive to provide cost-effective and practical solutions to your legal issues and offer highly attentive service to address your needs. We are committed to obtaining the best possible results for you regardless of how big or small your legal issues are.
              </p>
              <p className="text-justify text-[var(--paragraph)]">
                At Solis Lawyers, we provide realistic advice and achieve excellent results at reasonable prices. We are approachable, passionate, and attentive to detail and work closely together with you to address your foremost concerns and devise the best legal strategies forward. You can rest assured that you will be placed at ease with our frank and upfront approach; we will explain to you carefully every step of the way of the legal process and all the legal costs involved.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:flex-row">
              <Link
                href=""
                className="mt-7 inline-block bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          <div className="lg:w-[52%] w-full">
            <motion.div
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.3 }}
            >
              <img src="/images/about/about-image1.png" alt="About us image" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}