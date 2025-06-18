'use client'

import React from 'react'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageTitleProps {
  title: string
  backgroundImage?: string
  breadcrumb?: BreadcrumbItem[]
}

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  backgroundImage = '/images/background/page-title-bg.jpg',
  breadcrumb = [],
}) => {
  return (
    <section
      className="page-title py-[100px] pb-[110px] lg:pt-[200px] relative bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Lớp phủ trước bằng ::before */}
      <div className="absolute inset-0 before:content-[''] before:absolute before:inset-0 before:bg-[#131313] before:opacity-80 z-[1]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white font_play">{title}</h1>

          {breadcrumb.length > 0 && (
            <ul className="flex justify-center gap-2 text-white/80 text-sm mt-4 flex-wrap">
              {breadcrumb.map((item, index) => (
                <li key={index} className="flex items-center gap-1">
                  {item.href ? (
                    <Link href={item.href} className="hover:underline text-white">
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}

                  {index < breadcrumb.length - 1 && <span>/</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

export default PageTitle
