/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
import { Pencil, Trash2, Search, Plus, BookOpen, RefreshCw, ExternalLink } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { IPost } from '@/lib/types/ipost';
import { ApiResponse } from '@/lib/types/api-response';

export default function BlogsPage() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/posts');
      const data: ApiResponse<IPost[]> = await res.json();
      if (data.success && data.data) { setPosts(data.data); }
      else { setError('Không thể tải bài viết'); toast.error('Không thể tải bài viết'); }
    } catch {
      setError('Lỗi kết nối đến máy chủ'); toast.error('Lỗi kết nối đến máy chủ');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [debouncedSearchTerm, posts]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      const data: ApiResponse<null> = await res.json();
      if (data.success) { toast.success('Đã xóa bài viết'); fetchPosts(); }
      else { toast.error(data.message || 'Xóa không thành công'); }
    } catch { toast.error('Lỗi khi xóa bài viết'); }
    finally { setDeletingId(null); setDeleteId(null); }
  };

  const v = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const iv = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <motion.div className="space-y-6" variants={v} initial="hidden" animate="visible">
      <motion.div variants={iv} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Bài viết</h1>
          <p className="text-sm text-slate-500 mt-1">{!loading && `${filteredPosts.length} bài viết`}</p>
        </div>
        <Link href="/admin/blogs/create">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/20 rounded-xl">
            <Plus className="w-4 h-4 mr-2" />Tạo bài viết
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
                <Button variant="outline" className="mt-4 rounded-xl" onClick={fetchPosts}>Thử lại</Button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3"><BookOpen className="w-5 h-5 text-slate-400" /></div>
                <p className="text-slate-500 font-medium">Không có bài viết nào</p>
                <p className="text-sm text-slate-400 mt-1">Tạo bài viết mới để bắt đầu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="font-semibold text-slate-600 min-w-[200px]">Tiêu đề</TableHead>
                      <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-slate-600">Tác giả</TableHead>
                      <TableHead className="font-semibold text-slate-600">Ngày tạo</TableHead>
                      <TableHead className="font-semibold text-slate-600 text-center">Lượt xem</TableHead>
                      <TableHead className="text-center font-semibold text-slate-600">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post._id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell>
                          <div className="font-medium text-slate-700 truncate max-w-sm">{post.title}</div>
                          <a href={`/post/${post.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs text-blue-600 hover:underline mt-1">
                            Xem bài viết <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            post.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            post.status === 'draft' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              post.status === 'published' ? 'bg-emerald-500' :
                              post.status === 'draft' ? 'bg-amber-500' : 'bg-slate-400'
                            }`} />
                            {post.status === 'published' ? 'Đã xuất bản' : post.status === 'draft' ? 'Bản nháp' : 'Lưu trữ'}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">{(post as any).author?.name || 'N/A'}</TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 text-center">{post.viewsCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1.5">
                            <Link href={`/admin/blogs/edit/${post._id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></Button>
                            </Link>
                            <AlertDialog open={deleteId === post._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => setDeleteId(post._id)} disabled={deletingId === post._id}><Trash2 className="w-3.5 h-3.5" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader><AlertDialogTitle>Xóa bài viết này?</AlertDialogTitle><AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(post._id)} className="bg-red-600 hover:bg-red-700 rounded-xl" disabled={deletingId === post._id}>{deletingId === post._id ? 'Đang xóa...' : 'Xóa'}</AlertDialogAction>
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
