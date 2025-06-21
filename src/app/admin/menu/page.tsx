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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { IMenu } from '@/lib/types/imenu';

interface MenuItemProps {
  menu: IMenu;
  onEdit: (menu: IMenu) => void;
  onDelete: (id: string) => void;
  depth?: number;
}

const MenuItem: React.FC<MenuItemProps> = ({ menu, onEdit, onDelete, depth = 0 }) => {
  return (
    <div
      className="flex items-center py-2 px-4 border-b hover:bg-gray-50"
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <div className="flex-1 grid grid-cols-5 gap-4">
        <div>{menu.name.en}</div>
        <div>{menu.link}</div>
        <div>{menu.slug}</div>
        <div className="text-center">
          {menu.isActive ? (
            <span className="text-green-600 font-semibold">Active</span>
          ) : (
            <span className="text-red-600 font-semibold">Inactive</span>
          )}
        </div>
        <div className="text-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(menu)}>
            Sửa
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(menu._id.toString())}>
            Xóa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function MenuPage() {
  const [menus, setMenus] = useState<IMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMenu, setEditMenu] = useState<IMenu | null>(null);

  const [form, setForm] = useState<Omit<IMenu, '_id' | 'createdAt' | 'updatedAt' | 'children' | 'order'>>({
    name: { en: '', vi: '' },
    link: '/',
    slug: '',
    icon: '',
    parentId: null,
    isActive: true,
  });

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menus');
      const data = await res.json();
      if (data.success) {
        setMenus(data.data);
      } else {
        toast.error('Không tải được danh sách menu');
      }
    } catch {
      toast.error('Lỗi khi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditMenu(null);
    setForm({
      name: { en: '', vi: '' },
      link: '/',
      slug: '',
      icon: '',
      parentId: null,
      isActive: true,
    });
    setOpen(true);
  };

  const handleOpenEdit = (menu: IMenu) => {
    setIsEditing(true);
    setEditMenu(menu);
    setForm({
      name: menu.name,
      link: menu.link,
      slug: menu.slug,
      icon: menu.icon || '',
      parentId: menu.parentId,
      isActive: menu.isActive,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.vi.trim() || !form.name.en.trim() || !form.slug.trim() || !form.link.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      let res, data;
      if (isEditing && editMenu) {
        res = await fetch(`/api/menus/${editMenu._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (data.success) {
          toast.success('Cập nhật menu thành công');
          await fetchMenus();
          setOpen(false);
        } else {
          toast.error(data.message || 'Cập nhật thất bại');
        }
      } else {
        const sameParentMenus = menus.filter((m) => (m.parentId || null) === (form.parentId || null));
        const maxOrder = sameParentMenus.length
          ? Math.max(...sameParentMenus.map((m) => m.order)) + 1
          : 0;

        res = await fetch('/api/menus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, order: maxOrder }),
        });
        data = await res.json();
        if (data.success) {
          toast.success('Tạo menu thành công');
          await fetchMenus();
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
    if (!confirm('Bạn có chắc chắn muốn xóa menu này không?')) return;

    try {
      const res = await fetch(`/api/menus/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Xóa menu thành công');
        await fetchMenus();
      } else {
        toast.error(data.message || 'Xóa thất bại');
      }
    } catch {
      toast.error('Lỗi server khi xóa');
    }
  };

  const renderMenuTree = (items: IMenu[], parentId: string | null = null, depth: number = 0) => {
    const filteredItems = items
      .filter((item) => (item.parentId || null) === parentId)
      .sort((a, b) => a.order - b.order);

    return filteredItems.map((menu) => (
      <React.Fragment key={menu._id.toString()}>
        <MenuItem
          menu={menu}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          depth={depth}
        />
        {renderMenuTree(items, menu._id.toString(), depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-2xl font-bold text-gray-900">Quản lý Menu</CardTitle>
          <Button onClick={handleOpenCreate}>+ Tạo mới</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {loading ? (
          <div className="p-6">Đang tải...</div>
        ) : menus.length === 0 ? (
          <div className="p-6">Chưa có menu nào.</div>
        ) : (
          <div className="border rounded-md">
            <div className="grid grid-cols-5 gap-4 font-semibold bg-gray-100 py-3 px-4">
              <div>Tên (EN)</div>
              <div>Link</div>
              <div>Slug</div>
              <div className="text-center">Trạng thái</div>
              <div className="text-center">Hành động</div>
            </div>
            {renderMenuTree(menus)}
          </div>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Cập nhật Menu' : 'Tạo mới Menu'}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="nameEn" className="mb-2">Tên (Tiếng Anh)</Label>
                <Input
                  id="nameEn"
                  value={form.name.en}
                  onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })}
                  required
                  placeholder="Nhập tên menu (EN)"
                />
              </div>
              <div>
                <Label htmlFor="nameVi" className="mb-2">Tên (Tiếng Việt)</Label>
                <Input
                  id="nameVi"
                  value={form.name.vi}
                  onChange={(e) => setForm({ ...form, name: { ...form.name, vi: e.target.value } })}
                  required
                  placeholder="Nhập tên menu (VI)"
                />
              </div>
              <div>
                <Label htmlFor="link" className="mb-2">Link</Label>
                <Input
                  id="link"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  required
                  placeholder="Nhập link"
                />
              </div>
              <div>
                <Label htmlFor="slug" className="mb-2">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="Nhập slug"
                />
              </div>
              <div>
                <Label htmlFor="icon" className="mb-2">Icon</Label>
                <Input
                  id="icon"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="Nhập tên icon (tùy chọn)"
                />
              </div>
              <div>
                <Label htmlFor="parentId" className="mb-2">Menu cha</Label>
                <Select
                  value={form.parentId ? form.parentId.toString() : 'none'}
                  onValueChange={(value) =>
                    setForm({ ...form, parentId: value === 'none' ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn menu cha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có</SelectItem>
                    {menus
                      .filter((menu) => !editMenu || menu._id !== editMenu._id)
                      .map((menu) => (
                        <SelectItem key={menu._id.toString()} value={menu._id.toString()}>
                          {menu.name.en}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
                <Label htmlFor="isActive">Kích hoạt</Label>
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
