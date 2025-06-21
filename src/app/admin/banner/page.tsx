'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
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
import { IBanner } from '@/lib/types/iBanner';

export default function BannersPage() {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [filteredBanners, setFilteredBanners] = useState<IBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/banners');
      const data = await res.json();
      if (res.ok) {
        setBanners(data);
        setFilteredBanners(data);
      } else {
        setError('Không thể tải banners');
      }
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    const filtered = banners.filter(
      (banner) =>
        banner.name.vi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.name.en.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBanners(filtered);
  }, [searchTerm, banners]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/banners?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Đã xóa banner thành công');
        fetchBanners();
      } else {
        toast.error('Xóa không thành công');
      }
    } catch {
      toast.error('Lỗi khi xóa banner');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Banner</h1>
        <Link href="/admin/banner/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Tạo Banner
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="shadow-md">
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : filteredBanners.length === 0 ? (
            <p className="text-gray-500 text-center">Không có banner nào</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Hình ảnh</TableHead>
                  <TableHead>Tên (VI)</TableHead>
                  <TableHead>Tên (EN)</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanners.map((banner) => (
                  <TableRow key={banner._id} className="hover:bg-gray-50">
                    <TableCell>
                      <Image
                        src={banner.image}
                        alt={banner.name.vi}
                        width={50}
                        height={50}
                        className="object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{banner.name.vi}</TableCell>
                    <TableCell>{banner.name.en}</TableCell>
                    <TableCell>
                      {banner.link ? (
                        <a
                          href={banner.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {banner.link}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          banner.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {banner.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(banner.createdAt || '').toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Link href={`/admin/banner/edit/${banner._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          aria-label="Chỉnh sửa banner"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <AlertDialog open={deleteId === banner._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => setDeleteId(banner._id)}
                            aria-label="Xóa banner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bạn chắc chắn muốn xóa banner này?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Vui lòng xác nhận để tiếp tục.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                if (deleteId) handleDelete(deleteId);
                              }}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Xóa
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