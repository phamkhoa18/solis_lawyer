'use client';

import { useEffect, useMemo, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Image as ImageIcon,
  Briefcase,
  FileText,
  Users,
  MessageSquare,
  Plus,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
} from "lucide-react";
import Link from 'next/link';
import { useAuth } from '../RequireAuth';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from 'recharts';

interface Stats {
  banners: number;
  services: number;
  caseStudies: number;
  members: number;
  testimonials: number;
}

interface ICaseStudy {
  _id: string;
  title: { en: string; vi: string };
  slug: string;
  isActive: boolean;
  viewsCount: number;
  createdAt: string;
  category?: { name: { en: string } };
}

const BRAND_COLORS = {
  gold: '#d5aa6d',
  goldDark: '#9b6f45',
  goldLight: '#e8c994',
  goldPale: '#fdf6ec',
};

const CHART_COLORS = ['#d5aa6d', '#9b6f45', '#e8c994', '#c49a5e', '#8a6340'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPosts, setRecentPosts] = useState<ICaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, postsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/casestudies'),
        ]);
        const statsData = await statsRes.json();
        const postsData = await postsRes.json();

        if (statsData.success && statsData.data) setStats(statsData.data);
        if (postsData.success && postsData.data) setRecentPosts(postsData.data.slice(0, 5));
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const statCards = [
    { label: 'Banners', value: stats?.banners ?? 0, icon: ImageIcon, href: '/admin/banner', color: '#d5aa6d' },
    { label: 'Dịch vụ', value: stats?.services ?? 0, icon: Briefcase, href: '/admin/services', color: '#9b6f45' },
    { label: 'Case Studies', value: stats?.caseStudies ?? 0, icon: FileText, href: '/admin/casestudy', color: '#c49a5e' },
    { label: 'Thành viên', value: stats?.members ?? 0, icon: Users, href: '/admin/members', color: '#e8c994' },
    { label: 'Testimonials', value: stats?.testimonials ?? 0, icon: MessageSquare, href: '/admin/testimonials', color: '#8a6340' },
  ];

  const quickActions = [
    { label: 'Tạo Banner', href: '/admin/banner/create', icon: ImageIcon },
    { label: 'Tạo Dịch vụ', href: '/admin/services/create', icon: Briefcase },
    { label: 'Tạo Case Study', href: '/admin/casestudy/create', icon: FileText },
    { label: 'Tạo Thành viên', href: '/admin/members/create', icon: Users },
    { label: 'Tạo Testimonial', href: '/admin/testimonials/create', icon: MessageSquare },
  ];

  // Chart data
  const barChartData = statCards.map((s) => ({
    name: s.label,
    value: s.value,
    fill: s.color,
  }));

  const pieChartData = statCards
    .filter((s) => s.value > 0)
    .map((s) => ({
      name: s.label,
      value: s.value,
      fill: s.color,
    }));

  // Số bài đăng theo 7 tháng gần nhất — TÍNH THẬT từ createdAt của case studies
  const [csList, setCsList] = useState<Array<{ createdAt?: string }>>([]);
  useEffect(() => {
    fetch('/api/casestudies?all=true')
      .then((r) => r.json())
      .then((d) => d.success && setCsList(d.data || []))
      .catch(() => {});
  }, []);
  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months: { month: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const value = csList.filter((c) => {
        const t = c.createdAt ? new Date(c.createdAt) : null;
        return t && t >= d && t < next;
      }).length;
      months.push({ month: `T${d.getMonth() + 1}`, value });
    }
    return months;
  }, [csList]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {getGreeting()}, {user?.name || 'Admin'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Tổng quan hoạt động của hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-md shadow-sm">
          <Clock className="w-3.5 h-3.5 text-[#d5aa6d]" />
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="group bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
              {/* Accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(to right, ${stat.color}, ${stat.color}88)` }} />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</span>
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#d5aa6d] transition-colors mb-1" />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart — Content Trend */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#d5aa6d]" />
              <h3 className="text-sm font-semibold text-slate-700">Xu hướng nội dung</h3>
            </div>
            <span className="text-xs text-slate-400">7 tháng gần đây</span>
          </div>
          {loading ? (
            <Skeleton className="h-[200px] w-full rounded-md" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_COLORS.gold} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={BRAND_COLORS.gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }}
                  labelStyle={{ fontWeight: 600, color: '#334155' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={BRAND_COLORS.gold}
                  strokeWidth={2}
                  fill="url(#goldGradient)"
                  name="Nội dung"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart — Content Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4 text-[#d5aa6d]" />
            <h3 className="text-sm font-semibold text-slate-700">Phân bố nội dung</h3>
          </div>
          {loading ? (
            <Skeleton className="h-[200px] w-full rounded-md" />
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
                {pieChartData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-xs text-slate-500">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart — Overview */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[#d5aa6d]" />
            <h3 className="text-sm font-semibold text-slate-700">Tổng quan theo loại</h3>
          </div>
          {loading ? (
            <Skeleton className="h-[200px] w-full rounded-md" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barChartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Số lượng">
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Case Studies */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#d5aa6d]" />
              <h3 className="text-sm font-semibold text-slate-700">Case Study gần đây</h3>
            </div>
            <Link href="/admin/casestudy" className="text-xs text-[#9b6f45] hover:underline">Xem tất cả</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)}</div>
          ) : recentPosts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Chưa có case study nào</p>
          ) : (
            <div className="space-y-1">
              {recentPosts.map((post) => (
                <Link key={post._id} href={`/admin/casestudy/edit/${post._id}`} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-slate-50 transition-colors group">
                  <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 text-[#9b6f45]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate group-hover:text-[#9b6f45] transition-colors">{post.title.vi || post.title.en}</p>
                    <p className="text-xs text-slate-400">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : '—'}
                      {post.viewsCount > 0 && ` · ${post.viewsCount} lượt xem`}
                    </p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    post.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {post.isActive ? 'Public' : 'Draft'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-[#d5aa6d]" />
            <h3 className="text-sm font-semibold text-slate-700">Thao tác nhanh</h3>
          </div>
          <div className="space-y-1.5">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center gap-3 p-3 rounded-md hover:bg-amber-50/50 transition-colors group cursor-pointer">
                  <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#d5aa6d]/10 to-[#9b6f45]/10 flex items-center justify-center flex-shrink-0 group-hover:from-[#d5aa6d]/20 group-hover:to-[#9b6f45]/20 transition-colors">
                    <action.icon className="w-4 h-4 text-[#9b6f45]" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-[#9b6f45] transition-colors">{action.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-[#d5aa6d] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
