'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Search } from 'lucide-react';

interface FilterSidebarProps {
  title: string;
  categories: { name: string; link: string }[];
  featuredItems: { title: string; link: string; date: string }[];
  searchPlaceholder?: string;
}

export default function FilterSidebar({
  title,
  categories,
  featuredItems,
  searchPlaceholder = 'Find case studies...',
}: FilterSidebarProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q) {
      router.push(`/case-studies?q=${encodeURIComponent(q)}`);
    } else {
      router.push('/case-studies');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm sticky top-24 overflow-hidden">
      <div className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] px-6 py-3">
        <h3 className="text-xl font_play font-bold text-white tracking-tight">
          {title}
        </h3>
      </div>

      {/* Search */}
      <div className="p-6 border-b border-gray-100">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d5aa6d]/40 focus:bg-white text-sm transition-all"
          />
          <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#9b6f45] transition-colors">
            <Search size={18} />
          </button>
        </form>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="p-6">
          <h4 className="text-lg font_play font-semibold text-gray-900 mb-4">
            Categories
          </h4>
          <ul className="space-y-3">
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  href={category.link}
                  className="flex items-center gap-2 text-gray-700 text-sm font-medium hover:text-[#B8967E] hover:translate-x-1 transition-all duration-300"
                >
                  <ChevronRight size={16} className="text-[#B8967E]" />
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <div className="p-6 border-t border-gray-100">
          <h4 className="text-lg font_play font-semibold text-gray-900 mb-4">
            Recent Case Studies
          </h4>
          <ul className="space-y-4">
            {featuredItems.map((item) => (
              <li key={item.title}>
                <Link href={item.link} className="group flex flex-col gap-1 text-sm">
                  <span className="text-gray-800 font-medium group-hover:text-[#B8967E] transition-colors duration-300 line-clamp-2">
                    {item.title}
                  </span>
                  <span className="text-gray-500 text-xs">{item.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}