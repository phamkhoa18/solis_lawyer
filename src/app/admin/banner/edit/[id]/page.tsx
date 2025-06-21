/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ImageUploader from '@/components/cloudinaryUpload';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Languages } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { IBanner } from '@/lib/types/iBanner';

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [formData, setFormData] = useState<IBanner>({
    image: '',
    name: { en: '', vi: '' },
    description: { en: '', vi: '' },
    buttonText: { en: '', vi: '' },
    link: '',
    isActive: true,
    _id: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [languageDisplay, setLanguageDisplay] = useState<'both' | 'en' | 'vi'>('both');
  const [errors, setErrors] = useState<{ image?: string; nameEn?: string; nameVi?: string }>({});
  const [, setBannerFetched] = useState<IBanner | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof IBanner,
    lang?: 'en' | 'vi'
  ) => {
    if (lang && (field === 'name' || field === 'description' || field === 'buttonText')) {
      setFormData({
        ...formData,
        [field]: {
          ...formData[field] as { en?: string; vi?: string },
          [lang]: e.target.value,
        },
      });
    } else if (!lang) {
      setFormData({ ...formData, [field]: e.target.value });
    }
    if (field === 'image') setErrors(prev => ({ ...prev, image: undefined }));
    if (field === 'name' && lang === 'en') setErrors(prev => ({ ...prev, nameEn: undefined }));
    if (field === 'name' && lang === 'vi') setErrors(prev => ({ ...prev, nameVi: undefined }));
  };

  const handleImageUploadSuccess = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    setErrors(prev => ({ ...prev, image: undefined }));
  };

  const validateForm = () => {
    const newErrors: { image?: string; nameEn?: string; nameVi?: string } = {};
    if (!formData.image) newErrors.image = 'Vui lòng tải lên ảnh banner.';
    if (!formData.name.en) newErrors.nameEn = 'Vui lòng nhập tên (EN).';
    if (!formData.name.vi) newErrors.nameVi = 'Vui lòng nhập tên (VI).';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchBanner = async () => {
    try {
      const res = await fetch(`/api/banners?id=${id}`);
      const data = await res.json();
      if (res.ok && data) {
        setBannerFetched(data);
        setFormData({
          image: data.image || '',
          name: {
            en: data.name?.en || '',
            vi: data.name?.vi || '',
          },
          description: {
            en: data.description?.en || '',
            vi: data.description?.vi || '',
          },
          buttonText: {
            en: data.buttonText?.en || '',
            vi: data.buttonText?.vi || '',
          },
          link: data.link || '',
          isActive: data.isActive ?? true,
          _id: data._id,
          createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        });
      } else {
        toast.error('Không tìm thấy banner');
        router.push('/admin/banners');
      }
    } catch {
      toast.error('Lỗi khi tải banner');
    }
  };

  useEffect(() => {
    if (id) {
      fetchBanner();
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra các trường bắt buộc.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/banners?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: formData.image,
          name: formData.name,
          description: formData.description,
          buttonText: formData.buttonText,
          link: formData.link,
          isActive: formData.isActive,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Cập nhật banner thành công!');
        router.push('/admin/banners');
      } else {
        toast.error(data.error || 'Cập nhật thất bại!');
      }
    } catch {
      toast.error('Lỗi khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Chỉnh sửa Banner</h1>

      <Card className="shadow-md">
        <CardContent className="flex flex-col gap-6 py-6">
          {/* Multilingual Fields with Tooltip Toggle */}
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-lg font-medium">Nội dung đa ngôn ngữ</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={() =>
                      setLanguageDisplay(
                        languageDisplay === 'both'
                          ? 'en'
                          : languageDisplay === 'en'
                          ? 'vi'
                          : 'both'
                      )
                    }
                  >
                    <Languages className="w-5 h-5 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Chuyển đổi hiển thị: {languageDisplay === 'both' ? 'Chỉ EN hoặc VI' : languageDisplay === 'en' ? 'Chỉ VI' : 'Cả EN và VI'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={languageDisplay}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {(languageDisplay === 'both' || languageDisplay === 'en') && (
                <div>
                  <Label htmlFor="nameEn" className="mb-2.5 flex items-center gap-2">
                    Tên (EN)
                    {errors.nameEn && <span className="text-red-500 text-sm">{errors.nameEn}</span>}
                  </Label>
                  <Input
                    id="nameEn"
                    value={formData.name.en}
                    onChange={(e) => handleChange(e, 'name', 'en')}
                    placeholder="Nhập tên banner (EN)"
                    className={errors.nameEn ? 'border-red-500' : ''}
                  />
                </div>
              )}
              {(languageDisplay === 'both' || languageDisplay === 'vi') && (
                <div>
                  <Label htmlFor="nameVi" className="mb-2.5 flex items-center gap-2">
                    Tên (VI)
                    {errors.nameVi && <span className="text-red-500 text-sm">{errors.nameVi}</span>}
                  </Label>
                  <Input
                    id="nameVi"
                    value={formData.name.vi}
                    onChange={(e) => handleChange(e, 'name', 'vi')}
                    placeholder="Nhập tên banner (VI)"
                    className={errors.nameVi ? 'border-red-500' : ''}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`desc-${languageDisplay}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {(languageDisplay === 'both' || languageDisplay === 'en') && (
                <div>
                  <Label htmlFor="descriptionEn" className="mb-2.5">Mô tả (EN)</Label>
                  <Textarea
                    id="descriptionEn"
                    value={formData.description?.en || ''}
                    onChange={(e) => handleChange(e, 'description', 'en')}
                    rows={3}
                    placeholder="Nhập mô tả (EN)"
                  />
                </div>
              )}
              {(languageDisplay === 'both' || languageDisplay === 'vi') && (
                <div>
                  <Label htmlFor="descriptionVi" className="mb-2.5">Mô tả (VI)</Label>
                  <Textarea
                    id="descriptionVi"
                    value={formData.description?.vi || ''}
                    onChange={(e) => handleChange(e, 'description', 'vi')}
                    rows={3}
                    placeholder="Nhập mô tả (VI)"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`btn-${languageDisplay}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {(languageDisplay === 'both' || languageDisplay === 'en') && (
                <div>
                  <Label htmlFor="buttonTextEn" className="mb-2.5">Nút (EN)</Label>
                  <Input
                    id="buttonTextEn"
                    value={formData.buttonText?.en || ''}
                    onChange={(e) => handleChange(e, 'buttonText', 'en')}
                    placeholder="Nhập văn bản nút (EN)"
                  />
                </div>
              )}
              {(languageDisplay === 'both' || languageDisplay === 'vi') && (
                <div>
                  <Label htmlFor="buttonTextVi" className="mb-2.5">Nút (VI)</Label>
                  <Input
                    id="buttonTextVi"
                    value={formData.buttonText?.vi || ''}
                    onChange={(e) => handleChange(e, 'buttonText', 'vi')}
                    placeholder="Nhập văn bản nút (VI)"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div>
            <Label htmlFor="link" className="mb-2.5">Link</Label>
            <Input
              id="link"
              name="link"
              value={formData.link || ''}
              onChange={(e) => handleChange(e, 'link')}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="image" className="mb-2.5 flex items-center gap-2">
              Ảnh Banner
              {errors.image && <span className="text-red-500 text-sm">{errors.image}</span>}
            </Label>
            <ImageUploader onUploadSuccess={handleImageUploadSuccess} initialImage={formData.image} />
            {formData.image && (
              <p className="mt-2 text-sm text-gray-600">
                Ảnh đã chọn:{' '}
                <a href={formData.image} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {formData.image}
                </a>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="isActive">Trạng thái</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <span>{formData.isActive ? 'Hoạt động' : 'Không hoạt động'}</span>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/banner')}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}