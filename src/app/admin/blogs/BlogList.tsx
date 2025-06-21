/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

import { IPost } from '@/lib/types/ipost';

export default function BlogsPage() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);



  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.success) {
        console.log(data);
        
        setPosts(data.data);
        setFilteredPosts(data.data);
      } else {
        setError('Không thể tải bài viết');
      }
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const filtered = posts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [searchTerm, posts]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Đã xoá bài viết thành công');
        fetchPosts();
      } else {
        toast.error('Xoá không thành công');
      }
    } catch {
      toast.error('Lỗi khi xoá bài viết');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-3 space-y-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
        <Link href="/admin/blogs/create">
          <Button>Tạo bài viết</Button>
        </Link>
      </div>

      <Input
        placeholder="Tìm kiếm theo tiêu đề..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm mb-4"
      />

      <Card className='overflow-y-hidden'>
        <CardContent className="p-4">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredPosts.length === 0 ? (
            <p className="text-muted-foreground">Không có bài viết nào</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Truy cập</TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody >
                {filteredPosts.map((post) => (
                  <TableRow key={post._id} >
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell className="font-medium"><a href={`/post/${post.slug}`} target='_blank' className='px-2 py-1 rounded text-xs font-semibold bg-blue-600 text-white'>Link</a></TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {post.status}
                      </span>
                    </TableCell>
                    <TableCell>{(post as any).author?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      {post.viewsCount}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Link href={`/admin/blogs/edit/${post._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          aria-label="Chỉnh sửa bài viết"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>

                      {/* AlertDialog của Shadcn */}
                      <AlertDialog open={deleteId === post._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            aria-label="Xóa bài viết"
                            onClick={() => setDeleteId(post._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bạn chắc chắn muốn xoá bài viết này?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Vui lòng xác nhận để tiếp tục.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Huỷ</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                if (deleteId) handleDelete(deleteId);
                              }}
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              Xoá
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
