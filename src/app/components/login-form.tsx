"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Scale } from "lucide-react";
import { Toaster } from "react-hot-toast";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      toast.success("Đăng nhập thành công!");
      
      const redirect = searchParams.get('redirect') || '/admin/dashboard';
      router.push(redirect);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đã có lỗi xảy ra";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="text-center space-y-3 pb-6">
            <div className="mx-auto w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
                Solis Lawyers
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Bảng điều khiển quản trị
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="admin@solislawyers.com"
                  required 
                  className="h-10 text-slate-900 bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-900">Mật khẩu</Label>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  className="h-10 text-slate-900 bg-white border-slate-200"
                />
              </div>
              <Button type="submit" className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Solis Lawyers. All rights reserved.
        </div>
      </div>
    </>
  );
}