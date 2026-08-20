'use client';

import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import UserInfo from "./userInfo";
import RequireAuth from "./RequireAuth";
import { Sidebar } from "../common/Sidebar";
import { SidebarProvider, useSidebar } from "../common/SidebarContext";
import { Breadcrumb, HeaderSearch, HeaderNotifications } from "./HeaderComponents";

function LayoutInner({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-[#f7f5f1]">
      {/* Sidebar (fixed) + spacer */}
      <Sidebar />
      <div
        className="hidden md:block flex-shrink-0 transition-all duration-300"
        style={{ width: collapsed ? 92 : 264 }}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
          <header className="sticky top-0 z-30 w-full h-14 bg-white/75 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 md:hidden" />
              <Breadcrumb />
            </div>
            <div className="flex items-center gap-1">
              <HeaderSearch />
              <HeaderNotifications />
              <div className="w-px h-6 bg-border/60 mx-2 hidden sm:block" />
              <UserInfo />
            </div>
          </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
          <Toaster
            position="top-right"
            containerStyle={{ zIndex: 99999 }}
            toastOptions={{
              className: 'text-sm font-medium rounded-2xl shadow-lg',
              duration: 4000,
              style: {
                background: '#fff',
                color: '#0f172a',
                borderRadius: '1rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              },
              success: { duration: 3000 },
              error: { duration: 5000 },
              loading: { duration: Infinity },
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <SidebarProvider>
        <LayoutInner>{children}</LayoutInner>
      </SidebarProvider>
    </RequireAuth>
  );
}
