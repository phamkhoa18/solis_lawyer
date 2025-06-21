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
import toast from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IType } from '@/lib/types/itype';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TypePage() {
  const [types, setTypes] = useState<IType[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editType, setEditType] = useState<IType | null>(null);

  const [form, setForm] = useState<Omit<IType, '_id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  });

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/type');
      const data = await res.json();
      if (data.success) {
        setTypes(data.data);
      } else {
        toast.error('Không tải được danh sách types');
      }
    } catch {
      toast.error('Lỗi khi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditType(null);
    setForm({ name: '', slug: '', description: '', isActive: true });
    setOpen(true);
  };

  const handleOpenEdit = (type: IType) => {
    setIsEditing(true);
    setEditType(type);
    setForm({
      name: type.name,
      slug: type.slug,
      description: type.description || '',
      isActive: type.isActive ?? true,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Vui lòng nhập tên và slug');
      return;
    }

    try {
      let res, data;
      if (isEditing && editType) {
        res = await fetch(`/api/type/${editType._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (data.success) {
          toast.success('Cập nhật type thành công');
          fetchTypes();
          setOpen(false);
        } else {
          toast.error(data.message || 'Cập nhật thất bại');
        }
      } else {
        res = await fetch('/api/type', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (data.success) {
          toast.success('Tạo type thành công');
          fetchTypes();
          setOpen(false);
        } else {
          toast.error(data.message || 'Tạo thất bại');
        }
      }
    } catch {
      toast.error('Lỗi server');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa type này không?')) return;

    try {
      const res = await fetch(`/api/type/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Xóa type thành công');
        fetchTypes();
      } else {
        toast.error(data.message || 'Xóa thất bại');
      }
    } catch {
      toast.error('Lỗi server khi xóa');
    }
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-2xl font-bold text-gray-900">Quản lý Type</CardTitle>
          <Button onClick={handleOpenCreate}>+ Tạo mới</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {loading ? (
          <div>Đang tải...</div>
        ) : types.length === 0 ? (
          <div>Chưa có type nào.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map((type) => (
                <TableRow key={type._id} className="hover:bg-gray-50">
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type.slug}</TableCell>
                  <TableCell>{type.description}</TableCell>
                  <TableCell className="text-center">
                    {type.isActive ? (
                      <span className="text-green-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(type)}>
                      Sửa
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(type._id)}>
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
              <DialogTitle>{isEditing ? 'Cập nhật Type' : 'Tạo mới Type'}</DialogTitle>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Tên</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Nhập tên type"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="Nhập slug"
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả ngắn"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="cursor-pointer"
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