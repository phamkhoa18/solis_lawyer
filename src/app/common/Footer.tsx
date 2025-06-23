/* eslint-disable @next/next/no-img-element */
import { ChevronRight, Mail, MapPinHouse, Phone } from 'lucide-react'
import { Bird, Camera, PlayCircle, Briefcase, Users } from "lucide-react";
import React, { } from 'react'

export default function Footer() {
    return (
      <section className='footer py-16 bg-[#121212] text-white'>
            <div className="container mx-auto px-3.5">
                <div className="flex lg:flex-row flex-col mt-12 gap-8 md:px-0">
                    <div className="item mb-5 lg:w-[15%] w-full">
                        <img className='w-[120px]' src="/images/logo/solislaw.png" alt="" />
                    </div>
                    <div className="item mb-5 lg:w-[20%] w-full">
                        <h2 className="relative mb-6 text-2xl font_play custom-title">Quicklinks</h2>
                        <div className="list-menu flex flex-col gap-2 text-[var(--paragraph)]">
                            <a href="" className='flex gap-.5 items-center'>
                                <ChevronRight className='text-[#d5aa6d]' size={20} strokeWidth={1.5} />
                                <span>Home</span>
                            </a>
                             <a href="" className='flex gap-.5 items-center'>
                                <ChevronRight className='text-[#d5aa6d]' size={20} strokeWidth={1.5} />
                                <span>Home</span>
                            </a>
                             <a href="" className='flex gap-.5 items-center'>
                                <ChevronRight className='text-[#d5aa6d]' size={20} strokeWidth={1.5} />
                                <span>Home</span>
                            </a>
                             <a href="" className='flex gap-.5 items-center'>
                                <ChevronRight className='text-[#d5aa6d]' size={20} strokeWidth={1.5} />
                                <span>Home</span>
                            </a>
                             <a href="" className='flex gap-.5 items-center'>
                                <ChevronRight className='text-[#d5aa6d]' size={20} strokeWidth={1.5} />
                                <span>Home</span>
                            </a>
                        </div>
                    </div>
                    <div className="item mb-5 lg:w-[30%] w-full">
                        <h2 className="relative mb-6 text-2xl font_play custom-title">
                            Solis Lawyers Head Office
                        </h2>

                        <div className="list-menu flex flex-col gap-2 text-[var(--paragraph)]">
                            <a href="" className="flex items-start gap-2">
                                <Phone size={20} strokeWidth={1.5} className="shrink-0 text-[#d5aa6d] mt-0.5" />
                                <span className="break-words leading-[1.8]">(+61) 2 8102 5657</span>
                            </a>

                            <a href="" className="flex items-start gap-2">
                                <Mail size={20} strokeWidth={1.5} className="shrink-0 text-[#d5aa6d] mt-0.5" />
                                <span className="break-words leading-[1.8]">contact@solislaw.com.au</span>
                            </a>

                            <a href="" className="flex items-start gap-2">
                                <MapPinHouse size={20} strokeWidth={1.5} className="shrink-0 text-[#d5aa6d] mt-0.5" />
                                <span className="break-words leading-[1.8]">
                                Liberty Plaza, Shop 34 / Level 1 / 256 Chapel Rd Bankstown NSW 2200
                                </span>
                            </a>
                        </div>
                    </div>
                    <div className="item mb-5 lg:w-[30%] w-full">
                        <h2 className="relative mb-6 text-2xl font_play custom-title">
                            Solis Lawyers Head Office
                        </h2>

                        <div className="list-menu flex flex-col gap-2 text-[var(--paragraph)]">
                            <a href="" className="flex items-start gap-2">
                                <Phone size={20} strokeWidth={1.5} className="shrink-0 text-[#d5aa6d] mt-0.5" />
                                <span className="break-words leading-[1.8]">(+61) 2 8102 5657</span>
                            </a>

                            <a href="" className="flex items-start gap-2">
                                <Mail size={20} strokeWidth={1.5} className="shrink-0 text-[#d5aa6d] mt-0.5" />
                                <span className="break-words leading-[1.8]">contact@solislaw.com.au</span>
                            </a>

                            <a href="" className="flex items-start gap-2">
                                <MapPinHouse size={20} strokeWidth={1.5} className="shrink-0 text-[#d5aa6d] mt-0.5" />
                                <span className="break-words leading-[1.8]">
                                Liberty Plaza, Shop 34 / Level 1 / 256 Chapel Rd Bankstown NSW 2200
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10 mt-12 pt-6">
                <div className="container mx-auto px-3.5 flex flex-col lg:flex-row justify-between items-center gap-4 text-sm text-[var(--paragraph)]">
                    
                    {/* Bản quyền */}
                    <p className="text-center lg:text-left">
                    © Copyright 2025. All rights reserved.{" "}
                    <span className="text-[#d5aa6d]">Solis Lawyers</span>
                    </p>

                    {/* Social (Lucide) Icons */}
                    <div className="flex items-center justify-center gap-4 text-white">
                    <a href="#" target="_blank" className="hover:text-[#d5aa6d]">
                        <Users size={20} strokeWidth={1.5} />
                    </a>
                    <a href="#" target="_blank" className="hover:text-[#d5aa6d]">
                        <Bird size={20} strokeWidth={1.5} />
                    </a>
                    <a href="#" target="_blank" className="hover:text-[#d5aa6d]">
                        <Camera size={20} strokeWidth={1.5} />
                    </a>
                    <a href="#" target="_blank" className="hover:text-[#d5aa6d]">
                        <PlayCircle size={20} strokeWidth={1.5} />
                    </a>
                    <a href="#" target="_blank" className="hover:text-[#d5aa6d]">
                        <Briefcase size={20} strokeWidth={1.5} />
                    </a>
                    </div>
                </div>
            </div>
      </section>
    )
}
