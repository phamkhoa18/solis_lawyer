/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

/* eslint-disable @next/next/no-img-element */
import { motion, Variants } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Share2, Twitter } from 'lucide-react';
import React, { useState } from 'react';

export default function Team() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Animation variants for heading section
  const headingVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  // Animation variants for team cards
  const cardVariants: Variants = {
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

  // Animation for background image
  const bgImageVariants: Variants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Team member data
  const teamMembers:any = [
    {
      name: 'Thành Tô',
      role: 'Lead Founder',
      image: '/images/member/usermember.png',
      socials: {
        twitter: '#',
        facebook: '#',
        linkedin: '#',
        instagram: '#',
      },
    },
    {
      name: 'Linh Nguyễn',
      role: 'Senior Attorney',
      image: '/images/member/usermember.png',
      socials: {
        twitter: '#',
        facebook: '#',
        linkedin: '#',
        instagram: '#',
      },
    },
    {
      name: 'Hải Phạm',
      role: 'Immigration Specialist',
      image: '/images/member/usermember.png',
      socials: {
        twitter: '#',
        facebook: '#',
        linkedin: '#',
        instagram: '#',
      },
    },
    {
      name: 'Mai Trần',
      role: 'Family Law Expert',
      image: '/images/member/usermember.png',
      socials: {
        twitter: '#',
        facebook: '#',
        linkedin: '#',
        instagram: '#',
      },
    },
  ];

  // Map social icons to their keys
  const socialIcons = [
    { Icon: Twitter, key: 'twitter', label: 'Twitter' },
    { Icon: Facebook, key: 'facebook', label: 'Facebook' },
    { Icon: Linkedin, key: 'linkedin', label: 'LinkedIn' },
    { Icon: Instagram, key: 'instagram', label: 'Instagram' },
  ];

  return (
    <section className="team pt-20 pb-16 relative lg:mt-20">
      <motion.div
        className="absolute bottom-0 left-0 z-[-1]"
        variants={bgImageVariants}
        animate="animate"
      >
        <img src="/images/member/team.png" alt="Team background decoration" />
      </motion.div>
      <div className="container mx-auto lg:gap-28 gap-8 flex lg:flex-row flex-col justify-between px-3.5">
        <div className="lg:w-[35%] w-full">
          <div className="heading-1 flex justify-center flex-col gap-4">
            <motion.h4
              className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold"
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              TEAM MEMBER
            </motion.h4>
            <motion.h2
              className="font_play text-5xl leading-[1.3]"
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.2 }}
            >
              Our awesome team members
            </motion.h2>
            <motion.p
              className="text-justify text-[var(--paragraph)]"
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.4 }}
            >
              To explore and go after new ways to build, we’ve gathered the people, innovations, & partnerships that can anticipate & overcome new challenges.
            </motion.p>
            <motion.div
              className="star flex gap-3 items-center"
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="font_play text-5xl">5.0</h2>
              <div className="text-center">
                <img src="/images/member/five-start-icon.png" alt="Five-star rating" />
                <h6 className="text-sm font_play mt-2">2000+ Ratings</h6>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="lg:w-[60%] w-full">
          <div className="list-member">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {teamMembers.map((member:any, index:any) => (
                <motion.div
                  key={member.name}
                  className={`user cursor-pointer group overflow-hidden rounded-3xl bg-white border border-[rgb(0_0_0_/_10%)] ${
                    index % 2 === 0 ? 'lg:-translate-y-20' : ''
                  }`}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  exit="exit"
                  viewport={{ once: false, amount: 0.3 }}
                  custom={index}
                >
                  <div
                    className="thumnail relative 
                      before:content-[''] 
                      before:absolute before:bottom-0 before:left-0 
                      before:w-full before:h-0 
                      before:opacity-50 
                      before:bg-gradient-to-t before:from-[#bb9a65] before:to-[#bb9a6500] 
                      before:transition-all before:duration-700 before:ease-in-out
                      group-hover:before:h-full"
                  >
                    <img src={member.image} alt={`${member.name}'s profile`} className="w-full h-auto" />
                    <div
                      className="absolute bottom-[15px] right-[20px] flex flex-col items-center"
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div
                        className={`flex flex-col items-center gap-3 mb-3 p-5 transition-all ${
                          hoveredCard === index ? 'bg-[rgba(20,31,42,1)] rounded-2xl' : 'bg-transparent'
                        }`}
                      >
                        {socialIcons.map(({ Icon, key, label }, i) => (
                          <motion.div
                            key={`${member.name}-${key}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={
                              hoveredCard === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                            }
                            transition={{ delay: hoveredCard === index ? i * 0.05 : 0 }}
                          >
                            <a href={member.socials[key] || '#'} aria-label={`${member.name}'s ${label}`}>
                              <Icon className="w-5 h-5 text-white hover:text-blue-400 transition-colors" />
                            </a>
                          </motion.div>
                        ))}
                      </div>
                      <div className="w-[60px] h-[60px] border-8 rounded-full flex items-center justify-center border-white bg-[rgba(20,31,42,1)] cursor-pointer">
                        <Share2 className="text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="body-text p-7">
                    <h4 className="text-xl font_play font-semibold">{member.name}</h4>
                    <span>{member.role}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}