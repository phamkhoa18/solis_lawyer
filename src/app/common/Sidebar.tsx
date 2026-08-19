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

  const sidebarWidth = collapsed ? 'w-[76px]' : 'w-[244px]';

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-3.5 left-4 z-50 p-2 rounded-xl bg-white shadow-sm border border-border/60"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — bento panel nổi, bo tròn, kính mờ */}
      <aside
        className={clsx(
          'fixed top-3 left-3 z-40 h-[calc(100vh-24px)] transform transition-all duration-300 ease-in-out',
          'bg-white/90 backdrop-blur-xl flex flex-col rounded-2xl border border-border/60',
          'shadow-[0_2px_6px_rgba(15,23,42,0.03),0_16px_40px_-20px_rgba(15,23,42,0.14)]',
          sidebarWidth,
          open ? 'translate-x-0' : '-translate-x-[110%]',
          'md:translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className="relative flex items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
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
                              'flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                              collapsed
                                ? 'justify-center p-2.5'
                                : 'gap-3 px-3 py-2',
                              active
                                ? 'bg-gradient-to-r from-[#fdf6ec] to-[#f9efdd] text-[#9b6f45] shadow-[inset_0_0_0_1px_rgba(155,111,69,0.12)]'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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
                    'flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                    collapsed
                      ? 'justify-center p-2.5'
                      : 'gap-3 px-3 py-2',
                    isActive(item.href || '')
                      ? 'bg-gradient-to-r from-[#fdf6ec] to-[#f9efdd] text-[#9b6f45] shadow-[inset_0_0_0_1px_rgba(155,111,69,0.12)]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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