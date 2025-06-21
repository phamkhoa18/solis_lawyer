
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import UserInfo from "./userInfo";
import RequireAuth from "./RequireAuth";
import { Sidebar } from "../common/Sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex flex-col min-h-screen bg-gray-50 md:flex-row">
        <aside className="w-full md:w-64">
          <Sidebar />
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="w-full px-6 py-4 bg-white border-b shadow-sm flex justify-between items-center">
            <h1 className="text-lg font-semibold">Bảng điều khiển</h1>
            <UserInfo />
          </header>

          <main className="flex-1 p-2 sm:p-6">
            {children}
            <Toaster position="top-right" />
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
