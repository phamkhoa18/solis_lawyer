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
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar (fixed) + spacer */}
      <Sidebar />
      <div
        className="hidden md:block flex-shrink-0 transition-all duration-300"
        style={{ width: collapsed ? 68 : 240 }}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
          <header className="sticky top-0 z-30 w-full h-14 bg-white flex items-center justify-between px-4 sm:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="w-10 md:hidden" />
              <Breadcrumb />
            </div>
            <div className="flex items-center gap-1">
              <HeaderSearch />
              <HeaderNotifications />
              <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block" />
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
            toastOptions={{
              className: 'text-sm font-medium rounded-md shadow-md',
              duration: 3000,
              style: {
                background: '#fff',
                color: '#0f172a',
              },
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
