'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
import { Sparkles, Loader2, ArrowLeft, Globe, ImageIcon } from 'lucide-react';

interface FormData {
  title: { en: string; vi: string };
  description: { en: string; vi: string };
  content: { en: string; vi: string };
  slug: string;
  image: string;
  category: string;
  user: string;
  status: 'draft' | 'published';
}

export default function CreateCaseStudyPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'vi'>('vi');
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
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: { en: string } }[]>([]);
  const [users, setUsers] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    getCategories();
    getUsers();
  }, []);

  async function getCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
      else toast.error(data.message || 'Không thể tải danh mục');
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Lỗi khi tải danh mục');
    }
  }

  async function getUsers() {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
      else toast.error(data.message || 'Không thể tải người dùng');
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
      setLoading(true);
      const res = await fetch('/api/casestudies', {
        method: 'POST',
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
          publishedAt: formData.status === 'published' ? new Date() : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Tạo case study thành công!');
        router.push('/admin/casestudy');
      } else {
        toast.error(data.message || 'Đã có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Không thể kết nối tới server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500"
            onClick={() => router.push('/admin/casestudy')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Tạo Case Study Mới</h1>
            <p className="text-sm text-slate-500">Điền đầy đủ thông tin bên dưới</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Tabs */}
          <div className="flex items-center bg-slate-100 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => setLanguage('vi')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                language === 'vi'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              🇻🇳 Tiếng Việt
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content — Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">Thông tin cơ bản — {language === 'vi' ? 'Tiếng Việt' : 'English'}</h2>
            </div>

            <div>
              <Label htmlFor="title" className="text-sm text-slate-600">Tiêu đề ({language.toUpperCase()})</Label>
              <Input
                id="title"
                value={formData.title[language] || ''}
                onChange={(e) => handleChange(e, 'title')}
                className="mt-1.5"
                placeholder={`Nhập tiêu đề bằng ${language === 'en' ? 'tiếng Anh' : 'tiếng Việt'}`}
              />
            </div>

            <div>
              <Label htmlFor="slug" className="text-sm text-slate-600">Slug (URL)</Label>
              <div className="relative mt-1.5">
                <Input
                  id="slug"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="slug-tu-dong-se-o-day"
                  className="pr-10 font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateSlug}
                  disabled={!formData.title.vi}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-slate-400 hover:text-[#9b6f45]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm text-slate-600">
                Mô tả ngắn ({language.toUpperCase()})
                <span className="text-slate-400 ml-1">— tối đa 200 ký tự</span>
              </Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description[language] || ''}
                onChange={(e) => handleChange(e, 'description')}
                className="mt-1.5 resize-none"
                placeholder={`Nhập mô tả ngắn bằng ${language === 'en' ? 'tiếng Anh' : 'tiếng Việt'}`}
              />
              <p className="text-xs text-slate-400 mt-1 text-right">
                {(formData.description[language] || '').length}/200
              </p>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <Label className="text-sm text-slate-600 mb-3 block">
              Nội dung ({language.toUpperCase()})
            </Label>
            <TextEditor
              value={formData.content[language] || ''}
              onChange={handleEditorChange}
            />
          </div>
        </div>

        {/* Sidebar — Right 1/3 */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">Cài đặt đăng bài</h2>

            <div>
              <Label className="text-sm text-slate-600">Trạng thái</Label>
              <Select
                value={formData.status || ''}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as 'draft' | 'published' })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="published">Công khai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-slate-600">Danh mục</Label>
              <Select
                value={formData.category || ''}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1.5">
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
              <Label className="text-sm text-slate-600">Tác giả</Label>
              <Select
                value={formData.user || ''}
                onValueChange={(value) => setFormData({ ...formData, user: value })}
              >
                <SelectTrigger className="mt-1.5">
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

            <div className="pt-2 border-t border-slate-100">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#d5aa6d] to-[#9b6f45] hover:from-[#c9a060] hover:to-[#8a6340] text-white"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {loading ? 'Đang lưu...' : 'Tạo Case Study'}
              </Button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">Hình ảnh nổi bật</h2>
            </div>
            <ImageUploader onUploadSuccess={handleImageUploadSuccess} />
            {formData.image && (
              <div className="mt-3 relative w-full aspect-video rounded-md overflow-hidden border border-slate-200">
                <Image
                  src={formData.image}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}