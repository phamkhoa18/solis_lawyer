/* eslint-disable @next/next/no-img-element */

import { MoveRight } from 'lucide-react'
import React, { } from 'react'

export default function Services() {
    return (
        <section className='services py-16'>
            <div className="container mx-auto px-3.5">
                <div className="heading-1 flex items-center justify-center flex-col gap-4">
                    <h4 className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold leading-[1.3]">
                            SERVICES
                    </h4>

                    <h2 className='font_play text-4xl text-center'>We are expert a tall type of legal service</h2>
                </div>

                <div className="body-service grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-12 md:px-0">
                    <div className="group service-card mb-4 bg-white p-6 cursor-pointer transition-shadow duration-300 text-center flex flex-col justify-between border-2 border-[rgb(0_0_0_/_8%)] lg:border-0 lg:border-r-2 lg:border-r-[rgb(0_0_0_/_8%)] hover:shadow-lg">
                        {/* Icon move lên khi hover */}
                        <div className="icon mb-4 transition-all duration-500 ease-out group-hover:-translate-y-2">
                            <img
                            src="/images/icons/gun.png"
                            alt="Personal Injury Law"
                            className="mx-auto h-16 w-16"
                            />
                        </div>

                        <h3 className="text-xl font-semibold mb-5 font_play">Personal Injury Law</h3>

                        {/* View More xuất hiện từ trái sang phải */}
                        <div className="overflow-hidden h-6">
                            <p className="text-gray-600 flex items-center gap-1.5 transition-all duration-700 ease-out
                                            translate-x-0 opacity-100
                                            lg:-translate-x-5 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:text-right justify-center">
                                View More
                                <MoveRight strokeWidth={1.5} size={16} />
                            </p>
                        </div>
                    </div>
                    <div className="group service-card mb-4 bg-white p-6 cursor-pointer transition-shadow duration-300 text-center flex flex-col justify-between border-2 border-[rgb(0_0_0_/_8%)] lg:border-0 lg:border-r-2 lg:border-r-[rgb(0_0_0_/_8%)] hover:shadow-lg">
                        {/* Icon move lên khi hover */}
                        <div className="icon mb-4 transition-all duration-500 ease-out group-hover:-translate-y-2">
                            <img
                            src="/images/icons/family.png"
                            alt="Personal Injury Law"
                            className="mx-auto h-16 w-16"
                            />
                        </div>

                        <h3 className="text-xl font-semibold mb-5 font_play">Personal Injury Law</h3>

                        {/* View More xuất hiện từ trái sang phải */}
                        <div className="overflow-hidden h-6">
                            <p className="text-gray-600 flex items-center gap-1.5 transition-all duration-700 ease-out
                                            translate-x-0 opacity-100
                                            lg:-translate-x-5 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:text-right justify-center">
                                View More
                                <MoveRight strokeWidth={1.5} size={16} />
                            </p>
                        </div>
                    </div>
                    <div className="group service-card mb-4 bg-white p-6 cursor-pointer transition-shadow duration-300 text-center flex flex-col justify-between border-2 border-[rgb(0_0_0_/_8%)] lg:border-0 lg:border-r-2 lg:border-r-[rgb(0_0_0_/_8%)] hover:shadow-lg">
                        {/* Icon move lên khi hover */}
                        <div className="icon mb-4 transition-all duration-500 ease-out group-hover:-translate-y-2">
                            <img
                            src="/images/icons/fly.png"
                            alt="Personal Injury Law"
                            className="mx-auto h-16 w-16"
                            />
                        </div>

                        <h3 className="text-xl font-semibold mb-5 font_play">Personal Injury Law</h3>

                        {/* View More xuất hiện từ trái sang phải */}
                        <div className="overflow-hidden h-6">
                            <p className="text-gray-600 flex items-center gap-1.5 transition-all duration-700 ease-out
                                            translate-x-0 opacity-100
                                            lg:-translate-x-5 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:text-right justify-center">
                                View More
                                <MoveRight strokeWidth={1.5} size={16} />
                            </p>
                        </div>
                    </div>
                    <div className="group service-card mb-4 bg-white p-6 cursor-pointer transition-shadow duration-300 text-center flex flex-col justify-between border-2 border-[rgb(0_0_0_/_8%)] lg:border-0 hover:shadow-lg">
                        {/* Icon move lên khi hover */}
                        <div className="icon mb-4 transition-all duration-500 ease-out group-hover:-translate-y-2">
                            <img
                            src="/images/icons/appeal.png"
                            alt="Personal Injury Law"
                            className="mx-auto h-16 w-16"
                            />
                        </div>

                        <h3 className="text-xl font-semibold mb-5 font_play">Personal Injury Law</h3>

                        {/* View More xuất hiện từ trái sang phải */}
                        <div className="overflow-hidden h-6">
                            <p className="text-gray-600 flex items-center gap-1.5 transition-all duration-700 ease-out
                                            translate-x-0 opacity-100
                                            lg:-translate-x-5 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:text-right justify-center">
                                View More
                                <MoveRight strokeWidth={1.5} size={16} />
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
