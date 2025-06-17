'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'

const testimonials = [
  {
    name: 'Kourtney Holland',
    role: 'Real Estate Service',
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
]

export default function Testimonial() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  useEffect(() => {
  if (!emblaApi) return

  const onSelect = () => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }

  // Gọi lần đầu để cập nhật chỉ số
  onSelect()

  // Lắng nghe khi slide thay đổi
  emblaApi.on('select', onSelect)

  return () => {
    emblaApi.off('select', onSelect)
  }
}, [emblaApi])

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
          <h4 className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] bg-clip-text text-transparent tracking-widest uppercase text-lg font-semibold">
            Our Testimonials
          </h4>
          <h2 className="font_play text-4xl text-center">
            What They Are Talking About Igual
          </h2>
        </div>

        {/* Embla carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {testimonials.map((item, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] md:flex-[0_0_100%] lg:flex-[0_0_100%] px-4"
              >
                <div className="flex flex-col lg:flex-row items-center gap-6 max-w-4xl mx-auto">
                  {/* Avatar + Stars */}
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="relative w-36 h-36 rounded-full border border-dotted border-[#d5aa6d] p-1">
                      <Image
                        src={item.avatar}
                        alt={item.name}
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
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full ${
                selectedIndex === index ? 'bg-[#d5aa6d]' : 'bg-gray-400/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
