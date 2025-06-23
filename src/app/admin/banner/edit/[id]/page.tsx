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
import {IBanner} from '@/lib/types/ibanner' ;
import { ApiResponse } from '@/lib/types/api-response';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

type FormData = Omit<IBanner, '_id' | 'createdAt' | 'updatedAt'>;

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [formData, setFormData] = useState<FormData>({
    image: '',
    name: { en: '', vi: '' },
    description: { en: '', vi: '' },
    buttonText: { en: '', vi: '' },
    link: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [languageDisplay, setLanguageDisplay] = useState<'both' | 'en' | 'vi'>('both');
  const [errors, setErrors] = useState<{
    image?: string;
    nameEn?: string;
    nameVi?: string;
    link?: string;
  }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof FormData,
    lang?: 'en' | 'vi'
  ) => {
    const value = e.target.value;
    setFormData((prev) => {
      if (lang && (field === 'name' || field === 'description' || field === 'buttonText')) {
        return {
          ...prev,
          [field]: {
            ...prev[field] as { en?: string; vi?: string },
            [lang]: value,
          },
        };
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
    if (formData.link && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.link)) {
      newErrors.link = 'Link không hợp lệ.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchBanner = async () => {
    setFetching(true);
    setError(null);
    try {
      const res = await fetch(`/api/banners?id=${id}`);
      const data: ApiResponse<IBanner> = await res.json();
      if (data.success && data.data) {
        setFormData({
          image: data.data.image || '',
          name: {
            en: data.data.name?.en || '',
            vi: data.data.name?.vi || '',
          },
          description: {
            en: data.data.description?.en || '',
            vi: data.data.description?.vi || '',
          },
          buttonText: {
            en: data.data.buttonText?.en || '',
            vi: data.data.buttonText?.vi || '',
          },
          link: data.data.link || '',
          isActive: data.data.isActive ?? true,
        });
      } else {
        setError(data.message || 'Không tìm thấy banner');
        toast.error(data.message || 'Không tìm thấy banner');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi khi tải banner';
      setError(message);
      toast.error(message);
    } finally {
      setFetching(false);
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
        body: JSON.stringify(formData),
      });
      const data: ApiResponse<IBanner> = await res.json();

      if (data.success && data.data) {
        toast.success(data.message || 'Cập nhật banner thành công!');
        router.push('/admin/banner');
      } else {
        if (data.statusCode === 400 && data.message) {
          if (data.message.includes('Image and name')) {
            setErrors({
              image: 'Vui lòng tải lên ảnh banner.',
              nameEn: 'Tên tiếng Anh là bắt buộc.',
              nameVi: 'Tên tiếng Việt là bắt buộc.',
            });
          } else if (data.message.includes('Invalid URL')) {
            setErrors({ link: 'Link không hợp lệ.' });
          } else {
            toast.error(data.message || 'Cập nhật thất bại!');
          }
        } else if (data.statusCode === 404) {
          setError(data.message || 'Banner không tồn tại');
          toast.error(data.message || 'Banner không tồn tại');
        } else {
          toast.error(data.message || 'Cập nhật thất bại!');
        }
      }
    } catch (error: unknown) {
      console.error('Update banner error:', error);
      toast.error(error instanceof Error ? error.message : 'Lỗi khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Chỉnh sửa Banner</h1>

      <Card className="shadow-md">
        <CardContent className="flex flex-col gap-6 py-6">
          {fetching ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-500">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={fetchBanner}
                disabled={loading}
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <>
              {/* Multilingual Fields with Tooltip Toggle */}
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-lg font-medium">Nội dung đa ngôn ngữ</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-1 ${
                          languageDisplay === 'both'
                            ? 'bg-blue-100'
                            : languageDisplay === 'en'
                            ? 'bg-green-100'
                            : 'bg-yellow-100'
                        }`}
                        onClick={() =>
                          setLanguageDisplay(
                            languageDisplay === 'both'
                              ? 'en'
                              : languageDisplay === 'en'
                              ? 'vi'
                              : 'both'
                          )
                        }
                        aria-label={`Chuyển đổi hiển thị ngôn ngữ: ${
                          languageDisplay === 'both' ? 'Cả EN và VI' : languageDisplay === 'en' ? 'Chỉ EN' : 'Chỉ VI'
                        }`}
                      >
                        <Languages className="w-5 h-5 text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Chuyển đổi hiển thị:{' '}
                        {languageDisplay === 'both' ? 'Chỉ EN hoặc VI' : languageDisplay === 'en' ? 'Chỉ VI' : 'Cả EN và VI'}
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
                  exit={{ opacity: 0, height: 0 }}
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
                        aria-describedby={errors.nameEn ? 'nameEn-error' : undefined}
                        disabled={loading}
                      />
                      {errors.nameEn && (
                        <p id="nameEn-error" className="text-red-500 text-sm mt-1">
                          {errors.nameEn}
                        </p>
                      )}
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
                        aria-describedby={errors.nameVi ? 'nameVi-error' : undefined}
                        disabled={loading}
                      />
                      {errors.nameVi && (
                        <p id="nameVi-error" className="text-red-500 text-sm mt-1">
                          {errors.nameVi}
                        </p>
                      )}
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
                      <Label htmlFor="descriptionEn" className="mb-2.5">
                        Mô tả (EN)
                      </Label>
                      <Textarea
                        id="descriptionEn"
                        value={formData.description?.en || ''}
                        onChange={(e) => handleChange(e, 'description', 'en')}
                        rows={3}
                        placeholder="Nhập mô tả (EN)"
                        disabled={loading}
                      />
                    </div>
                  )}
                  {(languageDisplay === 'both' || languageDisplay === 'vi') && (
                    <div>
                      <Label htmlFor="descriptionVi" className="mb-2.5">
                        Mô tả (VI)
                      </Label>
                      <Textarea
                        id="descriptionVi"
                        value={formData.description?.vi || ''}
                        onChange={(e) => handleChange(e, 'description', 'vi')}
                        rows={3}
                        placeholder="Nhập mô tả (VI)"
                        disabled={loading}
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
                      <Label htmlFor="buttonTextEn" className="mb-2.5">
                        Nút (EN)
                      </Label>
                      <Input
                        id="buttonTextEn"
                        value={formData.buttonText?.en || ''}
                        onChange={(e) => handleChange(e, 'buttonText', 'en')}
                        placeholder="Nhập văn bản nút (EN)"
                        disabled={loading}
                      />
                    </div>
                  )}
                  {(languageDisplay === 'both' || languageDisplay === 'vi') && (
                    <div>
                      <Label htmlFor="buttonTextVi" className="mb-2.5">
                        Nút (VI)
                      </Label>
                      <Input
                        id="buttonTextVi"
                        value={formData.buttonText?.vi || ''}
                        onChange={(e) => handleChange(e, 'buttonText', 'vi')}
                        placeholder="Nhập văn bản nút (VI)"
                        disabled={loading}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div>
                <Label htmlFor="link" className="mb-2.5 flex items-center gap-2">
                  Link
                  {errors.link && <span className="text-red-500 text-sm">{errors.link}</span>}
                </Label>
                <Input
                  id="link"
                  name="link"
                  value={formData.link || ''}
                  onChange={(e) => handleChange(e, 'link')}
                  placeholder="https://example.com"
                  className={errors.link ? 'border-red-500' : ''}
                  aria-describedby={errors.link ? 'link-error' : undefined}
                  disabled={loading}
                />
                {errors.link && (
                  <p id="link-error" className="text-red-500 text-sm mt-1">
                    {errors.link}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="image" className="mb-2.5 flex items-center gap-2">
                  Ảnh Banner
                  {errors.image && <span className="text-red-500 text-sm">{errors.image}</span>}
                </Label>
                <ImageUploader
                  onUploadSuccess={handleImageUploadSuccess}
                  initialImage={formData.image}
                />
                {formData.image && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Ảnh đã chọn:</p>
                    <Image
                      src={formData.image}
                      alt="Banner preview"
                      width={200}
                      height={100}
                      className="object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Label htmlFor="isActive">Trạng thái</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                  disabled={loading}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}