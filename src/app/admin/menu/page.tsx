'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';
import { IMenu } from '@/lib/types/imenu';
import { Plus, Pencil, Trash2, Menu as MenuIcon, RefreshCw, ChevronRight } from 'lucide-react';

interface MenuForm {
  name: { en: string; vi: string };
  link: string;
  slug: string;
  icon: string;
  parentId: string | null;
  isActive: boolean;
}

export default function MenuPage() {
  const [menus, setMenus] = useState<IMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMenu, setEditMenu] = useState<IMenu | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<MenuForm>({
    name: { en: '', vi: '' },
    link: '/',
    slug: '',
    icon: '',
    parentId: null,
    isActive: true,
  });

  const fetchMenus = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/menus');
      const data = await res.json();
      if (data.success) { setMenus(data.data); }
      else { setError('Không tải được danh sách menu'); toast.error('Không tải được danh sách menu'); }
    } catch {
      setError('Lỗi kết nối server'); toast.error('Lỗi kết nối server');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMenus(); }, []);

  const handleOpenCreate = () => {
    setIsEditing(false); setEditMenu(null);
    setForm({ name: { en: '', vi: '' }, link: '/', slug: '', icon: '', parentId: null, isActive: true });
    setOpen(true);
  };

  const handleOpenEdit = (menu: IMenu) => {
    setIsEditing(true); setEditMenu(menu);
    setForm({
      name: menu.name, link: menu.link, slug: menu.slug, icon: menu.icon || '', parentId: menu.parentId ? menu.parentId.toString() : null, isActive: menu.isActive,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.vi.trim() || !form.name.en.trim() || !form.slug.trim() || !form.link.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc'); return;
    }
    try {
      let res, data;
      if (isEditing && editMenu?._id) {
        res = await fetch(`/api/menus/${editMenu._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        data = await res.json();
        if (data.success) { toast.success('Cập nhật thành công'); fetchMenus(); setOpen(false); }
        else { toast.error(data.message || 'Cập nhật thất bại'); }
      } else {
        const sameParentMenus = menus.filter((m) => (m.parentId || null) === (form.parentId || null));
        const maxOrder = sameParentMenus.length ? Math.max(...sameParentMenus.map((m) => m.order)) + 1 : 0;
        res = await fetch('/api/menus', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, order: maxOrder }) });
        data = await res.json();
        if (data.success) { toast.success('Tạo thành công'); fetchMenus(); setOpen(false); }
        else { toast.error(data.message || 'Tạo thất bại'); }
      }
    } catch { toast.error('Lỗi server'); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/menus/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Xóa thành công'); fetchMenus(); }
      else { toast.error(data.message || 'Xóa thất bại'); }
    } catch { toast.error('Lỗi server khi xóa'); }
    finally { setDeletingId(null); setDeleteId(null); }
  };

  const renderMenuTree = (items: IMenu[], parentId: string | null = null, depth: number = 0) => {
    const filteredItems = items.filter((item) => (item.parentId || null) === parentId).sort((a, b) => a.order - b.order);
    return filteredItems.map((menu) => (
      <React.Fragment key={menu._id.toString()}>
        <div
          className="flex items-center py-3 px-4 hover:bg-slate-50/80 transition-colors"
          style={{ paddingLeft: `${(depth * 24) + 16}px` }}
        >
          <div className="flex-1 grid grid-cols-5 gap-4 items-center">
            <div className="font-medium text-slate-700 flex items-center text-sm">
              {depth > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 mr-1.5" />}
              {menu.name.vi}
            </div>
            <div className="text-sm text-[#9b6f45] truncate">{menu.link}</div>
            <div className="text-sm text-slate-500 font-mono truncate">{menu.slug}</div>
            <div className="text-center">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                menu.isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${menu.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {menu.isActive ? 'Hoạt động' : 'Tắt'}
              </span>
            </div>
            <div className="flex justify-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-[#9b6f45] hover:bg-amber-50" onClick={() => handleOpenEdit(menu)}><Pencil className="w-3.5 h-3.5" /></Button>
              <AlertDialog open={deleteId === menu._id?.toString()} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(menu._id!.toString())} disabled={deletingId === menu._id?.toString()}><Trash2 className="w-3.5 h-3.5" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Xóa menu này?</AlertDialogTitle><AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(menu._id!.toString())} className="bg-red-600 hover:bg-red-700">{deletingId === menu._id?.toString() ? 'Đang xóa...' : 'Xóa'}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        {renderMenuTree(items, menu._id.toString(), depth + 1)}
      </React.Fragment>
    ));
  };

  const v = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const iv = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <motion.div className="space-y-6" variants={v} initial="hidden" animate="visible">
      <motion.div variants={iv} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Menu</h1>
          <p className="text-sm text-slate-500 mt-1">{!loading && `${menus.length} mục menu`}</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] hover:from-[#c9a060] hover:to-[#8a6340] text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" />Tạo mới
        </Button>
      </motion.div>

      <motion.div variants={iv}>
        <Card className="shadow-sm border-0 rounded-lg overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3"><RefreshCw className="w-5 h-5 text-red-500" /></div>
                <p className="text-red-500 font-medium">{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchMenus}>Thử lại</Button>
              </div>
            ) : menus.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3"><MenuIcon className="w-5 h-5 text-slate-400" /></div>
                <p className="text-slate-500 font-medium">Chưa có menu nào</p>
                <p className="text-sm text-slate-400 mt-1">Tạo menu mới để bắt đầu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 gap-4 bg-slate-50/80 py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    <div>Tên (VI)</div>
                    <div>Link</div>
                    <div>Slug</div>
                    <div className="text-center">Trạng thái</div>
                    <div className="text-center">Hành động</div>
                  </div>
                  {/* Table Body */}
                  <div className="divide-y divide-slate-50">
                    {renderMenuTree(menus)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog Create/Edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">{isEditing ? 'Cập nhật Menu' : 'Tạo mới Menu'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nameEn" className="text-sm text-slate-600">Tên (EN)</Label>
                <Input id="nameEn" value={form.name.en} onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })} required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="nameVi" className="text-sm text-slate-600">Tên (VI)</Label>
                <Input id="nameVi" value={form.name.vi} onChange={(e) => setForm({ ...form, name: { ...form.name, vi: e.target.value } })} required className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="link" className="text-sm text-slate-600">Link</Label>
              <Input id="link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="slug" className="text-sm text-slate-600">Slug</Label>
              <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="mt-1.5 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-sm text-slate-600">Menu cha</Label>
              <Select value={form.parentId ? form.parentId.toString() : 'none'} onValueChange={(value) => setForm({ ...form, parentId: value === 'none' ? null : value })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Chọn menu cha (nếu có)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Không có --</SelectItem>
                  {(() => {
                    // loại chính nó + mọi hậu duệ để không tạo vòng lặp menu
                    const descendants = new Set<string>();
                    const collect = (id: string) => {
                      menus.filter((m) => m.parentId?.toString() === id).forEach((m) => {
                        const mid = m._id.toString();
                        if (!descendants.has(mid)) { descendants.add(mid); collect(mid); }
                      });
                    };
                    if (editMenu) collect(editMenu._id.toString());
                    return menus
                      .filter((menu) => (!editMenu || menu._id !== editMenu._id) && !descendants.has(menu._id.toString()))
                      .map((menu) => (
                        <SelectItem key={menu._id.toString()} value={menu._id.toString()}>{menu.name.vi}</SelectItem>
                      ));
                  })()}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-3 py-1">
              <Switch id="isActive" checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
              <Label htmlFor="isActive" className="cursor-pointer text-sm text-slate-700">Hoạt động</Label>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] hover:from-[#c9a060] hover:to-[#8a6340]">{isEditing ? 'Cập nhật' : 'Tạo mới'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
