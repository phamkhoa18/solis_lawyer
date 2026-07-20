'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { adminMenu } from '@/lib/menu';
import { Menu, X, ChevronDown, Scale } from 'lucide-react';
import clsx from 'clsx';

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Quản lý nội dung': true,
  });
  const pathname = usePathname();

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-sm border border-slate-200"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-40 w-[240px] h-full transform transition-transform duration-300 ease-in-out',
          'bg-white flex flex-col border-r border-slate-200',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:relative md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Solis Lawyers</h2>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1 custom-scrollbar">
          {adminMenu.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <div className="mt-4">
                  <button
                    onClick={() => toggleGroup(item.title)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors rounded-md"
                  >
                    <span>{item.title}</span>
                    <ChevronDown
                      className={clsx(
                        'w-3.5 h-3.5 transition-transform duration-200',
                        expandedGroups[item.title] ? 'rotate-0' : '-rotate-90'
                      )}
                    />
                  </button>
                  
                  <div
                    className={clsx(
                      'overflow-hidden transition-all duration-200',
                      expandedGroups[item.title] ? 'max-h-[600px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                    )}
                  >
                    <div className="space-y-0.5">
                      {item.children.map((child) => {
                        const Icon = child.icon;
                        const active = isActive(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className={clsx(
                              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                              active
                                ? 'bg-slate-100 text-slate-900 font-medium'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            )}
                          >
                            {Icon && (
                              <Icon
                                className={clsx(
                                  'w-4 h-4 flex-shrink-0',
                                  active ? 'text-slate-900' : 'text-slate-400'
                                )}
                              />
                            )}
                            <span className="truncate">{child.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href || '#'}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive(item.href || '')
                      ? 'bg-slate-100 text-slate-900 font-medium'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  {item.icon && (
                    <item.icon
                      className={clsx(
                        'w-4 h-4 flex-shrink-0',
                        isActive(item.href || '') ? 'text-slate-900' : 'text-slate-400'
                      )}
                    />
                  )}
                  <span>{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200">
          <p className="text-[11px] text-slate-400">
            Admin Panel v1.0
          </p>
        </div>
      </aside>
    </>
  );
}