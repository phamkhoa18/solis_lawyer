/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Pencil, Trash2, Search, Plus, Package, RefreshCw } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { IProduct } from '@/lib/types/iproduct';
import { ApiResponse } from '@/lib/types/api-response';

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/products');
      const data: ApiResponse<IProduct[]> = await res.json();
      if (data.success && data.data) { setProducts(data.data); }
      else { setError('Không thể tải sản phẩm'); toast.error('Không thể tải sản phẩm'); }
    } catch {
      setError('Lỗi kết nối đến máy chủ'); toast.error('Lỗi kết nối đến máy chủ');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => p.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [debouncedSearchTerm, products]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data: ApiResponse<null> = await res.json();
      if (data.success) { toast.success('Đã xóa sản phẩm'); fetchProducts(); }
      else { toast.error(data.message || 'Xóa không thành công'); }
    } catch { toast.error('Lỗi khi xóa sản phẩm'); }
    finally { setDeletingId(null); setDeleteId(null); }
  };

  const v = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const iv = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <motion.div className="space-y-6" variants={v} initial="hidden" animate="visible">
      <motion.div variants={iv} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-1">{!loading && `${filteredProducts.length} sản phẩm`}</p>
        </div>
        <Link href="/admin/products/create">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/20 rounded-xl">
            <Plus className="w-4 h-4 mr-2" />Tạo sản phẩm
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={iv} className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Tìm kiếm theo tiêu đề..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-11 rounded-xl border-slate-200 focus:border-blue-400" />
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
                <Button variant="outline" className="mt-4 rounded-xl" onClick={fetchProducts}>Thử lại</Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3"><Package className="w-5 h-5 text-slate-400" /></div>
                <p className="text-slate-500 font-medium">Không có sản phẩm nào</p>
                <p className="text-sm text-slate-400 mt-1">Tạo sản phẩm mới để bắt đầu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="w-20 font-semibold text-slate-600">Hình ảnh</TableHead>
                      <TableHead className="font-semibold text-slate-600 min-w-[200px]">Tiêu đề</TableHead>
                      <TableHead className="font-semibold text-slate-600">Danh mục</TableHead>
                      <TableHead className="font-semibold text-slate-600">Kích thước</TableHead>
                      <TableHead className="font-semibold text-slate-600">Ngày tạo</TableHead>
                      <TableHead className="text-center font-semibold text-slate-600">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product._id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell>
                          <Image src={product.image} alt={product.title} width={50} height={50} className="object-cover rounded-lg aspect-square" />
                        </TableCell>
                        <TableCell className="font-medium text-slate-700 truncate max-w-sm">{product.title}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{(product as any).category?.name || 'N/A'}</TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {product.width && product.height ? <span className="px-2 py-1 bg-slate-100 rounded-md text-slate-600 border border-slate-200">{product.width} × {product.height} m</span> : <span className="text-slate-400">—</span>}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {new Date(product.createdAt || '').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1.5">
                            <Link href={`/admin/products/edit/${product._id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></Button>
                            </Link>
                            <AlertDialog open={deleteId === product._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => setDeleteId(product._id)} disabled={deletingId === product._id}><Trash2 className="w-3.5 h-3.5" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader><AlertDialogTitle>Xóa sản phẩm này?</AlertDialogTitle><AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(product._id)} className="bg-red-600 hover:bg-red-700 rounded-xl" disabled={deletingId === product._id}>{deletingId === product._id ? 'Đang xóa...' : 'Xóa'}</AlertDialogAction>
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