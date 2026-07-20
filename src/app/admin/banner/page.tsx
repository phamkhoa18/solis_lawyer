'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Search, Plus, ImageIcon, RefreshCw } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { IBanner } from '@/lib/types/ibanner';
import { ApiResponse } from '@/lib/types/api-response';

interface IBannerWithId extends IBanner {
  _id: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<IBannerWithId[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/banners');
      const data: ApiResponse<IBannerWithId[]> = await res.json();
      if (data.success && data.data) {
        setBanners(data.data);
      } else {
        toast.error(data.message || 'Không thể tải banners');
        setError(data.message || 'Không thể tải banners');
      }
    } catch (error: unknown) {
      console.error('Fetch banners error:', error);
      const message = error instanceof Error ? error.message : 'Lỗi kết nối đến máy chủ';
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const filteredBanners = useMemo(() => {
    return banners.filter(
      (banner) =>
        banner.name.vi.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        banner.name.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (banner.link || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm, banners]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
      const data: ApiResponse<null> = await res.json();
      if (data.success) {
        toast.success(data.message || 'Đã xóa banner thành công');
        fetchBanners();
      } else {
        toast.error(data.message || 'Xóa không thành công');
      }
    } catch (error: unknown) {
      console.error('Delete banner error:', error);
      toast.error(error instanceof Error ? error.message : 'Lỗi khi xóa banner');
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Banner</h1>
          <p className="text-sm text-slate-500 mt-1">
            {!loading && `${filteredBanners.length} banner`}
          </p>
        </div>
        <Link href="/admin/banner/create">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/20 rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Tạo Banner
          </Button>
        </Link>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Tìm kiếm theo tên hoặc link..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm border-slate-200/60 rounded-xl overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-red-500 font-medium">{error}</p>
                <Button variant="outline" className="mt-4 rounded-xl" onClick={fetchBanners}>
                  Thử lại
                </Button>
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">Không có banner nào</p>
                <p className="text-sm text-slate-400 mt-1">Tạo banner mới để bắt đầu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="w-20 font-semibold text-slate-600">Ảnh</TableHead>
                      <TableHead className="font-semibold text-slate-600">Tên (VI)</TableHead>
                      <TableHead className="font-semibold text-slate-600">Tên (EN)</TableHead>
                      <TableHead className="font-semibold text-slate-600">Link</TableHead>
                      <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-slate-600">Ngày tạo</TableHead>
                      <TableHead className="text-center font-semibold text-slate-600">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBanners.map((banner) => (
                      <TableRow key={banner._id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell>
                          <Image
                            src={banner.image}
                            alt={banner.name.vi || 'Banner'}
                            width={50}
                            height={50}
                            className="object-cover rounded-lg"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">{banner.name.vi}</TableCell>
                        <TableCell className="text-slate-600">{banner.name.en}</TableCell>
                        <TableCell>
                          {banner.link ? (
                            <a href={banner.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                              {banner.link.length > 30 ? banner.link.substring(0, 30) + '...' : banner.link}
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            banner.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${banner.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {banner.isActive ? 'Hoạt động' : 'Tắt'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {banner.createdAt
                            ? new Date(banner.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1.5">
                            <Link href={`/admin/banner/edit/${banner._id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" aria-label="Chỉnh sửa banner">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                            <AlertDialog open={deleteId === banner._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => setDeleteId(banner._id)} aria-label="Xóa banner" disabled={deletingId === banner._id}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xóa banner này?</AlertDialogTitle>
                                  <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl" disabled={deletingId === banner._id}>Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(banner._id)} className="bg-red-600 hover:bg-red-700 rounded-xl" disabled={deletingId === banner._id}>
                                    {deletingId === banner._id ? 'Đang xóa...' : 'Xóa'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}