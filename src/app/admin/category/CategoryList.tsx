'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ICategory } from '@/lib/types/icategory';

interface CategoryForm {
  name: { en: string; vi: string };
  slug: string;
  isActive: boolean;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCategory, setEditCategory] = useState<ICategory | null>(null);

  const [form, setForm] = useState<CategoryForm>({
    name: { en: '', vi: '' },
    slug: '',
    isActive: true,
  });

  // Validate slug format
  const isValidSlug = (slug: string): boolean => /^[a-z0-9-]+$/.test(slug);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        toast.error('Không tải được danh mục');
      }
    } catch {
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Open create dialog
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditCategory(null);
    setForm({ name: { en: '', vi: '' }, slug: '', isActive: true });
    setOpen(true);
  };

  // Open edit dialog
  const handleOpenEdit = (cat: ICategory) => {
    setIsEditing(true);
    setEditCategory(cat);
    setForm({
      name: { en: cat.name.en, vi: cat.name.vi },
      slug: cat.slug,
      isActive: cat.isActive,
    });
    setOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.en.trim() || !form.name.vi.trim() || !form.slug.trim()) {
      toast.error('Vui lòng nhập tên (EN, VI) và slug');
      return;
    }
    if (!isValidSlug(form.slug)) {
      toast.error('Slug chỉ chứa chữ thường, số và dấu gạch ngang');
      return;
    }

    try {
      let res, data;
      if (isEditing && editCategory?._id) {
        res = await fetch(`/api/categories?id=${editCategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (data.success) {
          toast.success('Cập nhật danh mục thành công');
          fetchCategories();
          setOpen(false);
        } else {
          toast.error(data.message || 'Cập nhật thất bại');
        }
      } else {
        res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (data.success) {
          toast.success('Tạo danh mục thành công');
          fetchCategories();
          setOpen(false);
        } else {
          toast.error(data.message || 'Tạo thất bại');
        }
      }
    } catch {
      toast.error('Lỗi server');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return;
    }

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Xóa danh mục thành công');
        fetchCategories();
      } else {
        toast.error(data.message || 'Xóa thất bại');
      }
    } catch {
      toast.error('Lỗi server khi xóa');
    }
  };

  return (
    <Card className="shadow-xl border-0 max-w-7xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-2xl font-bold text-gray-900">Quản lý Danh mục</CardTitle>
          <Button onClick={handleOpenCreate}>+ Tạo mới</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên (EN)</TableHead>
                <TableHead>Tên (VI)</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : categories.length === 0 ? (
          <div className="text-center py-6 text-gray-500">Chưa có danh mục nào.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên (EN)</TableHead>
                <TableHead>Tên (VI)</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat._id?.toString()} className="hover:bg-gray-50">
                  <TableCell>{cat.name.en}</TableCell>
                  <TableCell>{cat.name.vi}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell className="text-center">
                    {cat.isActive ? (
                      <span className="text-green-600 font-semibold">Kích hoạt</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Tắt</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(cat)}>
                      Sửa
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(cat._id!.toString())}>
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Cập nhật Danh mục' : 'Tạo mới Danh mục'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nameEn">Tên (Tiếng Anh)</Label>
                <Input
                  id="nameEn"
                  value={form.name.en}
                  onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })}
                  required
                  placeholder="Nhập tên tiếng Anh"
                />
              </div>
              <div>
                <Label htmlFor="nameVi">Tên (Tiếng Việt)</Label>
                <Input
                  id="nameVi"
                  value={form.name.vi}
                  onChange={(e) => setForm({ ...form, name: { ...form.name, vi: e.target.value } })}
                  required
                  placeholder="Nhập tên tiếng Việt"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="Nhập slug (ví dụ: business-law)"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Kích hoạt
                </Label>
              </div>
              <DialogFooter>
                <Button type="submit">{isEditing ? 'Cập nhật' : 'Tạo mới'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}