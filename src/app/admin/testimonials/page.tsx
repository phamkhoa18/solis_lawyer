'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
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
import { Pencil, Trash2, Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { ITestimonial } from '@/lib/types/itestimonial';
import { ApiResponse } from '@/lib/types/api-response';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<ITestimonial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300); // Debounce search input
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/testimonials');
      const data: ApiResponse<ITestimonial[]> = await res.json();
      if (data.success && data.data) {
        setTestimonials(data.data);
      } else {
        toast.error(data.message || 'Không thể tải lời chứng thực');
        setError(data.message || 'Không thể tải lời chứng thực');
      }
    } catch (error: unknown) {
      console.error('Fetch testimonials error:', error);
      const message = error instanceof Error ? error.message : 'Lỗi kết nối đến máy chủ';
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter(
      (testimonial) =>
        testimonial.name.vi.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        testimonial.name.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        testimonial.content.vi.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        testimonial.content.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm, testimonials]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' });
      const data: ApiResponse<null> = await res.json();
      if (data.success) {
        toast.success(data.message || 'Đã xóa lời chứng thực thành công');
        fetchTestimonials();
      } else {
        toast.error(data.message || 'Xóa không thành công');
      }
    } catch (error: unknown) {
      console.error('Delete testimonial error:', error);
      toast.error(error instanceof Error ? error.message : 'Lỗi khi xóa lời chứng thực');
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Lời Chứng Thực</h1>
        <Link href="/admin/testimonials/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Tạo Lời Chứng Thực</Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm theo tên hoặc nội dung..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="shadow-md">
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
              <Button
                variant="outline"
                className="mt-4"
                onClick={fetchTestimonials}
              >
                Thử lại
              </Button>
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <p className="text-gray-500 text-center">Không có lời chứng thực nào</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Hình ảnh</TableHead>
                  <TableHead>Tên (VI)</TableHead>
                  <TableHead>Tên (EN)</TableHead>
                  <TableHead>Nội dung (VI)</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTestimonials.map((testimonial) => (
                  <TableRow key={testimonial._id?.toString()} className="hover:bg-gray-50">
                    <TableCell>
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name.vi || 'Testimonial'}
                        width={50}
                        height={50}
                        className="object-cover rounded-full"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{testimonial.name.vi}</TableCell>
                    <TableCell>{testimonial.name.en}</TableCell>
                    <TableCell className="max-w-xs truncate">{testimonial.content.vi}</TableCell>
                    <TableCell>
                      {testimonial.createdAt
                        ? new Date(testimonial.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Link href={`/admin/testimonials/edit/${testimonial._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          aria-label="Chỉnh sửa lời chứng thực"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <AlertDialog open={deleteId === testimonial._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => setDeleteId(testimonial._id?.toString() || '')}
                            aria-label="Xóa lời chứng thực"
                            disabled={deletingId === testimonial._id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bạn chắc chắn muốn xóa lời chứng thực này?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Vui lòng xác nhận để tiếp tục.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deletingId === testimonial._id}>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(testimonial._id?.toString() || '')}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deletingId === testimonial._id}
                            >
                              {deletingId === testimonial._id ? 'Đang xóa...' : 'Xóa'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}