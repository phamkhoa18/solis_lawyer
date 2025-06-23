// lib/menu.ts
export const adminMenu = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    title: 'Quản lý nội dung',
    children: [
      {
        title: 'Menu',
        href: '/admin/menu',
      },
      {
        title: 'Banner',
        href: '/admin/banner',
      },
      {
        title: 'Services',
        href: '/admin/services',
      },
      {
        title: 'Testimonials',
        href: '/admin/testimonials',
      },
      {
        title: 'Members',
        href: '/admin/members',
      },
      {
        title: 'Danh mục',
        href: '/admin/category',
      },
      {
        title: 'Bài viết',
        href: '/admin/blogs',
      },
      {
        title: 'Chủ đề bài viết',
        href: '/admin/type',
      },
      {
        title: 'Sản phẩm',
        href: '/admin/products',
      },
      {
        title: 'Config Trang',
        href: '/admin/pages',
      },
    ],
  },
  {
    title: 'Cài đặt',
    href: '/admin/settings',
  },
];
