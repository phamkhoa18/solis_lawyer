'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import toast from 'react-hot-toast';
import {
  Pencil, Trash2, Search, UserPlus, Shield, ShieldCheck, ShieldAlert,
  Mail, Eye, EyeOff, RefreshCw, Users,
} from 'lucide-react';
import { useDebounce } from 'use-debounce';

interface IUser {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'author';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'author';
  isActive: boolean;
}

const ROLE_MAP: Record<string, { label: string; icon: typeof Shield; color: string; bg: string }> = {
  admin: { label: 'Quản trị viên', icon: ShieldAlert, color: 'text-amber-700', bg: 'bg-amber-50' },
  editor: { label: 'Biên tập viên', icon: ShieldCheck, color: 'text-blue-700', bg: 'bg-blue-50' },
  author: { label: 'Tác giả', icon: Shield, color: 'text-slate-600', bg: 'bg-slate-50' },
};

export default function AccountsPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUser, setEditUser] = useState<IUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState<UserForm>({
    name: '', email: '', password: '', role: 'admin', isActive: true,
  });

  const fetchUsers = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
      else { setError('Không tải được danh sách'); toast.error('Không tải được danh sách'); }
    } catch {
      setError('Lỗi kết nối server'); toast.error('Lỗi kết nối server');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      ROLE_MAP[u.role]?.label.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleOpenCreate = () => {
    setIsEditing(false); setEditUser(null); setShowPassword(false);
    setForm({ name: '', email: '', password: '', role: 'admin', isActive: true });
    setOpen(true);
  };

  const handleOpenEdit = (user: IUser) => {
    setIsEditing(true); setEditUser(user); setShowPassword(false);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, isActive: user.isActive });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Vui lòng nhập đầy đủ tên và email'); return;
    }
    if (!isEditing && !form.password.trim()) {
      toast.error('Vui lòng nhập mật khẩu'); return;
    }

    setSubmitting(true);
    try {
      let res, data;
      if (isEditing && editUser?._id) {
        const body: Record<string, unknown> = { name: form.name, email: form.email, role: form.role, isActive: form.isActive };
        if (form.password.trim()) body.password = form.password;
        res = await fetch(`/api/users?id=${editUser._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        data = await res.json();
        if (data.success) { toast.success('Cập nhật thành công'); fetchUsers(); setOpen(false); }
        else toast.error(data.message || 'Cập nhật thất bại');
      } else {
        res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        data = await res.json();
        if (data.success) { toast.success('Tạo tài khoản thành công'); fetchUsers(); setOpen(false); }
        else toast.error(data.message || 'Tạo thất bại');
      }
    } catch { toast.error('Lỗi server'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Xóa thành công'); fetchUsers(); }
      else toast.error(data.message || 'Xóa thất bại');
    } catch { toast.error('Lỗi server'); }
    finally { setDeletingId(null); setDeleteId(null); }
  };

  const handleToggleActive = async (user: IUser) => {
    try {
      const res = await fetch(`/api/users?id=${user._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json();
      if (data.success) { toast.success(user.isActive ? 'Đã vô hiệu hóa' : 'Đã kích hoạt'); fetchUsers(); }
      else toast.error(data.message || 'Thao tác thất bại');
    } catch { toast.error('Lỗi server'); }
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    admin: users.filter((u) => u.role === 'admin').length,
    editor: users.filter((u) => u.role === 'editor').length,
  };

  const v = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const iv = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <motion.div className="space-y-6" variants={v} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={iv} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Tài khoản</h1>
          <p className="text-sm text-slate-500 mt-1">{!loading && `${users.length} tài khoản`}</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] hover:from-[#c9a060] hover:to-[#8a6340] text-white shadow-sm">
          <UserPlus className="w-4 h-4 mr-2" />Tạo tài khoản
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={iv} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng tài khoản', value: stats.total, color: '#9b6f45' },
          { label: 'Đang hoạt động', value: stats.active, color: '#059669' },
          { label: 'Quản trị viên', value: stats.admin, color: '#d5aa6d' },
          { label: 'Biên tập viên', value: stats.editor, color: '#3b82f6' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg shadow-sm p-4">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: s.color }} />
            <p className="text-xs text-slate-500 uppercase tracking-wide">{s.label}</p>
            {loading ? <Skeleton className="h-7 w-10 mt-1" /> : <p className="text-xl font-bold text-slate-800 mt-1">{s.value}</p>}
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={iv} className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Tìm theo tên, email hoặc vai trò..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 border-slate-200 focus:border-amber-300 focus:ring-amber-200/30"
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={iv}>
        <Card className="shadow-sm border-0 rounded-lg overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3"><RefreshCw className="w-5 h-5 text-red-500" /></div>
                <p className="text-red-500 font-medium">{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchUsers}>Thử lại</Button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3"><Users className="w-5 h-5 text-slate-400" /></div>
                <p className="text-slate-500 font-medium">Không có tài khoản nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Người dùng</TableHead>
                      <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</TableHead>
                      <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Vai trò</TableHead>
                      <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Trạng thái</TableHead>
                      <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ngày tạo</TableHead>
                      <TableHead className="text-center text-xs font-medium text-slate-500 uppercase tracking-wide">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const role = ROLE_MAP[user.role];
                      const RoleIcon = role?.icon || Shield;
                      return (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d5aa6d] to-[#9b6f45] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                              <span className="font-medium text-slate-700 text-sm">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm text-slate-500">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${role?.bg} ${role?.color}`}>
                              <RoleIcon className="w-3 h-3" />
                              {role?.label || user.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            <button onClick={() => handleToggleActive(user)} className="cursor-pointer">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {user.isActive ? 'Hoạt động' : 'Vô hiệu'}
                              </span>
                            </button>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-[#9b6f45] hover:bg-amber-50" onClick={() => handleOpenEdit(user)}><Pencil className="w-3.5 h-3.5" /></Button>
                              <AlertDialog open={deleteId === user._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(user._id)} disabled={deletingId === user._id}><Trash2 className="w-3.5 h-3.5" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Xóa tài khoản này?</AlertDialogTitle>
                                    <AlertDialogDescription>Tài khoản <strong>{user.name}</strong> ({user.email}) sẽ bị xóa vĩnh viễn.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(user._id)} className="bg-red-600 hover:bg-red-700">{deletingId === user._id ? 'Đang xóa...' : 'Xóa'}</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">{isEditing ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">{isEditing ? 'Cập nhật thông tin tài khoản' : 'Thêm người dùng mới vào hệ thống'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm text-slate-600">Họ tên <span className="text-red-500">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nhập họ tên" required className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm text-slate-600">Email <span className="text-red-500">*</span></Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" required className="pl-9" type="email" />
              </div>
            </div>
            <div>
              <Label className="text-sm text-slate-600">
                Mật khẩu {!isEditing && <span className="text-red-500">*</span>}
                {isEditing && <span className="text-slate-400 text-xs ml-1">(để trống nếu không đổi)</span>}
              </Label>
              <div className="relative mt-1.5">
                <Input
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={isEditing ? '••••••••' : 'Nhập mật khẩu'}
                  required={!isEditing}
                  className="pr-10"
                  type={showPassword ? 'text' : 'password'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-sm text-slate-600">Vai trò</Label>
              <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value as 'admin' | 'editor' | 'author' })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Quản trị viên</span>
                  </SelectItem>
                  <SelectItem value="editor">
                    <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Biên tập viên</span>
                  </SelectItem>
                  <SelectItem value="author">
                    <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-slate-500" /> Tác giả</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between py-1">
              <Label htmlFor="userActive" className="cursor-pointer text-sm text-slate-600">Kích hoạt</Label>
              <Switch id="userActive" checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] hover:from-[#c9a060] hover:to-[#8a6340]">
                {submitting ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Tạo tài khoản'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
