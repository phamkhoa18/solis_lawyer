'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Search, Plus, ImageIcon, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { IBanner } from '@/lib/types/ibanner';
import { ApiResponse } from '@/lib/types/api-response';

interface IBannerWithId extends IBanner { _id: string; }

const ITEMS_PER_PAGE = 10;

export default function BannersPage() {
  const [banners, setBanners] = useState<IBannerWithId[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBanners = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/banners');
      const data: ApiResponse<IBannerWithId[]> = await res.json();
      if (data.success && data.data) setBanners(data.data);
      else { toast.error(data.message || 'Không thể tải banners'); setError(data.message || 'Không thể tải banners'); }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi kết nối đến máy chủ';
      toast.error(message); setError(message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const filteredBanners = useMemo(() => {
    return banners.filter(
      (banner) =>
        banner.name.vi.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        banner.name.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (banner.link || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm, banners]);

  // Pagination
  const totalPages = Math.ceil(filteredBanners.length / ITEMS_PER_PAGE);
  const paginatedBanners = filteredBanners.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearchTerm]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
      const data: ApiResponse<null> = await res.json();
      if (data.success) { toast.success(data.message || 'Đã xóa banner thành công'); fetchBanners(); }
      else toast.error(data.message || 'Xóa không thành công');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Lỗi khi xóa banner');
    } finally { setDeletingId(null); setDeleteId(null); }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const v = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const iv = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <motion.div className="space-y-6" variants={v} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={iv} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Banner</h1>
          <p className="text-sm text-slate-500 mt-1">{!loading && `${filteredBanners.length} banner`}</p>
        </div>
        <Link href="/admin/banner/create">
          <Button className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] hover:from-[#c9a060] hover:to-[#8a6340] text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />Tạo Banner
          </Button>
        </Link>
      </motion.div>

      {/* Search */}
      <motion.div variants={iv} className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Tìm kiếm theo tên hoặc link..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 border-slate-200 focus:border-amber-300 focus:ring-amber-200/30"
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={iv}>
        <Card className="shadow-sm border-0 rounded-lg overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3"><RefreshCw className="w-5 h-5 text-red-500" /></div>
                <p className="text-red-500 font-medium">{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchBanners}>Thử lại</Button>
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3"><ImageIcon className="w-5 h-5 text-slate-400" /></div>
                <p className="text-slate-500 font-medium">Không có banner nào</p>
                <p className="text-sm text-slate-400 mt-1">Tạo banner mới để bắt đầu</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead className="w-20 text-xs font-medium text-slate-500 uppercase tracking-wide">Ảnh</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tên (VI)</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tên (EN)</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Link</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Trạng thái</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ngày tạo</TableHead>
                        <TableHead className="text-center text-xs font-medium text-slate-500 uppercase tracking-wide">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBanners.map((banner) => (
                        <TableRow key={banner._id}>
                          <TableCell>
                            <Image src={banner.image} alt={banner.name.vi || 'Banner'} width={50} height={50} className="object-cover rounded-md" />
                          </TableCell>
                          <TableCell className="font-medium text-slate-700 text-sm">{banner.name.vi}</TableCell>
                          <TableCell className="text-slate-600 text-sm">{banner.name.en}</TableCell>
                          <TableCell>
                            {banner.link ? (
                              <a href={banner.link} target="_blank" rel="noreferrer" className="text-[#9b6f45] hover:underline text-sm">
                                {banner.link.length > 30 ? banner.link.substring(0, 30) + '...' : banner.link}
                              </a>
                            ) : <span className="text-slate-400">—</span>}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              banner.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${banner.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {banner.isActive ? 'Hoạt động' : 'Tắt'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              <Link href={`/admin/banner/edit/${banner._id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-[#9b6f45] hover:bg-amber-50"><Pencil className="w-3.5 h-3.5" /></Button>
                              </Link>
                              <AlertDialog open={deleteId === banner._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(banner._id)} disabled={deletingId === banner._id}><Trash2 className="w-3.5 h-3.5" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Xóa banner này?</AlertDialogTitle><AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel disabled={deletingId === banner._id}>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(banner._id)} className="bg-red-600 hover:bg-red-700" disabled={deletingId === banner._id}>
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50">
                    <p className="text-sm text-slate-500">
                      Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredBanners.length)} / {filteredBanners.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {getPageNumbers().map((page, i) =>
                        typeof page === 'string' ? (
                          <span key={`ellipsis-${i}`} className="px-1 text-slate-400">…</span>
                        ) : (
                          <Button
                            key={page}
                            variant={page === currentPage ? 'default' : 'outline'}
                            size="sm"
                            className={`h-8 w-8 p-0 ${page === currentPage ? 'bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] hover:from-[#c9a060] hover:to-[#8a6340] text-white border-0' : ''}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      )}
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}