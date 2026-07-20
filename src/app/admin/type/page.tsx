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
import { IType } from '@/lib/types/itype';
import { Plus, Pencil, Trash2, Tag, RefreshCw } from 'lucide-react';

interface TypeForm {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

export default function TypePage() {
  const [types, setTypes] = useState<IType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editType, setEditType] = useState<IType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<TypeForm>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  });

  const fetchTypes = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/type');
      const data = await res.json();
      if (data.success) { setTypes(data.data); }
      else { setError('Không tải được danh sách type'); toast.error('Không tải được danh sách type'); }
    } catch {
      setError('Lỗi kết nối server'); toast.error('Lỗi kết nối server');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleOpenCreate = () => {
    setIsEditing(false); setEditType(null);
    setForm({ name: '', slug: '', description: '', isActive: true });
    setOpen(true);
  };

  const handleOpenEdit = (type: IType) => {
    setIsEditing(true); setEditType(type);
    setForm({ name: type.name, slug: type.slug, description: type.description || '', isActive: type.isActive ?? true });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Vui lòng nhập tên và slug'); return;
    }
    try {
      let res, data;
      if (isEditing && editType?._id) {
        res = await fetch(`/api/type/${editType._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        data = await res.json();
        if (data.success) { toast.success('Cập nhật thành công'); fetchTypes(); setOpen(false); }
        else { toast.error(data.message || 'Cập nhật thất bại'); }
      } else {
        res = await fetch('/api/type', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        data = await res.json();
        if (data.success) { toast.success('Tạo thành công'); fetchTypes(); setOpen(false); }
        else { toast.error(data.message || 'Tạo thất bại'); }
      }
    } catch { toast.error('Lỗi server'); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/type/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Xóa thành công'); fetchTypes(); }
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
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Chủ đề bài viết</h1>
          <p className="text-sm text-slate-500 mt-1">{!loading && `${types.length} chủ đề`}</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/20 rounded-xl">
          <Plus className="w-4 h-4 mr-2" />Tạo mới
        </Button>
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
                <Button variant="outline" className="mt-4 rounded-xl" onClick={fetchTypes}>Thử lại</Button>
              </div>
            ) : types.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3"><Tag className="w-5 h-5 text-slate-400" /></div>
                <p className="text-slate-500 font-medium">Chưa có chủ đề nào</p>
                <p className="text-sm text-slate-400 mt-1">Tạo chủ đề mới để bắt đầu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="font-semibold text-slate-600">Tên</TableHead>
                      <TableHead className="font-semibold text-slate-600">Slug</TableHead>
                      <TableHead className="font-semibold text-slate-600">Mô tả</TableHead>
                      <TableHead className="text-center font-semibold text-slate-600">Trạng thái</TableHead>
                      <TableHead className="text-center font-semibold text-slate-600">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {types.map((type) => (
                      <TableRow key={type._id?.toString()} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell className="font-medium text-slate-700">{type.name}</TableCell>
                        <TableCell className="text-sm text-slate-500 font-mono">{type.slug}</TableCell>
                        <TableCell className="text-sm text-slate-600 truncate max-w-xs">{type.description}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            type.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${type.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {type.isActive ? 'Kích hoạt' : 'Tắt'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1.5">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => handleOpenEdit(type)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <AlertDialog open={deleteId === type._id?.toString()} onOpenChange={(open) => !open && setDeleteId(null)}>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => setDeleteId(type._id!.toString())} disabled={deletingId === type._id?.toString()}><Trash2 className="w-3.5 h-3.5" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader><AlertDialogTitle>Xóa chủ đề này?</AlertDialogTitle><AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(type._id!.toString())} className="bg-red-600 hover:bg-red-700 rounded-xl">{deletingId === type._id?.toString() ? 'Đang xóa...' : 'Xóa'}</AlertDialogAction>
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
            <DialogTitle className="text-lg font-bold text-slate-800">{isEditing ? 'Cập nhật Chủ đề' : 'Tạo mới Chủ đề'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">Tên</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Nhập tên" className="mt-1.5 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="slug" className="text-sm font-medium text-slate-700">Slug</Label>
              <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="Nhập slug" className="mt-1.5 rounded-xl font-mono text-sm" />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">Mô tả</Label>
              <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn" className="mt-1.5 rounded-xl" />
            </div>
            <div className="flex items-center space-x-3 py-1">
              <Switch id="isActive" checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
              <Label htmlFor="isActive" className="cursor-pointer text-sm text-slate-700">Kích hoạt</Label>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl">{isEditing ? 'Cập nhật' : 'Tạo mới'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}