'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ImageUploader from '@/components/cloudinaryUpload';
import slugify from "slugify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TextEditor from '@/components/TextEditor';
import { toast } from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

export default function CreateBlogPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    type: '',
    author: '',
    status: 'draft',
  });

  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<{_id: string; name: string}[]>([]);
  const [user, setUser] = useState<{_id: string; name: string}[]>([]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditorChange = (value: string) => {
    setFormData({ ...formData, content: value });
  };

  async function getDataType() {
  try {
    const res = await fetch('/api/type');
    const data = await res.json();

    console.log(data);
    setCategory(data.data);
  } catch (error) {
    console.error(error);
  }
}

async function getDataUser() {
  try {
    const res = await fetch('/api/users');
    const data = await res.json();
  
    setUser(data.data);
  } catch (error) {
    console.error(error);
  }
}

  useEffect(() => {
    getDataType();
    getDataUser();
  }, []);

  // Hàm nhận URL ảnh từ ImageUploader trả về
  const handleImageUploadSuccess = (url: string) => {
    setFormData(prev => ({ ...prev, featuredImage: url }));
  };

  const generateSlug = () => {
    const newSlug = slugify(formData.title || '', {
      lower: true,
      strict: true,
      locale: 'vi',
      trim: true,
    });
    setFormData((prev) => ({ ...prev, slug: newSlug }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('Vui lòng nhập tiêu đề, slug và nội dung.');
      return;
    }

    console.log(formData);
    

    try {
      setLoading(true);
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Tạo bài viết thành công!');
        router.push('/admin/blogs');
      } else {
        toast.error(data.message || 'Đã có lỗi xảy ra!');
      }
    } catch {
      toast.error('Không thể kết nối tới server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tạo bài viết mới</h1>

      <Card>
        <CardContent className="flex flex-col gap-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className='mb-2.5' htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div >
            <Label className='mb-2.5 block' htmlFor="slug">Slug (URL)</Label>
            <div className="relative">
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="slug-tu-dong-se-o-day"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-0 text-muted-foreground hover:text-primary"
                onClick={generateSlug}
              >
                <Sparkles className="h-4 w-4" />
                <span className="sr-only">Generate slug</span>
              </Button>
            </div>
          </div>
            <div className='w-full'>
              <Label className='mb-2.5'>Chọn thể loại</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="Chọn thể loại" />
                </SelectTrigger>
                <SelectContent>
                  {category.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='w-full'>
              <Label className='mb-2.5'>Chọn Tác giả</Label>
              <Select
                value={formData.author}
                onValueChange={(value) =>
                  setFormData({ ...formData, author: value })
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="Chọn tác giả" />
                </SelectTrigger>
                <SelectContent>
                  {user.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
              <Label className='mb-2.5' htmlFor="featuredImage">Hình ảnh nổi bật</Label>
              <ImageUploader onUploadSuccess={handleImageUploadSuccess} />
              {formData.featuredImage && (
                <p className="mt-2 text-sm text-gray-600">Ảnh đã chọn: <a href={formData.featuredImage} target="_blank" rel="noreferrer" className="text-blue-600 underline">{formData.featuredImage}</a></p>
              )}
          </div>

          <div>
            <Label className='mb-2.5' htmlFor="excerpt">Mô tả ngắn</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              value={formData.excerpt}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label className='mb-2.5'>Nội dung</Label>
            <TextEditor value={formData.content} onChange={handleEditorChange} />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang lưu...' : 'Tạo bài viết'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
