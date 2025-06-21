/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { Pencil, Trash2 } from 'lucide-react';

import { IProduct } from '@/lib/types/iproduct';

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setFilteredProducts(data.data);
      } else {
        setError('Không thể tải sản phẩm');
      }
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Đã xóa sản phẩm thành công');
        fetchProducts();
      } else {
        toast.error('Xóa không thành công');
      }
    } catch {
      toast.error('Lỗi khi xóa sản phẩm');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-3 space-y-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <Link href="/admin/products/create">
          <Button>Tạo sản phẩm</Button>
        </Link>
      </div>

      <Input
        placeholder="Tìm kiếm theo tiêu đề..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm mb-4"
      />

      <Card className="overflow-y-hidden">
        <CardContent className="p-4">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-muted-foreground">Không có sản phẩm nào</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Kích thước</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={50}
                        height={50}
                        className="object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{(product as any).category?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {product.width && product.height
                        ? `${product.width} x ${product.height} m`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(product.createdAt || '').toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Link href={`/admin/products/edit/${product._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          aria-label="Chỉnh sửa sản phẩm"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>

                      <AlertDialog open={deleteId === product._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            aria-label="Xóa sản phẩm"
                            onClick={() => setDeleteId(product._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bạn chắc chắn muốn xóa sản phẩm này?</AlertDialogTitle>
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
                              className="bg-red-600 text-white hover:bg-red-700"
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