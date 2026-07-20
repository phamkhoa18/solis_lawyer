'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Image as ImageIcon,
  Briefcase,
  FileText,
  Users,
  MessageSquare,
  Plus,
  Activity,
} from "lucide-react";
import Link from 'next/link';
import { useAuth } from '../RequireAuth';

interface Stats {
  banners: number;
  services: number;
  caseStudies: number;
  members: number;
  testimonials: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.success && data.data) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Fetch stats error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const statCards = [
    { label: 'Banners', value: stats?.banners ?? 0, icon: ImageIcon, href: '/admin/banner' },
    { label: 'Dịch vụ', value: stats?.services ?? 0, icon: Briefcase, href: '/admin/services' },
    { label: 'Case Studies', value: stats?.caseStudies ?? 0, icon: FileText, href: '/admin/casestudy' },
    { label: 'Thành viên', value: stats?.members ?? 0, icon: Users, href: '/admin/members' },
    { label: 'Testimonials', value: stats?.testimonials ?? 0, icon: MessageSquare, href: '/admin/testimonials' },
  ];

  const quickActions = [
    { label: 'Tạo Banner', href: '/admin/banner/create', icon: ImageIcon },
    { label: 'Tạo Dịch vụ', href: '/admin/services/create', icon: Briefcase },
    { label: 'Tạo Case Study', href: '/admin/casestudy/create', icon: FileText },
    { label: 'Tạo Bài viết', href: '/admin/blogs/create', icon: FileText },
    { label: 'Tạo Thành viên', href: '/admin/members/create', icon: Users },
    { label: 'Tạo Testimonial', href: '/admin/testimonials/create', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {getGreeting()}, {user?.name || 'Admin'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tổng quan hoạt động của hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
          <Activity className="w-4 h-4 text-slate-400" />
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3">
                  <div className="p-2 rounded-md bg-slate-100 text-slate-600">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {action.label}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
