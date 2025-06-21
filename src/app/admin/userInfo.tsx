"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IUser } from "@/lib/types/iuser";

export default function UserInfo() {
  const [user, setUser] = useState<IUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        console.log(userData);
        
        const now = new Date().getTime();
        if (userData.expires && userData.expires > now) {
          setUser(userData.user);
        } else {
          localStorage.removeItem("user");
        }
      }
    } catch (err) {
      console.error("Lỗi đọc user từ localStorage", err);
    }
  }, []);

  const handleLogout = () => {
  localStorage.removeItem("user");
  toast.success("Đã đăng xuất");
  router.push("/login");
};

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <span>👋 Xin chào, <strong>{user.name}</strong></span>
      <button
        onClick={handleLogout}
        className="text-red-500 hover:underline ml-2"
      >
        Đăng xuất
      </button>
    </div>
  );
}
