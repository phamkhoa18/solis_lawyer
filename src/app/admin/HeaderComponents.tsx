'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronRight, Home, X } from 'lucide-react';

// ─── Breadcrumb ────────────────────────────────────────────
const pathLabels: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  casestudy: 'Case Studies',
  banner: 'Banner',
  services: 'Dịch vụ',
  members: 'Thành viên',
  testimonials: 'Lời chứng thực',
  category: 'Danh mục',
  menu: 'Menu',
  create: 'Tạo mới',
  edit: 'Chỉnh sửa',
  accounts: 'Tài khoản',
  'ai-writer': 'AI Writer',
  daily: 'Bài Mỗi Ngày',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Skip "admin" prefix, build crumbs
  const crumbs = segments.slice(1).map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 2).join('/');
    const label = pathLabels[seg] || seg;
    // Skip ObjectId segments (mongo IDs)
    const isId = /^[a-f0-9]{24}$/.test(seg);
    if (isId) return null;
    return { href: href || '/', label, isLast: false };
  }).filter(Boolean).map((c, i, arr) => ({ ...c!, isLast: i === arr.length - 1 }));

  return (
    <nav className="hidden sm:flex items-center gap-1 text-sm">
      <Link href="/admin/dashboard" className="text-slate-400 hover:text-[#9b6f45] transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <div key={crumb!.href} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 text-slate-300" />
          {crumb!.isLast ? (
            <span className="text-slate-700 font-medium text-sm">{crumb!.label}</span>
          ) : (
            <Link href={crumb!.href} className="text-slate-400 hover:text-[#9b6f45] transition-colors text-sm">
              {crumb!.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

// ─── Search ─────────────────────────────────────────────────
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Close on escape + mở nhanh Ctrl/Cmd+K
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="relative">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md text-slate-400 hover:text-[#9b6f45] hover:bg-slate-50 transition-colors"
          title="Tìm kiếm (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
        </button>
      ) : (
        <div className="flex items-center bg-slate-50 rounded-md px-3 gap-2">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm kiếm..."
            className="w-40 sm:w-56 py-1.5 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
          />
          <button onClick={() => setOpen(false)} className="p-0.5 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Notifications ──────────────────────────────────────────
export function HeaderNotifications() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md text-slate-400 hover:text-[#9b6f45] hover:bg-slate-50 transition-colors"
        title="Thông báo"
      >
        <Bell className="w-4 h-4" />
        {/* Notification dot */}
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#d5aa6d] rounded-full" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl shadow-slate-200/50 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">Thông báo</span>
            <span className="text-[11px] text-[#9b6f45] font-medium cursor-pointer hover:underline">Đánh dấu đã đọc</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <div className="px-4 py-8 text-center">
              <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Không có thông báo mới</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
