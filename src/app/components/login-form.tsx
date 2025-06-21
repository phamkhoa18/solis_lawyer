/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const email = form.get("email") as string;
      const password = form.get("password") as string;

      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        console.log("Response body:", data);

        if (!res.ok) {
          throw new Error(data.message || `Lỗi server: ${res.status}`);
        }

        if (typeof window !== "undefined" && window.localStorage) {
          const expires = new Date().getTime() + 2 * 24 * 60 * 60 * 1000; // 2 ngày
          localStorage.setItem("user", JSON.stringify({ ...data, expires }));
        }

        toast.success("Đăng nhập thành công");
        router.push("/admin/dashboard");
      } else {
        throw new Error("Response không phải JSON");
      }
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error);
      toast.error(error.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-xl border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Đăng nhập</CardTitle>
          <CardDescription>
            Website thuộc quyền sở hữu của Solis Lawyer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Email ..."
                  name="email"
                  type="email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Quên mật khẩu?
                  </a>
                </div>
                <Input
                  id="password"
                  placeholder="Password ..."
                  name="password"
                  type="password"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
                <Button type="button" variant="outline" className="w-full">
                  Đăng nhập với Google
                </Button>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Đăng ký ngay
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}