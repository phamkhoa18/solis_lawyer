'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/cloudinaryUpload';
import { Switch } from '@/components/ui/switch';
import { Loader2, Globe, ImageIcon, ArrowLeft, Link as LinkIcon, Type } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { IBanner } from '@/lib/types/ibanner';
import { ApiResponse } from '@/lib/types/api-response';
import Image from 'next/image';
import Link from 'next/link';

type FormData = Omit<IBanner, '_id' | 'createdAt' | 'updatedAt'>;

export default function CreateBannerPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [formData, setFormData] = useState<FormData>({
    image: '', name: { en: '', vi: '' }, description: { en: '', vi: '' }, buttonText: { en: '', vi: '' }, link: '', isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ image?: string; nameEn?: string; nameVi?: string; link?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof FormData, lang?: 'en' | 'vi') => {
    const value = e.target.value;
    setFormData((prev) => {
      if (lang && (field === 'name' || field === 'description' || field === 'buttonText')) {
        return { ...prev, [field]: { ...prev[field] as { en?: string; vi?: string }, [lang]: value } };
      }
      return { ...prev, [field]: value };
    });
    setErrors((prev) => ({
      ...prev,
      ...(field === 'image' && { image: undefined }),
      ...(field === 'name' && lang === 'en' && { nameEn: undefined }),
      ...(field === 'name' && lang === 'vi' && { nameVi: undefined }),
      ...(field === 'link' && { link: undefined }),
    }));
  };

  const handleImageUploadSuccess = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const validateForm = () => {
    const newErrors: { image?: string; nameEn?: string; nameVi?: string; link?: string } = {};
    if (!formData.image) newErrors.image = 'Vui lòng tải lên ảnh banner.';
    if (!formData.name.en) newErrors.nameEn = 'Tên tiếng Anh là bắt buộc.';
    if (!formData.name.vi) newErrors.nameVi = 'Tên tiếng Việt là bắt buộc.';
    if (formData.link && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.link)) newErrors.link = 'Link không hợp lệ.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) { toast.error('Vui lòng kiểm tra các trường bắt buộc.'); return; }
    try {
      setLoading(true);
      const res = await fetch('/api/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data: ApiResponse<IBanner> = await res.json();
      if (data.success && data.data) { toast.success(data.message || 'Tạo banner thành công!'); router.push('/admin/banner'); }
      else toast.error(data.message || 'Đã có lỗi xảy ra!');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Không thể kết nối tới server!');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/banner">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-[#9b6f45]"><ArrowLeft className="w-4 h-4 mr-1" />Quay lại</Button>
          </Link>
          <div className="w-px h-6 bg-slate-200" />
          <h1 className="text-xl font-bold text-slate-800">Tạo Banner mới</h1>
        </div>
      </div>

      {/* Language Toggle */}
      <div className="flex gap-1 bg-slate-100 rounded-md p-0.5 w-fit">
        {(['vi', 'en'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${language === lang ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {lang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
          </button>
        ))}
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Name & Description */}
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">Nội dung — {language === 'vi' ? 'Tiếng Việt' : 'English'}</h2>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={language} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }} className="space-y-4">
                <div>
                  <Label className="text-sm text-slate-600">Tên Banner ({language.toUpperCase()}) <span className="text-red-500">*</span></Label>
                  <Input
                    value={language === 'vi' ? formData.name.vi : formData.name.en}
                    onChange={(e) => handleChange(e, 'name', language)}
                    placeholder={`Nhập tên banner (${language.toUpperCase()})`}
                    className={`mt-1.5 ${(language === 'en' ? errors.nameEn : errors.nameVi) ? 'border-red-400' : ''}`}
                  />
                  {(language === 'en' ? errors.nameEn : errors.nameVi) && <p className="text-red-500 text-xs mt-1">{language === 'en' ? errors.nameEn : errors.nameVi}</p>}
                </div>

                <div>
                  <Label className="text-sm text-slate-600">Mô tả ({language.toUpperCase()})</Label>
                  <Textarea
                    value={language === 'vi' ? (formData.description?.vi || '') : (formData.description?.en || '')}
                    onChange={(e) => handleChange(e, 'description', language)}
                    rows={3}
                    placeholder={`Nhập mô tả (${language.toUpperCase()})`}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="text-sm text-slate-600">Nút ({language.toUpperCase()})</Label>
                  <Input
                    value={language === 'vi' ? (formData.buttonText?.vi || '') : (formData.buttonText?.en || '')}
                    onChange={(e) => handleChange(e, 'buttonText', language)}
                    placeholder={`Nhập văn bản nút (${language.toUpperCase()})`}
                    className="mt-1.5"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Link */}
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <LinkIcon className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">Liên kết</h2>
            </div>
            <div>
              <Label className="text-sm text-slate-600">URL Link</Label>
              <Input
                value={formData.link || ''}
                onChange={(e) => handleChange(e, 'link')}
                placeholder="https://example.com"
                className={`mt-1.5 ${errors.link ? 'border-red-400' : ''}`}
              />
              {errors.link && <p className="text-red-500 text-xs mt-1">{errors.link}</p>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">Cài đặt</h2>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="isActive" className="text-sm text-slate-600 cursor-pointer">Trạng thái</Label>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${formData.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {formData.isActive ? 'Hoạt động' : 'Tắt'}
                </span>
                <Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))} />
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] hover:from-[#c9a060] hover:to-[#8a6340] text-white">
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {loading ? 'Đang lưu...' : 'Tạo Banner'}
              </Button>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">Ảnh Banner <span className="text-red-500">*</span></h2>
            </div>
            {errors.image && <p className="text-red-500 text-xs">{errors.image}</p>}
            <ImageUploader onUploadSuccess={handleImageUploadSuccess} />
            {formData.image && (
              <div className="mt-3 relative w-full aspect-video rounded-md overflow-hidden border border-slate-100">
                <Image src={formData.image} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}