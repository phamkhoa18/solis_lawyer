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
import toast from 'react-hot-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ICategory } from '@/lib/types/icategory';
import { Plus, Pencil, Trash2, FolderTree, RefreshCw } from 'lucide-react';

interface CategoryForm {
  name: { en: string; vi: string };
  slug: string;
  isActive: boolean;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCategory, setEditCategory] = useState<ICategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<CategoryForm>({
    name: { en: '', vi: '' },
    slug: '',
    isActive: true,
  });

  const isValidSlug = (slug: string): boolean => /^[a-z0-9-]+$/.test(slug);

  const fetchCategories = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) { setCategories(data.data); }
      else { setError('Không tải được danh mục'); toast.error('Không tải được danh mục'); }
    } catch {
      setError('Lỗi kết nối server'); toast.error('Lỗi kết nối server');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpenCreate = () => {
    setIsEditing(false); setEditCategory(null);
    setForm({ name: { en: '', vi: '' }, slug: '', isActive: true });
    setOpen(true);
  };

  const handleOpenEdit = (cat: ICategory) => {
    setIsEditing(true); setEditCategory(cat);
    setForm({ name: { en: cat.name.en, vi: cat.name.vi }, slug: cat.slug, isActive: cat.isActive });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.en.trim() || !form.name.vi.trim() || !form.slug.trim()) {
      toast.error('Vui lòng nhập tên (EN, VI) và slug'); return;
    }
    if (!isValidSlug(form.slug)) {
      toast.error('Slug chỉ chứa chữ thường, số và dấu gạch ngang'); return;
    }
    try {
      let res, data;
      if (isEditing && editCategory?._id) {
        res = await fetch(`/api/categories?id=${editCategory._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        data = await res.json();
        if (data.success) { toast.success('Cập nhật danh mục thành công'); fetchCategories(); setOpen(false); }
        else { toast.error(data.message || 'Cập nhật thất bại'); }
      } else {
        res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        data = await res.json();
        if (data.success) { toast.success('Tạo danh mục thành công'); fetchCategories(); setOpen(false); }
        else { toast.error(data.message || 'Tạo thất bại'); }
      }
    } catch { toast.error('Lỗi server'); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Xóa danh mục thành công'); fetchCategories(); }
      else { toast.error(data.message || 'Xóa thất bại'); }
    } catch { toast.error('Lỗi server khi xóa'); }
    finally { setDeletingId(null); setDeleteId(null); }
  };

  const v = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const iv = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <motion.div className="space-y-6" variants={v} initial="hidden" animate="visible">
      <motion.div variants={iv} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Danh mục</h1>
          <p className="text-sm text-slate-500 mt-1">{!loading && `${categories.length} danh mục`}</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] hover:from-[#c9a060] hover:to-[#8a6340] text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" />Tạo mới
        </Button>
      </motion.div>

      <motion.div variants={iv}>
        <Card className="shadow-sm border-0 rounded-lg overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-3"><RefreshCw className="w-5 h-5 text-red-500" /></div>
                <p className="text-red-500 font-medium">{error}</p>
                <Button variant="outline" className="mt-4 rounded-xl" onClick={fetchCategories}>Thử lại</Button>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3"><FolderTree className="w-5 h-5 text-slate-400" /></div>
                <p className="text-slate-500 font-medium">Chưa có danh mục nào</p>
                <p className="text-sm text-slate-400 mt-1">Tạo danh mục mới để bắt đầu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="font-semibold text-slate-600">Tên (EN)</TableHead>
                      <TableHead className="font-semibold text-slate-600">Tên (VI)</TableHead>
                      <TableHead className="font-semibold text-slate-600">Slug</TableHead>
                      <TableHead className="text-center font-semibold text-slate-600">Trạng thái</TableHead>
                      <TableHead className="text-center font-semibold text-slate-600">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat._id?.toString()} className="transition-colors">
                        <TableCell className="font-medium text-slate-700">{cat.name.en}</TableCell>
                        <TableCell className="text-slate-600">{cat.name.vi}</TableCell>
                        <TableCell className="text-sm text-slate-500 font-mono">{cat.slug}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            cat.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cat.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {cat.isActive ? 'Kích hoạt' : 'Tắt'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1.5">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => handleOpenEdit(cat)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <AlertDialog open={deleteId === cat._id?.toString()} onOpenChange={(open) => !open && setDeleteId(null)}>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => setDeleteId(cat._id!.toString())} disabled={deletingId === cat._id?.toString()}><Trash2 className="w-3.5 h-3.5" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader><AlertDialogTitle>Xóa danh mục này?</AlertDialogTitle><AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(cat._id!.toString())} className="bg-red-600 hover:bg-red-700 rounded-xl">{deletingId === cat._id?.toString() ? 'Đang xóa...' : 'Xóa'}</AlertDialogAction>
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

      {/* Dialog Create/Edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">{isEditing ? 'Cập nhật Danh mục' : 'Tạo mới Danh mục'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nameEn" className="text-sm font-medium text-slate-700">Tên (Tiếng Anh)</Label>
              <Input id="nameEn" value={form.name.en} onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })} required placeholder="Nhập tên tiếng Anh" className="mt-1.5 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="nameVi" className="text-sm font-medium text-slate-700">Tên (Tiếng Việt)</Label>
              <Input id="nameVi" value={form.name.vi} onChange={(e) => setForm({ ...form, name: { ...form.name, vi: e.target.value } })} required placeholder="Nhập tên tiếng Việt" className="mt-1.5 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="slug" className="text-sm font-medium text-slate-700">Slug</Label>
              <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="Nhập slug (ví dụ: business-law)" className="mt-1.5 rounded-xl font-mono text-sm" />
            </div>
            <div className="flex items-center space-x-3 py-1">
              <Switch id="isActive" checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
              <Label htmlFor="isActive" className="cursor-pointer text-sm text-slate-700">Kích hoạt</Label>
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