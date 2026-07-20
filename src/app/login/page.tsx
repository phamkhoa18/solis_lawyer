import { Suspense } from "react";
import { LoginForm } from "../components/login-form";

export const metadata = {
  title: "Đăng nhập - Solis Lawyers Admin",
};

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="h-[400px] w-full bg-white border border-slate-200 rounded-xl animate-pulse shadow-sm" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
