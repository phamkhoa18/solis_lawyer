'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { adminMenu } from '@/lib/menu';
import Image from 'next/image';
import { Menu, X, ChevronDown, PanelLeftClose, PanelLeft } from 'lucide-react';
import clsx from 'clsx';
import { useSidebar } from './SidebarContext';

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const { collapsed, toggle } = useSidebar();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Quản lý nội dung': true,
    'Hệ thống': true,
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

  const sidebarWidth = collapsed ? 'w-[68px]' : 'w-[240px]';

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-3.5 left-4 z-50 p-2 rounded-md bg-white shadow-sm"
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
          'fixed top-0 left-0 z-40 h-screen transform transition-all duration-300 ease-in-out',
          'bg-white flex flex-col shadow-[1px_0_3px_rgba(0,0,0,0.04)]',
          sidebarWidth,
          open ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        {/* Logo area with background */}
        <div className="relative flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
          style={{ height: collapsed ? '56px' : '64px' }}
        >
          {/* Subtle gold accent overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#d5aa6d]/10 to-[#9b6f45]/5" />
          <Link href="/admin/dashboard" className="relative z-10 flex items-center justify-center">
            {collapsed ? (
              <div className="relative w-8 h-8">
                <Image src="/images/logo/solislaw.png" alt="Solis" fill className="object-contain" priority />
              </div>
            ) : (
              <div className="relative w-36 h-10">
                <Image src="/images/logo/solislaw.png" alt="Solis Lawyers" fill className="object-contain" priority />
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className={clsx(
          'flex-1 overflow-y-auto custom-scrollbar',
          collapsed ? 'px-2 py-3' : 'px-3 py-4',
          'space-y-1'
        )}>
          {adminMenu.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <div className={collapsed ? 'mt-2' : 'mt-4'}>
                  {/* Group header */}
                  {!collapsed && (
                    <button
                      onClick={() => toggleGroup(item.title)}
                      className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors rounded-md"
                    >
                      <span>{item.title}</span>
                      <ChevronDown
                        className={clsx(
                          'w-3.5 h-3.5 transition-transform duration-200',
                          expandedGroups[item.title] ? 'rotate-0' : '-rotate-90'
                        )}
                      />
                    </button>
                  )}

                  {/* Collapsed: show divider */}
                  {collapsed && (
                    <div className="mx-2 my-2 h-px bg-slate-100" />
                  )}
                  
                  <div
                    className={clsx(
                      'overflow-hidden transition-all duration-200',
                      collapsed
                        ? 'max-h-[600px] opacity-100'
                        : expandedGroups[item.title]
                          ? 'max-h-[600px] opacity-100 mt-1'
                          : 'max-h-0 opacity-0'
                    )}
                  >
                    <div className={clsx('space-y-0.5', collapsed && 'space-y-1')}>
                      {item.children.map((child) => {
                        const Icon = child.icon;
                        const active = isActive(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            title={collapsed ? child.title : undefined}
                            className={clsx(
                              'flex items-center rounded-md text-sm font-medium transition-all duration-200',
                              collapsed
                                ? 'justify-center p-2.5'
                                : 'gap-3 px-3 py-2',
                              active
                                ? 'bg-amber-50 text-[#9b6f45]'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            )}
                          >
                            {Icon && (
                              <Icon
                                className={clsx(
                                  'w-4 h-4 flex-shrink-0 transition-colors',
                                  active ? 'text-[#9b6f45]' : 'text-slate-400'
                                )}
                              />
                            )}
                            {!collapsed && <span className="truncate">{child.title}</span>}
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
                  title={collapsed ? item.title : undefined}
                  className={clsx(
                    'flex items-center rounded-md text-sm font-medium transition-all duration-200',
                    collapsed
                      ? 'justify-center p-2.5'
                      : 'gap-3 px-3 py-2',
                    isActive(item.href || '')
                      ? 'bg-amber-50 text-[#9b6f45]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  {item.icon && (
                    <item.icon
                      className={clsx(
                        'w-4 h-4 flex-shrink-0 transition-colors',
                        isActive(item.href || '') ? 'text-[#9b6f45]' : 'text-slate-400'
                      )}
                    />
                  )}
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className={clsx(
          'hidden md:flex items-center py-3',
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}>
          {!collapsed && (
            <p className="text-[11px] text-slate-300">© Solis Lawyers</p>
          )}
          <button
            onClick={toggle}
            className="p-1.5 rounded-md text-slate-400 hover:text-[#9b6f45] hover:bg-amber-50 transition-colors"
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}