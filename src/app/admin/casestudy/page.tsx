/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { motion } from 'framer-motion';

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
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/casestudies');
      const data: ApiResponse<ICaseStudy[]> = await res.json();
      if (data.success && data.data) {
        setCaseStudies(data.data);
      } else {
        toast.error(data.message || 'Không thể tải case studies');
        setError(data.message || 'Không thể tải case studies');
      }
    } catch (error: unknown) {
      console.error('Fetch case studies error:', error);
      const message = error instanceof Error ? error.message : 'Lỗi kết nối đến máy chủ';
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const filteredCaseStudies = useMemo(() => {
    return caseStudies.filter(
      (caseStudy) =>
        caseStudy.title.vi.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        caseStudy.title.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        caseStudy.slug.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm, caseStudies]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/casestudies?id=${id}`, { method: 'DELETE' });
      const data: ApiResponse<null> = await res.json();
      if (data.success) {
        toast.success(data.message || 'Đã xóa case study thành công');
        fetchCaseStudies();
      } else {
        toast.error(data.message || 'Xóa không thành công');
      }
    } catch (error: unknown) {
      console.error('Delete case study error:', error);
      toast.error(error instanceof Error ? error.message : 'Lỗi khi xóa case study');
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  // Animation variants for Framer Motion
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="space-y-6 p-3 w-full overflow-hidden mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Case Study</h1>
        <Link href="/admin/casestudy/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Tạo Case Study</Button>
        </Link>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm theo tiêu đề hoặc slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 min-w-0"
        />
      </div>

      <Card className="shadow-md border border-gray-100">
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchCaseStudies}>
                Thử lại
              </Button>
            </div>
          ) : filteredCaseStudies.length === 0 ? (
            <p className="text-gray-500 text-center">Không có case study nào</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Hình ảnh</TableHead>
                    <TableHead className="min-w-[150px]">Tiêu đề (EN)</TableHead>
                    <TableHead className="min-w-[120px]">Slug</TableHead>
                    <TableHead className="min-w-[100px]">Danh mục</TableHead>
                    <TableHead className="min-w-[100px]">Tác giả</TableHead>
                    <TableHead className="w-24">Trạng thái</TableHead>
                    <TableHead className="w-28">Ngày tạo</TableHead>
                    <TableHead className="w-20">Truy cập</TableHead>
                    <TableHead className="w-28 text-center">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCaseStudies.map((caseStudy) => (
                    <motion.tr
                      key={caseStudy._id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <Image
                          src={caseStudy.image || '/placeholder.jpg'}
                          alt={caseStudy.title.vi || 'Case Study'}
                          width={50}
                          height={50}
                          className="object-cover rounded aspect-square"
                        />
                      </TableCell>
                      <TableCell className="truncate max-w-[200px]">
                        {caseStudy.title.en || 'N/A'}
                      </TableCell>
                      <TableCell className="truncate max-w-[150px]">
                        <a
                          href={`/casestudy/${caseStudy.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {caseStudy.slug || 'N/A'}
                        </a>
                      </TableCell>
                      <TableCell className="truncate max-w-[120px]">
                        {caseStudy.category?.name.en || 'N/A'}
                      </TableCell>
                      <TableCell className="truncate max-w-[120px]">
                        {caseStudy.user?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            caseStudy.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {caseStudy.isActive ? 'Công khai' : 'Bản nháp'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {caseStudy.createdAt
                          ? new Date(caseStudy.createdAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{caseStudy.viewsCount || 0}</TableCell>
                      <TableCell className="flex justify-center gap-2">
                        <Link href={`/admin/casestudy/edit/${caseStudy._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="Chỉnh sửa case study"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <AlertDialog
                          open={deleteId === caseStudy._id}
                          onOpenChange={(open) => !open && setDeleteId(null)}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => setDeleteId(caseStudy._id)}
                              aria-label="Xóa case study"
                              disabled={deletingId === caseStudy._id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bạn chắc chắn muốn xóa case study này?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này không thể hoàn tác. Vui lòng xác nhận để tiếp tục.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={deletingId === caseStudy._id}>
                                Hủy
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(caseStudy._id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deletingId === caseStudy._id}
                              >
                                {deletingId === caseStudy._id ? 'Đang xóa...' : 'Xóa'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}