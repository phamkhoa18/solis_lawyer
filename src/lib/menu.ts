import {
  LayoutDashboard,
  Menu,
  Image as ImageIcon,
  Briefcase,
  FileText,
  MessageSquare,
  Users,
  FolderTree,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export interface AdminMenuItem {
  title: string;
  href: string;
  icon?: LucideIcon;
}

export interface AdminMenuGroup {
  title: string;
  href?: string;
  icon?: LucideIcon;
  children?: AdminMenuItem[];
}

export const adminMenu: AdminMenuGroup[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'AI Writer',
    href: '/admin/ai-writer',
    icon: Sparkles,
  },
  {
    title: 'Quản lý nội dung',
    children: [
      { title: 'Menu', href: '/admin/menu', icon: Menu },
      { title: 'Banner', href: '/admin/banner', icon: ImageIcon },
      { title: 'Dịch vụ', href: '/admin/services', icon: Briefcase },
      { title: 'Case Studies', href: '/admin/casestudy', icon: FileText },
      { title: 'Lời chứng thực', href: '/admin/testimonials', icon: MessageSquare },
      { title: 'Thành viên', href: '/admin/members', icon: Users },
      { title: 'Danh mục', href: '/admin/category', icon: FolderTree },
    ],
  },
  {
    title: 'Hệ thống',
    children: [
      { title: 'Tài khoản', href: '/admin/accounts', icon: ShieldCheck },
    ],
  },
];
