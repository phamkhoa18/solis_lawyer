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
import { ITestimonial } from '@/lib/types/itestimonial';
import { ApiResponse } from '@/lib/types/api-response';
import Image from 'next/image';

// Explicitly define TestimonialFormData to avoid issues with Omit and Document
type TestimonialFormData = {
  name: { en: string; vi: string };
  image: string;
  content: { en: string; vi: string };
};

export default function EditTestimonialPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<TestimonialFormData>({
    name: { en: '', vi: '' },
    image: '',
    content: { en: '', vi: '' },
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [languageDisplay, setLanguageDisplay] = useState<'both' | 'en' | 'vi'>('both');
  const [errors, setErrors] = useState<{
    image?: string;
    nameEn?: string;
    nameVi?: string;
    contentEn?: string;
    contentVi?: string;
  }>({});

  // Fetch testimonial data by ID
  useEffect(() => {
    const fetchTestimonial = async () => {
      if (!id) {
        toast.error('ID lời chứng thực không hợp lệ.');
        router.push('/admin/testimonials');
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/testimonials?id=${id}`);
        const data: ApiResponse<ITestimonial> = await res.json();

        if (data.success && data.data) {
          setFormData({
            name: { en: data.data.name.en, vi: data.data.name.vi },
            image: data.data.image,
            content: { en: data.data.content.en, vi: data.data.content.vi },
          });
        } else {
          toast.error(data.message || 'Không thể tải lời chứng thực.');
          router.push('/admin/testimonials');
        }
      } catch (error: unknown) {
        console.error('Fetch testimonial error:', error);
        toast.error(error instanceof Error ? error.message : 'Không thể kết nối tới server!');
        router.push('/admin/testimonials');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonial();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof TestimonialFormData,
    lang?: 'en' | 'vi'
  ) => {
    const value = e.target.value;
    setFormData((prev) => {
      if (lang && (field === 'name' || field === 'content')) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [lang]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
    // Clear errors for the changed field
    setErrors((prev) => ({
      ...prev,
      ...(field === 'image' && { image: undefined }),
      ...(field === 'name' && lang === 'en' && { nameEn: undefined }),
      ...(field === 'name' && lang === 'vi' && { nameVi: undefined }),
      ...(field === 'content' && lang === 'en' && { contentEn: undefined }),
      ...(field === 'content' && lang === 'vi' && { contentVi: undefined }),
    }));
  };

  const handleImageUploadSuccess = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const validateForm = () => {
    const newErrors: {
      image?: string;
      nameEn?: string;
      nameVi?: string;
      contentEn?: string;
      contentVi?: string;
    } = {};
    if (!formData.image) newErrors.image = 'Vui lòng tải lên ảnh.';
    if (!formData.name.en) newErrors.nameEn = 'Tên tiếng Anh là bắt buộc.';
    if (!formData.name.vi) newErrors.nameVi = 'Tên tiếng Việt là bắt buộc.';
    if (!formData.content.en) newErrors.contentEn = 'Nội dung tiếng Anh là bắt buộc.';
    if (!formData.content.vi) newErrors.contentVi = 'Nội dung tiếng Việt là bắt buộc.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra các trường bắt buộc.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/testimonials?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<ITestimonial> = await res.json();

      if (data.success && data.data) {
        toast.success(data.message || 'Cập nhật lời chứng thực thành công!');
        router.push('/admin/testimonials');
      } else {
        // Handle field-specific errors from backend
        if (data.statusCode === 400 && data.message) {
          if (data.message.includes('Both English and Vietnamese names are required')) {
            setErrors({
              nameEn: 'Tên tiếng Anh là bắt buộc.',
              nameVi: 'Tên tiếng Việt là bắt buộc.',
            });
          } else if (data.message.includes('Both English and Vietnamese content are required')) {
            setErrors({
              contentEn: 'Nội dung tiếng Anh là bắt buộc.',
              contentVi: 'Nội dung tiếng Việt là bắt buộc.',
            });
          } else if (data.message.includes('Invalid URL format for image')) {
            setErrors({ image: 'Ảnh không hợp lệ.' });
          } else {
            toast.error(data.message || 'Đã có lỗi xảy ra!');
          }
        } else {
          toast.error(data.message || 'Đã có lỗi xảy ra!');
        }
      }
    } catch (error: unknown) {
      console.error('Update testimonial error:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể kết nối tới server!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa Lời Chứng Thực</h1>

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
                    placeholder="Nhập tên người chứng thực (EN)"
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
                    placeholder="Nhập tên người chứng thực (VI)"
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
              key={`content-${languageDisplay}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {(languageDisplay === 'both' || languageDisplay === 'en') && (
                <div>
                  <Label htmlFor="contentEn" className="mb-2.5 flex items-center gap-2">
                    Nội dung (EN)
                    {errors.contentEn && (
                      <span className="text-red-500 text-sm">{errors.contentEn}</span>
                    )}
                  </Label>
                  <Textarea
                    id="contentEn"
                    value={formData.content?.en || ''}
                    onChange={(e) => handleChange(e, 'content', 'en')}
                    rows={3}
                    placeholder="Nhập nội dung lời chứng thực (EN)"
                    className={errors.contentEn ? 'border-red-500' : ''}
                    aria-describedby={errors.contentEn ? 'contentEn-error' : undefined}
                  />
                  {errors.contentEn && (
                    <p id="contentEn-error" className="text-red-500 text-sm mt-1">
                      {errors.contentEn}
                    </p>
                  )}
                </div>
              )}
              {(languageDisplay === 'both' || languageDisplay === 'vi') && (
                <div>
                  <Label htmlFor="contentVi" className="mb-2.5 flex items-center gap-2">
                    Nội dung (VI)
                    {errors.contentVi && (
                      <span className="text-red-500 text-sm">{errors.contentVi}</span>
                    )}
                  </Label>
                  <Textarea
                    id="contentVi"
                    value={formData.content?.vi || ''}
                    onChange={(e) => handleChange(e, 'content', 'vi')}
                    rows={3}
                    placeholder="Nhập nội dung lời chứng thực (VI)"
                    className={errors.contentVi ? 'border-red-500' : ''}
                    aria-describedby={errors.contentVi ? 'contentVi-error' : undefined}
                  />
                  {errors.contentVi && (
                    <p id="contentVi-error" className="text-red-500 text-sm mt-1">
                      {errors.contentVi}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Common Fields */}
          <div>
            <Label htmlFor="image" className="mb-2.5 flex items-center gap-2">
              Ảnh Người Chứng Thực
              {errors.image && <span className="text-red-500 text-sm">{errors.image}</span>}
            </Label>
            <ImageUploader
              onUploadSuccess={handleImageUploadSuccess}
            />
            {formData.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Ảnh đã chọn:</p>
                <Image
                  src={formData.image}
                  alt="Testimonial preview"
                  width={100}
                  height={100}
                  className="object-cover rounded-full"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/testimonials')}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Cập nhật Lời Chứng Thực'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}