'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ImageUploader from '@/components/cloudinaryUpload';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Languages, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { IService } from '@/lib/types/iservice';
import { IMember } from '@/lib/types/imember';
import { ApiResponse } from '@/lib/types/api-response';
import Image from 'next/image';

type FormData = Omit<IService, '_id' | 'createdAt' | 'updatedAt'>;

export default function CreateServicePage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: { en: '', vi: '' },
    img: '',
    icon: '',
    link: '',
    description: { en: '', vi: '' },
    benefits: { en: [], vi: [] },
    team: [],
  });

  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<IMember[]>([]);
  const [languageDisplay, setLanguageDisplay] = useState<'both' | 'en' | 'vi'>('both');
  
  // States for benefits textareas (newline separated)
  const [benefitsTextEn, setBenefitsTextEn] = useState('');
  const [benefitsTextVi, setBenefitsTextVi] = useState('');

  const [errors, setErrors] = useState<{
    img?: string;
    nameEn?: string;
    nameVi?: string;
    link?: string;
    descriptionEn?: string;
    descriptionVi?: string;
  }>({});

  useEffect(() => {
    // Fetch members for team selection
    const fetchMembers = async () => {
      try {
        const res = await fetch('/api/members');
        const data = await res.json();
        if (data.success) {
          setMembers(data.data);
        }
      } catch (error) {
        console.error('Error fetching members', error);
      }
    };
    fetchMembers();
  }, []);

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
            ...prev[field] as { en?: string; vi?: string },
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

  const handleIconUploadSuccess = (url: string) => {
    setFormData((prev) => ({ ...prev, icon: url }));
  };

  const toggleTeamMember = (id: string) => {
    setFormData((prev) => {
      const team = (prev.team || []) as string[];
      if (team.includes(id)) {
        return { ...prev, team: team.filter((mId) => mId !== id) };
      }
      return { ...prev, team: [...team, id] };
    });
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

    // Process benefits before submitting
    const finalFormData = {
      ...formData,
      benefits: {
        en: benefitsTextEn.split('\n').filter((b) => b.trim() !== ''),
        vi: benefitsTextVi.split('\n').filter((b) => b.trim() !== ''),
      },
    };

    try {
      setLoading(true);
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalFormData),
      });

      const data: ApiResponse<IService> = await res.json();

      if (data.success && data.data) {
        toast.success(data.message || 'Tạo dịch vụ thành công!');
        router.push('/admin/services');
      } else {
        if (data.statusCode === 400 && data.message) {
          if (data.message.includes('Name (en, vi), image, and description')) {
            setErrors({
              img: 'Vui lòng tải lên ảnh dịch vụ.',
              nameEn: 'Tên tiếng Anh là bắt buộc.',
              nameVi: 'Tên tiếng Việt là bắt buộc.',
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
      console.error('Create service error:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể kết nối tới server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tạo Dịch Vụ Mới</h1>

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
                    value={formData.description?.en || ''}
                    onChange={(e) => handleChange(e, 'description', 'en')}
                    rows={3}
                    placeholder="Nhập mô tả dịch vụ (EN)"
                    className={errors.descriptionEn ? 'border-red-500' : ''}
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
                    value={formData.description?.vi || ''}
                    onChange={(e) => handleChange(e, 'description', 'vi')}
                    rows={3}
                    placeholder="Nhập mô tả dịch vụ (VI)"
                    className={errors.descriptionVi ? 'border-red-500' : ''}
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

          {/* Benefits Section */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`bene-${languageDisplay}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {(languageDisplay === 'both' || languageDisplay === 'en') && (
                <div>
                  <Label className="mb-2.5 flex items-center gap-2">
                    Lợi ích (EN) - Mỗi dòng 1 lợi ích
                  </Label>
                  <Textarea
                    value={benefitsTextEn}
                    onChange={(e) => setBenefitsTextEn(e.target.value)}
                    rows={4}
                    placeholder="Benefit 1&#10;Benefit 2"
                  />
                </div>
              )}
              {(languageDisplay === 'both' || languageDisplay === 'vi') && (
                <div>
                  <Label className="mb-2.5 flex items-center gap-2">
                    Lợi ích (VI) - Mỗi dòng 1 lợi ích
                  </Label>
                  <Textarea
                    value={benefitsTextVi}
                    onChange={(e) => setBenefitsTextVi(e.target.value)}
                    rows={4}
                    placeholder="Lợi ích 1&#10;Lợi ích 2"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Team Assignment */}
          <div>
            <Label className="mb-2.5 block text-lg font-medium">Đội ngũ phụ trách (Members)</Label>
            {members.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có thành viên nào. Hãy tạo thành viên trước.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => {
                  const isSelected = (formData.team as string[])?.includes(member._id as string);
                  return (
                    <div
                      key={member._id as string}
                      onClick={() => toggleTeamMember(member._id as string)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-blue-500 text-white' : 'border border-gray-300'
                        }`}
                      >
                        {isSelected && <Check size={14} />}
                      </div>
                      <Image
                        src={member.image}
                        alt="avatar"
                        width={40}
                        height={40}
                        className="rounded-full object-cover w-10 h-10"
                      />
                      <div className="overflow-hidden">
                        <p className="font-semibold text-sm truncate">{member.name.vi}</p>
                        <p className="text-xs text-gray-500 truncate">{member.position.vi}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Common Fields */}
          <div>
            <Label htmlFor="link" className="mb-2.5 flex items-center gap-2">
              Link URL Dịch Vụ
              {errors.link && <span className="text-red-500 text-sm">{errors.link}</span>}
            </Label>
            <Input
              id="link"
              name="link"
              value={formData.link || ''}
              onChange={(e) => handleChange(e, 'link')}
              placeholder="/services/..."
              className={errors.link ? 'border-red-500' : ''}
            />
            {errors.link && (
              <p id="link-error" className="text-red-500 text-sm mt-1">
                {errors.link}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label className="mb-2.5 flex items-center gap-2">
                Ảnh Dịch Vụ (Thumbnail)
                {errors.img && <span className="text-red-500 text-sm">{errors.img}</span>}
              </Label>
              <ImageUploader onUploadSuccess={handleImageUploadSuccess} />
              {formData.img && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Ảnh đã chọn:</p>
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

            <div>
              <Label className="mb-2.5 flex items-center gap-2">
                Icon Dịch Vụ (Tùy chọn)
              </Label>
              <ImageUploader onUploadSuccess={handleIconUploadSuccess} />
              {formData.icon && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Icon đã chọn:</p>
                  <div className="bg-gray-100 w-16 h-16 flex items-center justify-center rounded">
                    <Image
                      src={formData.icon}
                      alt="Service icon"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/services')}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-[#B8967E] hover:bg-[#9b6f45] text-white">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Tạo Dịch Vụ'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
