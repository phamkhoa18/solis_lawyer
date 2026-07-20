'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
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
import { Pencil, Trash2, Search, Plus, FileText, RefreshCw } from 'lucide-react';
import { useDebounce } from 'use-debounce';

interface ICaseStudy {
  _id: string;
  title: { en: string; vi: string };
  slug: string;
  image: string;
  category: { _id: string; name: { en: string } };
  user: { _id: string; name: string };
  isActive: boolean;
  createdAt: string;
  viewsCount: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<ICaseStudy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCaseStudies = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/casestudies');
      const data: ApiResponse<ICaseStudy[]> = await res.json();
      if (data.success && data.data) { setCaseStudies(data.data); }
      else { toast.error(data.message || 'Không thể tải'); setError(data.message || 'Không thể tải case studies'); }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi kết nối';
      toast.error(message); setError(message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCaseStudies(); }, []);

  const filteredCaseStudies = useMemo(() => {
    return caseStudies.filter((cs) =>
      cs.title.vi.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      cs.title.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      cs.slug.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm, caseStudies]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/casestudies?id=${id}`, { method: 'DELETE' });
      const data: ApiResponse<null> = await res.json();
      if (data.success) { toast.success(data.message || 'Đã xóa'); fetchCaseStudies(); }
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
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Case Study</h1>
          <p className="text-sm text-slate-500 mt-1">{!loading && `${filteredCaseStudies.length} case study`}</p>
        </div>
        <Link href="/admin/casestudy/create">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/20 rounded-xl">
            <Plus className="w-4 h-4 mr-2" />Tạo Case Study
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={iv} className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Tìm kiếm theo tiêu đề hoặc slug..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-11 rounded-xl border-slate-200 focus:border-blue-400" />
      </motion.div>

      <motion.div variants={iv}>
        <Card className="shadow-sm border-slate-200/60 rounded-xl overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-3"><RefreshCw className="w-5 h-5 text-red-500" /></div>
                <p className="text-red-500 font-medium">{error}</p>
                <Button variant="outline" className="mt-4 rounded-xl" onClick={fetchCaseStudies}>Thử lại</Button>
              </div>
            ) : filteredCaseStudies.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3"><FileText className="w-5 h-5 text-slate-400" /></div>
                <p className="text-slate-500 font-medium">Không có case study nào</p>
                <p className="text-sm text-slate-400 mt-1">Tạo case study mới để bắt đầu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="w-16 font-semibold text-slate-600">Ảnh</TableHead>
                      <TableHead className="font-semibold text-slate-600 min-w-[150px]">Tiêu đề (EN)</TableHead>
                      <TableHead className="font-semibold text-slate-600 min-w-[100px]">Slug</TableHead>
                      <TableHead className="font-semibold text-slate-600">Danh mục</TableHead>
                      <TableHead className="font-semibold text-slate-600">Tác giả</TableHead>
                      <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-slate-600">Ngày tạo</TableHead>
                      <TableHead className="font-semibold text-slate-600">Lượt xem</TableHead>
                      <TableHead className="text-center font-semibold text-slate-600">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCaseStudies.map((cs) => (
                      <TableRow key={cs._id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell>
                          <Image src={cs.image || '/placeholder.jpg'} alt={cs.title.vi || 'Case Study'} width={44} height={44} className="object-cover rounded-lg aspect-square" />
                        </TableCell>
                        <TableCell className="font-medium text-slate-700 truncate max-w-[200px]">{cs.title.en || 'N/A'}</TableCell>
                        <TableCell className="truncate max-w-[150px]">
                          <a href={`/case-studies/${cs.slug}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">{cs.slug || 'N/A'}</a>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">{cs.category?.name?.en || 'N/A'}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{cs.user?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            cs.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cs.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {cs.isActive ? 'Công khai' : 'Bản nháp'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {cs.createdAt ? new Date(cs.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 text-center">{cs.viewsCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1.5">
                            <Link href={`/admin/casestudy/edit/${cs._id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></Button>
                            </Link>
                            <AlertDialog open={deleteId === cs._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => setDeleteId(cs._id)} disabled={deletingId === cs._id}><Trash2 className="w-3.5 h-3.5" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader><AlertDialogTitle>Xóa case study này?</AlertDialogTitle><AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl" disabled={deletingId === cs._id}>Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(cs._id)} className="bg-red-600 hover:bg-red-700 rounded-xl" disabled={deletingId === cs._id}>{deletingId === cs._id ? 'Đang xóa...' : 'Xóa'}</AlertDialogAction>
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