'use client';

import Link from 'next/link';
import { useState } from 'react';
import { adminMenu } from '@/lib/menu';
import { Menu } from 'lucide-react';
import clsx from 'clsx';

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden p-4 text-gray-700"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-40 w-64 h-full bg-white border-r shadow-md transform transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:relative md:translate-x-0 md:flex md:flex-col'
        )}
      >
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Control Panel <br /> Solis Lawyers</h2>
          <button
            className="md:hidden text-gray-600"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-4">
          {adminMenu.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <div>
                  <p className="text-xs uppercase font-semibold text-gray-500 mb-2">
                    {item.title}
                  </p>
                  <div className="ml-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.title}
                        href={child.href}
                        className="block text-sm text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                        onClick={() => setOpen(false)}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className="block text-sm font-medium text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                  onClick={() => setOpen(false)}
                >
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}