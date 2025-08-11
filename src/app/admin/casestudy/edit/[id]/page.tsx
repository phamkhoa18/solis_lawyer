/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ImageUploader from '@/components/cloudinaryUpload';
import slugify from 'slugify';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TextEditor from '@/components/TextEditor';
import { toast } from 'react-hot-toast';
import { Sparkles, Languages, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FormData {
  title: { en: string; vi: string };
  description: { en: string; vi: string };
  content: { en: string; vi: string };
  slug: string;
  image: string;
  category: any ;
  user: any;
  status: 'draft' | 'published';
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export default function EditCaseStudyPage() {
  const router = useRouter();
  const { id } = useParams();
  const [language, setLanguage] = useState<'en' | 'vi'>('en');
  const [formData, setFormData] = useState<FormData>({
    title: { en: '', vi: '' },
    description: { en: '', vi: '' },
    content: { en: '', vi: '' },
    slug: '',
    image: '',
    category: '',
    user: '',
    status: 'published',
  });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: { en: string } }[]>([]);
  const [users, setUsers] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    fetchCaseStudy();
    getCategories();
    getUsers();
  }, [id]);

  async function fetchCaseStudy() {
    if (!id) return;
    try {
      const res = await fetch(`/api/casestudies?id=${id}`);
      const data: ApiResponse<FormData> = await res.json();
      console.log(data.data);
      
      if (data.success && data.data) {
        setFormData({
          title: { en: data.data.title.en || '', vi: data.data.title.vi || '' },
          description: { en: data.data.description.en || '', vi: data.data.description.vi || '' },
          content: { en: data.data.content.en || '', vi: data.data.content.vi || '' },
          slug: data.data.slug || '',
          image: data.data.image || '',
          category: data.data.category._id || '',
          user: data.data.user._id || '',
          status: data.data.status || 'published',
        });
      } else {
        toast.error(data.message || 'Không thể tải case study');
      }
    } catch (error) {
      console.error('Error fetching case study:', error);
      toast.error('Lỗi khi tải case study');
    } finally {
      setLoading(false);
    }
  }

  async function getCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        toast.error(data.message || 'Không thể tải danh mục');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Lỗi khi tải danh mục');
    }
  }

  async function getUsers() {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error(data.message || 'Không thể tải người dùng');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Lỗi khi tải người dùng');
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: 'title' | 'description'
  ) => {
    setFormData({
      ...formData,
      [field]: { ...formData[field], [language]: e.target.value },
    });
  };

  const handleEditorChange = (value: string) => {
    setFormData({
      ...formData,
      content: { ...formData.content, [language]: value },
    });
  };

  const handleImageUploadSuccess = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const generateSlug = () => {
    if (!formData.title.vi) {
      toast.error('Vui lòng nhập tiêu đề tiếng Việt trước khi tạo slug.');
      return;
    }
    const newSlug = slugify(formData.title.vi, {
      lower: true,
      strict: true,
      locale: 'vi',
      trim: true,
    });
    setFormData((prev) => ({ ...prev, slug: newSlug }));
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'vi' : 'en'));
  };

  const handleSubmit = async () => {
    const requiredFields = [
      { field: formData.title.en, name: 'Tiêu đề (EN)' },
      { field: formData.title.vi, name: 'Tiêu đề (VI)' },
      { field: formData.description.en, name: 'Mô tả (EN)' },
      { field: formData.description.vi, name: 'Mô tả (VI)' },
      { field: formData.content.en, name: 'Nội dung (EN)' },
      { field: formData.content.vi, name: 'Nội dung (VI)' },
      { field: formData.slug, name: 'Slug' },
      { field: formData.image, name: 'Hình ảnh' },
      { field: formData.category, name: 'Danh mục' },
      { field: formData.user, name: 'Tác giả' },
    ];

    const missingField = requiredFields.find((item) => !item.field);
    if (missingField) {
      toast.error(`Vui lòng điền ${missingField.name}.`);
      return;
    }

    if (formData.description.en.length > 200 || formData.description.vi.length > 200) {
      toast.error('Mô tả không được vượt quá 200 ký tự.');
      return;
    }

    try {
      setSubmitLoading(true);
      const res = await fetch(`/api/casestudies?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: { en: formData.title.en, vi: formData.title.vi },
          description: { en: formData.description.en, vi: formData.description.vi },
          content: { en: formData.content.en, vi: formData.content.vi },
          slug: formData.slug,
          image: formData.image,
          category: formData.category,
          user: formData.user,
          isActive: formData.status === 'published',
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Cập nhật case study thành công!');
        router.push('/admin/casestudy');
      } else {
        toast.error(data.message || 'Đã có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Không thể kết nối tới server!');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Animation variants cho Framer Motion
  const formVariants:any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-3 p-3 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <h1 className="text-2xl font-bold text-gray-900 flex gap-3">
            Chỉnh sửa Case Study
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Languages className="h-4 w-4" />
                    {language === 'en' ? 'Tiếng Việt' : 'English'}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chuyển đổi ngôn ngữ nhập liệu</p>
              </TooltipContent>
            </Tooltip>
          </h1>
          <Button
            variant="outline"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => router.push('/admin/casestudy')}
          >
            Quay lại
          </Button>
        </motion.div>

        <Card className="shadow-md border border-gray-100">
          <CardContent className="p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={language}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                      Tiêu đề ({language.toUpperCase()})
                    </Label>
                    <Input
                      id="title"
                      value={formData.title[language] || ''}
                      onChange={(e) => handleChange(e, 'title')}
                      className="mt-1"
                      placeholder={`Nhập tiêu đề bằng ${language === 'en' ? 'tiếng Anh' : 'tiếng Việt'}`}
                    />
                  </div>

                  <div className="relative">
                    <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                      Slug (URL)
                    </Label>
                    <Input
                      id="slug"
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="slug-tu-dong-se-o-day"
                      className="mt-1 pr-10"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute right-2 top-[25px]"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={generateSlug}
                            disabled={!formData.title.vi}
                            className="text-gray-500 hover:text-blue-600"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span className="sr-only">Tạo slug tự động</span>
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tạo slug từ tiêu đề tiếng Việt</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Danh mục</Label>
                    <Select
                      value={formData.category || ''}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tác giả</Label>
                    <Select
                      value={formData.user || ''}
                      onValueChange={(value) => setFormData({ ...formData, user: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn tác giả" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Trạng thái</Label>
                    <Select
                      value={formData.status || ''}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value as 'draft' | 'published' })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Bản nháp</SelectItem>
                        <SelectItem value="published">Công khai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Mô tả ngắn ({language.toUpperCase()})
                  </Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={formData.description[language] || ''}
                    onChange={(e) => handleChange(e, 'description')}
                    className="mt-1"
                    placeholder={`Nhập mô tả ngắn bằng ${language === 'en' ? 'tiếng Anh' : 'tiếng Việt'}`}
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Hình ảnh nổi bật</Label>
                    <ImageUploader onUploadSuccess={handleImageUploadSuccess} />
                    {formData.image && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-sm text-gray-600"
                      >
                        Ảnh đã chọn:{' '}
                        <a
                          href={formData.image}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {formData.image}
                        </a>
                      </motion.p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Nội dung ({language.toUpperCase()})
                  </Label>
                  <TextEditor
                    value={formData.content[language] || ''}
                    onChange={handleEditorChange}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-end mt-10">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSubmit}
                  disabled={submitLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  {submitLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitLoading ? 'Đang lưu...' : 'Cập nhật Case Study'}
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}