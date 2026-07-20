import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import UserInfo from "./userInfo";
import RequireAuth from "./RequireAuth";
import { Sidebar } from "../common/Sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className="w-0 md:w-[240px] flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 w-full h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Spacer for mobile menu button */}
              <div className="w-10 md:hidden" />
              <h1 className="text-sm font-medium text-slate-900 hidden sm:block">Admin</h1>
            </div>
            <UserInfo />
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'text-sm font-medium rounded-md shadow-md border border-slate-200',
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
    </RequireAuth>
  );
}
