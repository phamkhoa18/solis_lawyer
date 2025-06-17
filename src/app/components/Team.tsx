"use client"

/* eslint-disable @next/next/no-img-element */


import { motion } from 'framer-motion'
import { Facebook, Instagram, Linkedin, Share2, Twitter } from 'lucide-react'
import React, { useState } from 'react'

export default function Team() {
    const [hovered, setHovered] = useState(false);
    return (
      <section className='team pt-20 pb-16 relative px-3.5'>
            <div className='absolute bottom-0 left-0 z-[-1]'>
                <img src="/images/member/team.png" alt="" />
            </div>
            <div className="container mx-auto gap-28 flex lg:flex-row flex-col justify-between">
                <div className='lg:w-[35%] w-full'>
                    <div className="heading-1 flex justify-center flex-col gap-4">
                        <h4 className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold">
                                TEAM MEMBER
                        </h4>

                        <h2 className='font_play text-5xl leading-[1.3]'>Our awesome team members</h2>
                        <p className='text-justify text-[var(--paragraph)]'>
                            To explore and go after new ways to build, we’ve gathered the people, innovations, & partnerships that can anticipate & overcome new challenges.
                        </p>
                        <div className='star flex gap-3 items-center'>
                            <h2 className='font_play text-5xl'>5.0</h2>
                            <div className="text-center">
                                <img src="/images/member/five-start-icon.png" alt="" />
                                <h6 className="text-sm font_play mt-2">2000+ Rating</h6>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='lg:w-[60%] w-full'>
                    <div className="list-member">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                           <div className="user lg:-translate-y-20 cursor-pointer group overflow-hidden rounded-4xl bg-white border border-[rgb(0_0_0_/_10%)]">
                            <div className="thumnail relative 
                                before:content-[''] 
                                before:absolute before:bottom-0 before:left-0 
                                before:w-full before:h-0 
                                before:opacity-50 
                                before:bg-gradient-to-t before:from-[#bb9a65] before:to-[#bb9a6500] 
                                before:transition-all before:duration-700 before:ease-in-out
                                group-hover:before:h-full"
                            >
                                <img src="/images/member/usermember.png" alt="" className="w-full h-auto" />

                                {/* Social floating button */}
                                <div
                                className="absolute bottom-[15px] right-[20px] flex flex-col items-center"
                                onMouseEnter={() => setHovered(true)}
                                onMouseLeave={() => setHovered(false)}
                                >
                                {/* Social icons */}
                                <div className={`flex flex-col items-center gap-3 mb-3 p-5 transition-all ${
                                    hovered ? 'bg-[rgba(20,31,42,1)] rounded-2xl' : 'bg-transparent'
                                }`}>
                                    {[Twitter, Facebook, Linkedin, Instagram].map((Icon, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ delay: hovered ? index * 0.05 : 0 }}
                                    >
                                        <a href="#" aria-label={Icon.name}>
                                        <Icon className="w-5 h-5 text-white hover:text-blue-400 transition-colors" />
                                        </a>
                                    </motion.div>
                                    ))}
                                </div>

                                {/* Share button */}
                                <div className="w-[60px] h-[60px] border-8 rounded-full flex items-center justify-center border-white bg-[rgba(20,31,42,1)] cursor-pointer">
                                    <Share2 className="text-white" />
                                </div>
                                </div>
                            </div>

                            <div className="body-text p-7">
                                <h4 className="text-2xl">Thành Tô</h4>
                                <span>Lead Founder</span>
                            </div>
                            </div>
                            <div className="user cursor-pointer group overflow-hidden rounded-4xl bg-white border border-[rgb(0_0_0_/_10%)]">
                            <div className="thumnail relative 
                                before:content-[''] 
                                before:absolute before:bottom-0 before:left-0 
                                before:w-full before:h-0 
                                before:opacity-50 
                                before:bg-gradient-to-t before:from-[#bb9a65] before:to-[#bb9a6500] 
                                before:transition-all before:duration-700 before:ease-in-out
                                group-hover:before:h-full"
                            >
                                <img src="/images/member/usermember.png" alt="" className="w-full h-auto" />

                                {/* Social floating button */}
                                <div
                                className="absolute bottom-[15px] right-[20px] flex flex-col items-center"
                                onMouseEnter={() => setHovered(true)}
                                onMouseLeave={() => setHovered(false)}
                                >
                                {/* Social icons */}
                                <div className={`flex flex-col items-center gap-3 mb-3 p-5 transition-all ${
                                    hovered ? 'bg-[rgba(20,31,42,1)] rounded-2xl' : 'bg-transparent'
                                }`}>
                                    {[Twitter, Facebook, Linkedin, Instagram].map((Icon, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ delay: hovered ? index * 0.05 : 0 }}
                                    >
                                        <a href="#" aria-label={Icon.name}>
                                        <Icon className="w-5 h-5 text-white hover:text-blue-400 transition-colors" />
                                        </a>
                                    </motion.div>
                                    ))}
                                </div>

                                {/* Share button */}
                                <div className="w-[60px] h-[60px] border-8 rounded-full flex items-center justify-center border-white bg-[rgba(20,31,42,1)] cursor-pointer">
                                    <Share2 className="text-white" />
                                </div>
                                </div>
                            </div>

                            <div className="body-text p-7">
                                <h4 className="text-2xl">Thành Tô</h4>
                                <span>Lead Founder</span>
                            </div>
                            </div>
                            <div className="user lg:-translate-y-20 cursor-pointer group overflow-hidden rounded-4xl bg-white border border-[rgb(0_0_0_/_10%)]">
                            <div className="thumnail relative 
                                before:content-[''] 
                                before:absolute before:bottom-0 before:left-0 
                                before:w-full before:h-0 
                                before:opacity-50 
                                before:bg-gradient-to-t before:from-[#bb9a65] before:to-[#bb9a6500] 
                                before:transition-all before:duration-700 before:ease-in-out
                                group-hover:before:h-full"
                            >
                                <img src="/images/member/usermember.png" alt="" className="w-full h-auto" />

                                {/* Social floating button */}
                                <div
                                className="absolute bottom-[15px] right-[20px] flex flex-col items-center"
                                onMouseEnter={() => setHovered(true)}
                                onMouseLeave={() => setHovered(false)}
                                >
                                {/* Social icons */}
                                <div className={`flex flex-col items-center gap-3 mb-3 p-5 transition-all ${
                                    hovered ? 'bg-[rgba(20,31,42,1)] rounded-2xl' : 'bg-transparent'
                                }`}>
                                    {[Twitter, Facebook, Linkedin, Instagram].map((Icon, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ delay: hovered ? index * 0.05 : 0 }}
                                    >
                                        <a href="#" aria-label={Icon.name}>
                                        <Icon className="w-5 h-5 text-white hover:text-blue-400 transition-colors" />
                                        </a>
                                    </motion.div>
                                    ))}
                                </div>

                                {/* Share button */}
                                <div className="w-[60px] h-[60px] border-8 rounded-full flex items-center justify-center border-white bg-[rgba(20,31,42,1)] cursor-pointer">
                                    <Share2 className="text-white" />
                                </div>
                                </div>
                            </div>

                            <div className="body-text p-7">
                                <h4 className="text-2xl">Thành Tô</h4>
                                <span>Lead Founder</span>
                            </div>
                            </div>
                            <div className="user cursor-pointer group overflow-hidden rounded-4xl bg-white border border-[rgb(0_0_0_/_10%)]">
                            <div className="thumnail relative 
                                before:content-[''] 
                                before:absolute before:bottom-0 before:left-0 
                                before:w-full before:h-0 
                                before:opacity-50 
                                before:bg-gradient-to-t before:from-[#bb9a65] before:to-[#bb9a6500] 
                                before:transition-all before:duration-700 before:ease-in-out
                                group-hover:before:h-full"
                            >
                                <img src="/images/member/usermember.png" alt="" className="w-full h-auto" />

                                {/* Social floating button */}
                                <div
                                className="absolute bottom-[15px] right-[20px] flex flex-col items-center"
                                onMouseEnter={() => setHovered(true)}
                                onMouseLeave={() => setHovered(false)}
                                >
                                {/* Social icons */}
                                <div className={`flex flex-col items-center gap-3 mb-3 p-5 transition-all ${
                                    hovered ? 'bg-[rgba(20,31,42,1)] rounded-2xl' : 'bg-transparent'
                                }`}>
                                    {[Twitter, Facebook, Linkedin, Instagram].map((Icon, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ delay: hovered ? index * 0.05 : 0 }}
                                    >
                                        <a href="#" aria-label={Icon.name}>
                                        <Icon className="w-5 h-5 text-white hover:text-blue-400 transition-colors" />
                                        </a>
                                    </motion.div>
                                    ))}
                                </div>

                                {/* Share button */}
                                <div className="w-[60px] h-[60px] border-8 rounded-full flex items-center justify-center border-white bg-[rgba(20,31,42,1)] cursor-pointer">
                                    <Share2 className="text-white" />
                                </div>
                                </div>
                            </div>

                            <div className="body-text p-7">
                                <h4 className="text-2xl">Thành Tô</h4>
                                <span>Lead Founder</span>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
      </section>
    )
}
