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
import { Pencil, Trash2, Search, Plus, MessageSquare, RefreshCw } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { ITestimonial } from '@/lib/types/itestimonial';
import { ApiResponse } from '@/lib/types/api-response';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<ITestimonial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/testimonials');
      const data: ApiResponse<ITestimonial[]> = await res.json();
      if (data.success && data.data) { setTestimonials(data.data); }
      else { toast.error(data.message || 'Không thể tải'); setError(data.message || 'Không thể tải'); }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi kết nối';
      toast.error(message); setError(message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) =>
      t.name.vi.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      t.name.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      t.content.vi.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      t.content.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm, testimonials]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' });
      const data: ApiResponse<null> = await res.json();
      if (data.success) { toast.success(data.message || 'Đã xóa'); fetchTestimonials(); }
      else { toast.error(data.message || 'Xóa không thành công'); }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Lỗi khi xóa');
    } finally { setDeletingId(null); setDeleteId(null); }
  };

  const v = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const iv = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <motion.div className="space-y-6" variants={v} initial="hidden" animate="visible">
      <motion.div variants={iv} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Lời Chứng Thực</h1>
          <p className="text-sm text-slate-500 mt-1">{!loading && `${filteredTestimonials.length} lời chứng thực`}</p>
        </div>
        <Link href="/admin/testimonials/create">
          <Button className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] hover:from-[#c9a060] hover:to-[#8a6340] text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />Tạo Lời Chứng Thực
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={iv} className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Tìm kiếm theo tên hoặc nội dung..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-10 border-slate-200 focus:border-amber-300 focus:ring-amber-200/30" />
      </motion.div>

      <motion.div variants={iv}>
        <Card className="shadow-sm border-0 rounded-lg overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-3"><RefreshCw className="w-5 h-5 text-red-500" /></div>
                <p className="text-red-500 font-medium">{error}</p>
                <Button variant="outline" className="mt-4 rounded-xl" onClick={fetchTestimonials}>Thử lại</Button>
              </div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3"><MessageSquare className="w-5 h-5 text-slate-400" /></div>
                <p className="text-slate-500 font-medium">Không có lời chứng thực nào</p>
                <p className="text-sm text-slate-400 mt-1">Tạo lời chứng thực mới để bắt đầu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="w-20 font-semibold text-slate-600">Ảnh</TableHead>
                      <TableHead className="font-semibold text-slate-600">Tên (VI)</TableHead>
                      <TableHead className="font-semibold text-slate-600">Tên (EN)</TableHead>
                      <TableHead className="font-semibold text-slate-600">Nội dung (VI)</TableHead>
                      <TableHead className="font-semibold text-slate-600">Ngày tạo</TableHead>
                      <TableHead className="text-center font-semibold text-slate-600">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTestimonials.map((t) => (
                      <TableRow key={t._id?.toString()} className="transition-colors">
                        <TableCell>
                          <Image unoptimized src={t.image} alt={t.name.vi || 'Testimonial'} width={44} height={44} className="object-cover rounded-full" />
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">{t.name.vi}</TableCell>
                        <TableCell className="text-slate-600">{t.name.en}</TableCell>
                        <TableCell className="max-w-xs truncate text-slate-600 text-sm">{t.content.vi}</TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1.5">
                            <Link href={`/admin/testimonials/edit/${t._id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></Button>
                            </Link>
                            <AlertDialog open={deleteId === t._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => setDeleteId(t._id?.toString() || '')} disabled={deletingId === t._id}><Trash2 className="w-3.5 h-3.5" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader><AlertDialogTitle>Xóa lời chứng thực này?</AlertDialogTitle><AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl" disabled={deletingId === t._id}>Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(t._id?.toString() || '')} className="bg-red-600 hover:bg-red-700 rounded-xl" disabled={deletingId === t._id}>{deletingId === t._id ? 'Đang xóa...' : 'Xóa'}</AlertDialogAction>
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