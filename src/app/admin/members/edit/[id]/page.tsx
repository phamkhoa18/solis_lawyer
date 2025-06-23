'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import ImageUploader from '@/components/cloudinaryUpload';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Languages } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { IMember } from '@/lib/types/imember';
import { ApiResponse } from '@/lib/types/api-response';
import Image from 'next/image';

// Explicitly define MemberFormData to avoid issues with Omit and Document
type MemberFormData = {
  name: { en: string; vi: string };
  position: { en: string; vi: string };
  image: string;
  socialLinks: { facebook?: string; twitter?: string; linkedin?: string; instagram?: string };
  isActive: boolean;
};

export default function EditMemberPage() {
  const router = useRouter();
  const { id } = useParams(); // Get member ID from URL

  const [formData, setFormData] = useState<MemberFormData>({
    name: { en: '', vi: '' },
    position: { en: '', vi: '' },
    image: '',
    socialLinks: { facebook: '', twitter: '', linkedin: '', instagram: '' },
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [languageDisplay, setLanguageDisplay] = useState<'both' | 'en' | 'vi'>('both');
  const [errors, setErrors] = useState<{
    image?: string;
    nameEn?: string;
    nameVi?: string;
    positionEn?: string;
    positionVi?: string;
    socialLinks?: string;
  }>({});

  // Fetch member data on mount
  useEffect(() => {
    const fetchMember = async () => {
      if (!id) {
        toast.error('ID thành viên không hợp lệ');
        router.push('/admin/members');
        return;
      }
      try {
        setFetching(true);
        const res = await fetch(`/api/members?id=${id}`);
        const data: ApiResponse<IMember> = await res.json();
        if (data.success && data.data) {
          setFormData({
            name: { en: data.data.name.en, vi: data.data.name.vi },
            position: { en: data.data.position.en, vi: data.data.position.vi },
            image: data.data.image,
            socialLinks: {
              facebook: data.data.socialLinks?.facebook || '',
              twitter: data.data.socialLinks?.twitter || '',
              linkedin: data.data.socialLinks?.linkedin || '',
              instagram: data.data.socialLinks?.instagram || '',
            },
            isActive: data.data.isActive,
          });
        } else {
          toast.error(data.message || 'Không thể tải thông tin thành viên');
          router.push('/admin/members');
        }
      } catch (error: unknown) {
        console.error('Fetch member error:', error);
        toast.error(error instanceof Error ? error.message : 'Không thể kết nối tới server');
        router.push('/admin/members');
      } finally {
        setFetching(false);
      }
    };
    fetchMember();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof MemberFormData,
    lang?: 'en' | 'vi',
    socialLinkKey?: keyof MemberFormData['socialLinks']
  ) => {
    const value = e.target.value;
    setFormData((prev) => {
      if (lang && (field === 'name' || field === 'position')) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [lang]: value,
          },
        };
      }
      if (field === 'socialLinks' && socialLinkKey) {
        return {
          ...prev,
          socialLinks: {
            ...prev.socialLinks,
            [socialLinkKey]: value,
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
      ...(field === 'position' && lang === 'en' && { positionEn: undefined }),
      ...(field === 'position' && lang === 'vi' && { positionVi: undefined }),
      ...(field === 'socialLinks' && { socialLinks: undefined }),
    }));
  };

  const handleToggleActive = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
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
      positionEn?: string;
      positionVi?: string;
      socialLinks?: string;
    } = {};
    if (!formData.image) newErrors.image = 'Vui lòng tải lên ảnh.';
    if (!formData.name.en) newErrors.nameEn = 'Tên tiếng Anh là bắt buộc.';
    if (!formData.name.vi) newErrors.nameVi = 'Tên tiếng Việt là bắt buộc.';
    if (!formData.position.en) newErrors.positionEn = 'Chức vụ tiếng Anh là bắt buộc.';
    if (!formData.position.vi) newErrors.positionVi = 'Chức vụ tiếng Việt là bắt buộc.';
    // Validate social links URLs if provided
    for (const [key, url] of Object.entries(formData.socialLinks)) {
      if (url && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(url)) {
        newErrors.socialLinks = `Liên kết ${key} không hợp lệ.`;
        break;
      }
    }
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
      const res = await fetch(`/api/members?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<IMember> = await res.json();

      if (data.success && data.data) {
        toast.success(data.message || 'Cập nhật thành viên thành công!');
        router.push('/admin/members');
      } else {
        // Handle field-specific errors from backend
        if (data.statusCode === 400 && data.message) {
          if (data.message.includes('Both English and Vietnamese names')) {
            setErrors({ nameEn: 'Tên tiếng Anh là bắt buộc.', nameVi: 'Tên tiếng Việt là bắt buộc.' });
          } else if (data.message.includes('Both English and Vietnamese positions')) {
            setErrors({ positionEn: 'Chức vụ tiếng Anh là bắt buộc.', positionVi: 'Chức vụ tiếng Việt là bắt buộc.' });
          } else if (data.message.includes('Invalid URL format for image')) {
            setErrors({ image: 'Ảnh không hợp lệ.' });
          } else if (data.message.includes('Invalid URL format for socialLinks')) {
            setErrors({ socialLinks: 'Liên kết mạng xã hội không hợp lệ.' });
          } else {
            toast.error(data.message || 'Đã có lỗi xảy ra!');
          }
        } else {
          toast.error(data.message || 'Đã có lỗi xảy ra!');
        }
      }
    } catch (error: unknown) {
      console.error('Update member error:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể kết nối tới server!');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container mx-auto flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa Thành viên</h1>

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
                    placeholder="Nhập tên thành viên (EN)"
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
                    placeholder="Nhập tên thành viên (VI)"
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
              key={`position-${languageDisplay}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {(languageDisplay === 'both' || languageDisplay === 'en') && (
                <div>
                  <Label htmlFor="positionEn" className="mb-2.5 flex items-center gap-2">
                    Chức vụ (EN)
                    {errors.positionEn && <span className="text-red-500 text-sm">{errors.positionEn}</span>}
                  </Label>
                  <Input
                    id="positionEn"
                    value={formData.position.en}
                    onChange={(e) => handleChange(e, 'position', 'en')}
                    placeholder="Nhập chức vụ (EN)"
                    className={errors.positionEn ? 'border-red-500' : ''}
                    aria-describedby={errors.positionEn ? 'positionEn-error' : undefined}
                  />
                  {errors.positionEn && (
                    <p id="positionEn-error" className="text-red-500 text-sm mt-1">
                      {errors.positionEn}
                    </p>
                  )}
                </div>
              )}
              {(languageDisplay === 'both' || languageDisplay === 'vi') && (
                <div>
                  <Label htmlFor="positionVi" className="mb-2.5 flex items-center gap-2">
                    Chức vụ (VI)
                    {errors.positionVi && <span className="text-red-500 text-sm">{errors.positionVi}</span>}
                  </Label>
                  <Input
                    id="positionVi"
                    value={formData.position.vi}
                    onChange={(e) => handleChange(e, 'position', 'vi')}
                    placeholder="Nhập chức vụ (VI)"
                    className={errors.positionVi ? 'border-red-500' : ''}
                    aria-describedby={errors.positionVi ? 'positionVi-error' : undefined}
                  />
                  {errors.positionVi && (
                    <p id="positionVi-error" className="text-red-500 text-sm mt-1">
                      {errors.positionVi}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Social Links */}
          <div>
            <Label className="mb-2.5 flex items-center gap-2">
              Liên kết Mạng Xã hội
              {errors.socialLinks && <span className="text-red-500 text-sm">{errors.socialLinks}</span>}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook" className="mb-1 text-sm">
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  value={formData.socialLinks.facebook || ''}
                  onChange={(e) => handleChange(e, 'socialLinks', undefined, 'facebook')}
                  placeholder="Nhập URL Facebook"
                />
              </div>
              <div>
                <Label htmlFor="twitter" className="mb-1 text-sm">
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  value={formData.socialLinks.twitter || ''}
                  onChange={(e) => handleChange(e, 'socialLinks', undefined, 'twitter')}
                  placeholder="Nhập URL Twitter"
                />
              </div>
              <div>
                <Label htmlFor="linkedin" className="mb-1 text-sm">
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={formData.socialLinks.linkedin || ''}
                  onChange={(e) => handleChange(e, 'socialLinks', undefined, 'linkedin')}
                  placeholder="Nhập URL LinkedIn"
                />
              </div>
              <div>
                <Label htmlFor="instagram" className="mb-1 text-sm">
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={formData.socialLinks.instagram || ''}
                  onChange={(e) => handleChange(e, 'socialLinks', undefined, 'instagram')}
                  placeholder="Nhập URL Instagram"
                />
              </div>
            </div>
            {errors.socialLinks && (
              <p id="socialLinks-error" className="text-red-500 text-sm mt-1">
                {errors.socialLinks}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <Label htmlFor="image" className="mb-2.5 flex items-center gap-2">
              Ảnh Thành viên
              {errors.image && <span className="text-red-500 text-sm">{errors.image}</span>}
            </Label>
            <ImageUploader onUploadSuccess={handleImageUploadSuccess} />
            {formData.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                <Image
                  src={formData.image}
                  alt="Member preview"
                  width={100}
                  height={100}
                  className="object-cover rounded-full"
                />
              </div>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-4">
            <Label htmlFor="isActive" className="text-sm font-medium">
              Trạng thái
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleToggleActive}
              aria-label="Kích hoạt thành viên"
            />
            <span className="text-sm text-gray-600">
              {formData.isActive ? 'Kích hoạt' : 'Không kích hoạt'}
            </span>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/members')}
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
                'Cập nhật Thành viên'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}