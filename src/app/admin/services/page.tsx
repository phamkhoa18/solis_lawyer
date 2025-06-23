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
import { IService } from '@/lib/types/iservice';
import { ApiResponse } from '@/lib/types/api-response';

export default function ServicesPage() {
  const [services, setServices] = useState<IService[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300); // Debounce search input
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/services');
      const data: ApiResponse<IService[]> = await res.json();
      if (data.success && data.data) {
        setServices(data.data);
      } else {
        toast.error(data.message || 'Không thể tải dịch vụ');
        setError(data.message || 'Không thể tải dịch vụ');
      }
    } catch (error: unknown) {
      console.error('Fetch services error:', error);
      const message = error instanceof Error ? error.message : 'Lỗi kết nối đến máy chủ';
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter(
      (service) =>
        service.name.vi.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        service.name.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (service.link || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm, services]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      const data: ApiResponse<null> = await res.json();
      if (data.success) {
        toast.success(data.message || 'Đã xóa dịch vụ thành công');
        fetchServices();
      } else {
        toast.error(data.message || 'Xóa không thành công');
      }
    } catch (error: unknown) {
      console.error('Delete service error:', error);
      toast.error(error instanceof Error ? error.message : 'Lỗi khi xóa dịch vụ');
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Dịch Vụ</h1>
        <Link href="/admin/services/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Tạo Dịch Vụ</Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm theo tên hoặc link..."
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
                onClick={fetchServices}
              >
                Thử lại
              </Button>
            </div>
          ) : filteredServices.length === 0 ? (
            <p className="text-gray-500 text-center">Không có dịch vụ nào</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Hình ảnh</TableHead>
                  <TableHead>Tên (VI)</TableHead>
                  <TableHead>Tên (EN)</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service._id?.toString()} className="hover:bg-gray-50">
                    <TableCell>
                      <Image
                        src={service.img}
                        alt={service.name.vi || 'Service'}
                        width={50}
                        height={50}
                        className="object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{service.name.vi}</TableCell>
                    <TableCell>{service.name.en}</TableCell>
                    <TableCell>
                      {service.link ? (
                        <a
                          href={service.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {service.link}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {service.createdAt
                        ? new Date(service.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Link href={`/admin/services/edit/${service._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          aria-label="Chỉnh sửa dịch vụ"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <AlertDialog open={deleteId === service._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => setDeleteId(service._id?.toString() || '')}
                            aria-label="Xóa dịch vụ"
                            disabled={deletingId === service._id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bạn chắc chắn muốn xóa dịch vụ này?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Vui lòng xác nhận để tiếp tục.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deletingId === service._id}>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(service._id?.toString() || '')}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deletingId === service._id}
                            >
                              {deletingId === service._id ? 'Đang xóa...' : 'Xóa'}
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