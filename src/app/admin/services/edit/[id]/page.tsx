'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ImageUploader from '@/components/cloudinaryUpload';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Languages } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { IService } from '@/lib/types/iservice';
import { ApiResponse } from '@/lib/types/api-response';
import Image from 'next/image';

type FormData = Omit<IService, '_id' | 'createdAt' | 'updatedAt'>;

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<FormData>({
    name: { en: '', vi: '' },
    img: '',
    link: '',
    description: { en: '', vi: '' },
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [languageDisplay, setLanguageDisplay] = useState<'both' | 'en' | 'vi'>('both');
  const [errors, setErrors] = useState<{
    img?: string;
    nameEn?: string;
    nameVi?: string;
    link?: string;
    descriptionEn?: string;
    descriptionVi?: string;
  }>({});

  // Fetch service data on mount
  useEffect(() => {
    const fetchService = async () => {
      if (!id) {
        toast.error('ID dịch vụ không hợp lệ');
        router.push('/admin/services');
        return;
      }

      try {
        const res = await fetch(`/api/services?id=${id}`);
        const data: ApiResponse<IService> = await res.json();
        if (data.success && data.data) {
          setFormData({
            name: { en: data.data.name.en || '', vi: data.data.name.vi || '' },
            img: data.data.img || '',
            link: data.data.link || '',
            description: { en: data.data.description.en || '', vi: data.data.description.vi || '' },
          });
        } else {
          toast.error(data.message || 'Không thể tải dữ liệu dịch vụ');
          router.push('/admin/services');
        }
      } catch (error: unknown) {
        console.error('Fetch service error:', error);
        toast.error(error instanceof Error ? error.message : 'Không thể kết nối tới server');
        router.push('/admin/services');
      } finally {
        setFetching(false);
      }
    };

    fetchService();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof FormData,
    lang?: 'en' | 'vi'
  ) => {
    const value = e.target.value;
    setFormData((prev) => {
      if (lang && (field === 'name' || field === 'description')) {
        return {
          ...prev,
          [field]: {
            ...prev[field] as { en: string; vi: string },
            [lang]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
    // Clear errors for the changed field
    setErrors((prev) => ({
      ...prev,
      ...(field === 'img' && { img: undefined }),
      ...(field === 'name' && lang === 'en' && { nameEn: undefined }),
      ...(field === 'name' && lang === 'vi' && { nameVi: undefined }),
      ...(field === 'link' && { link: undefined }),
      ...(field === 'description' && lang === 'en' && { descriptionEn: undefined }),
      ...(field === 'description' && lang === 'vi' && { descriptionVi: undefined }),
    }));
  };

  const handleImageUploadSuccess = (url: string) => {
    setFormData((prev) => ({ ...prev, img: url }));
    setErrors((prev) => ({ ...prev, img: undefined }));
  };

  const validateForm = () => {
    const newErrors: {
      img?: string;
      nameEn?: string;
      nameVi?: string;
      link?: string;
      descriptionEn?: string;
      descriptionVi?: string;
    } = {};
    if (!formData.img) newErrors.img = 'Vui lòng tải lên ảnh dịch vụ.';
    if (!formData.name.en) newErrors.nameEn = 'Tên tiếng Anh là bắt buộc.';
    if (!formData.name.vi) newErrors.nameVi = 'Tên tiếng Việt là bắt buộc.';
    if (!formData.description.en) newErrors.descriptionEn = 'Mô tả tiếng Anh là bắt buộc.';
    if (!formData.description.vi) newErrors.descriptionVi = 'Mô tả tiếng Việt là bắt buộc.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra các trường bắt buộc.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/services?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<IService> = await res.json();

      if (data.success && data.data) {
        toast.success(data.message || 'Cập nhật dịch vụ thành công!');
        router.push('/admin/services');
      } else {
        // Handle field-specific errors from backend
        if (data.statusCode === 400 && data.message) {
          if (data.message.includes('Both English and Vietnamese names')) {
            setErrors({
              nameEn: 'Tên tiếng Anh là bắt buộc.',
              nameVi: 'Tên tiếng Việt là bắt buộc.',
            });
          } else if (data.message.includes('Both English and Vietnamese descriptions')) {
            setErrors({
              descriptionEn: 'Mô tả tiếng Anh là bắt buộc.',
              descriptionVi: 'Mô tả tiếng Việt là bắt buộc.',
            });
          } else if (data.message.includes('Invalid URL format for image')) {
            setErrors({ img: 'Ảnh không hợp lệ.' });
          } else {
            toast.error(data.message || 'Đã có lỗi xảy ra!');
          }
        } else {
          toast.error(data.message || 'Đã có lỗi xảy ra!');
        }
      }
    } catch (error: unknown) {
      console.error('Update service error:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể kết nối tới server!');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Chỉnh sửa Dịch Vụ</h1>
        <Card>
          <CardContent className="flex flex-col gap-6 py-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tên (EN)</Label>
                  <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
                </div>
                <div>
                  <Label>Tên (VI)</Label>
                  <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mô tả (EN)</Label>
                  <div className="h-20 w-full bg-gray-200 animate-pulse rounded" />
                </div>
                <div>
                  <Label>Mô tả (VI)</Label>
                  <div className="h-20 w-full bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
              <div>
                <Label>Link</Label>
                <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
              </div>
              <div>
                <Label>Ảnh Dịch Vụ</Label>
                <div className="h-40 w-full bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa Dịch Vụ</h1>

      <Card>
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
                    placeholder="Nhập tên dịch vụ (EN)"
                    className={errors.nameEn ? 'border-red-500' : ''}
                    aria-describedby={errors.nameEn ? 'nameEn-error' : undefined}
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
                    placeholder="Nhập tên dịch vụ (VI)"
                    className={errors.nameVi ? 'border-red-500' : ''}
                    aria-describedby={errors.nameVi ? 'nameVi-error' : undefined}
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
                  <Label htmlFor="descriptionEn" className="mb-2.5 flex items-center gap-2">
                    Mô tả (EN)
                    {errors.descriptionEn && (
                      <span className="text-red-500 text-sm">{errors.descriptionEn}</span>
                    )}
                  </Label>
                  <Textarea
                    id="descriptionEn"
                    value={formData.description.en}
                    onChange={(e) => handleChange(e, 'description', 'en')}
                    rows={3}
                    placeholder="Nhập mô tả dịch vụ (EN)"
                    className={errors.descriptionEn ? 'border-red-500' : ''}
                    aria-describedby={errors.descriptionEn ? 'descriptionEn-error' : undefined}
                  />
                  {errors.descriptionEn && (
                    <p id="descriptionEn-error" className="text-red-500 text-sm mt-1">
                      {errors.descriptionEn}
                    </p>
                  )}
                </div>
              )}
              {(languageDisplay === 'both' || languageDisplay === 'vi') && (
                <div>
                  <Label htmlFor="descriptionVi" className="mb-2.5 flex items-center gap-2">
                    Mô tả (VI)
                    {errors.descriptionVi && (
                      <span className="text-red-500 text-sm">{errors.descriptionVi}</span>
                    )}
                  </Label>
                  <Textarea
                    id="descriptionVi"
                    value={formData.description.vi}
                    onChange={(e) => handleChange(e, 'description', 'vi')}
                    rows={3}
                    placeholder="Nhập mô tả dịch vụ (VI)"
                    className={errors.descriptionVi ? 'border-red-500' : ''}
                    aria-describedby={errors.descriptionVi ? 'descriptionVi-error' : undefined}
                  />
                  {errors.descriptionVi && (
                    <p id="descriptionVi-error" className="text-red-500 text-sm mt-1">
                      {errors.descriptionVi}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Common Fields */}
          <div>
            <Label htmlFor="link" className="mb-2.5 flex items-center gap-2">
              Link (Tùy chọn)
              {errors.link && <span className="text-red-500 text-sm">{errors.link}</span>}
            </Label>
            <Input
              id="link"
              name="link"
              value={formData.link}
              onChange={(e) => handleChange(e, 'link')}
              placeholder="/service/... hoặc bất kỳ liên kết nào (không bắt buộc)"
              className={errors.link ? 'border-red-500' : ''}
              aria-describedby={errors.link ? 'link-error' : undefined}
            />
            {errors.link && (
              <p id="link-error" className="text-red-500 text-sm mt-1">
                {errors.link}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="img" className="mb-2.5 flex items-center gap-2">
              Ảnh Dịch Vụ
              {errors.img && <span className="text-red-500 text-sm">{errors.img}</span>}
            </Label>
            <ImageUploader onUploadSuccess={handleImageUploadSuccess} />
            {formData.img && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                <Image
                  src={formData.img}
                  alt="Service preview"
                  width={200}
                  height={100}
                  className="object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/services')}
              disabled={loading || fetching}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={loading || fetching}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật Dịch Vụ'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}