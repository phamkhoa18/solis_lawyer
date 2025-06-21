/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { Sparkles } from 'lucide-react';
import { IPost } from '@/lib/types/ipost';
import { IType } from '@/lib/types/itype';
import { IUser } from '@/lib/types/iuser';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [formData, setFormData] = useState<Partial<IPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    type: undefined,
    author: undefined,
    status: 'draft',
    tags: [],
  });

  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<IType[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [postFetched, setPostFetched] = useState<IPost | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditorChange = (value: string) => {
    setFormData({ ...formData, content: value });
  };

  const handleImageUploadSuccess = (url: string) => {
    setFormData((prev) => ({ ...prev, featuredImage: url }));
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

  const getDataTypes = async () => {
    try {
      const res = await fetch('/api/type');
      const data = await res.json();
      if (data.success) {
        const simplified = data.data.map((item: IType) => ({
          _id: item._id,
          name: item.name,
        }));
        setTypes(simplified);
      } else {
        toast.error('Không tải được danh sách types');
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải types');
    }
  };

  const getDataUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        const simplified = data.data.map((item: IUser) => ({
          _id: item._id,
          name: item.name,
        }));
        setUsers(simplified);
      } else {
        toast.error('Không tải được danh sách users');
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải users');
    }
  };

const fetchPost = useCallback(async () => {
  try {
    const res = await fetch(`/api/posts/${id}`);
    const data = await res.json();
    if (data.success && data.data) {
      const post = data.data;
      console.log(post);

      setPostFetched(post);
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        featuredImage: post.featuredImage || '',
        type: post.type?._id || '',
        author: post.author?._id || '',
        status: post.status || 'draft',
        tags: post.tags || [],
      });
    } else {
      toast.error('Không tìm thấy bài viết');
      router.push('/admin/blogs');
    }
  } catch {
    toast.error('Lỗi khi tải bài viết');
  }
}, [id, router]); // cần thêm `id`, `router` nếu bạn dùng trong hàm

  // Synchronize type and author after data is fetched
  useEffect(() => {
    if (postFetched && types.length > 0 && users.length > 0) {
      setFormData((prev: any) => ({
        ...prev,
        type: typeof postFetched.type === 'object' ? postFetched.type._id : postFetched.type || '',
        author: typeof postFetched.author === 'object' ? postFetched.author._id : postFetched.author || '',
      }));
    }
  }, [postFetched, types, users]);

  useEffect(() => {
    if (id) {
      fetchPost();
      getDataTypes();
      getDataUsers();
    }
  }, [id, fetchPost]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug || !formData.content || !formData.type || !formData.author) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề, slug, nội dung, type và tác giả');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          publishedAt: formData.status === 'published' ? new Date() : undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Cập nhật bài viết thành công!');
        router.push('/admin/blogs');
      } else {
        toast.error(data.message || 'Cập nhật thất bại!');
      }
    } catch {
      toast.error('Lỗi khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa bài viết</h1>

      <Card>
        <CardContent className="flex flex-col gap-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title" className="mb-2.5">Tiêu đề</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="slug" className="mb-2.5">Slug (URL)</Label>
              <div className="relative">
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-0 text-muted-foreground hover:text-primary"
                  onClick={generateSlug}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="sr-only">Tạo slug</span>
                </Button>
              </div>
            </div>

            <div className="w-full">
              <Label className="mb-2.5">Chọn Type</Label>
              <Select
                value={formData.type as string}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <Label className="mb-2.5">Chọn Tác giả</Label>
              <Select
                value={formData.author as string}
                onValueChange={(value) =>
                  setFormData({ ...formData, author: value })
                }
              >
                <SelectTrigger className="w-full">
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
          </div>

          <div>
            <Label htmlFor="featuredImage" className="mb-2.5">Hình ảnh nổi bật</Label>
            <ImageUploader
              onUploadSuccess={handleImageUploadSuccess}
              initialImage={formData.featuredImage}
            />
            {formData.featuredImage && (
              <p className="mt-2 text-sm text-gray-600">
                Ảnh đã chọn:{' '}
                <a
                  href={formData.featuredImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {formData.featuredImage}
                </a>
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="excerpt" className="mb-2.5">Mô tả ngắn</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              value={formData.excerpt}
              onChange={handleChange}
              maxLength={300}
            />
          </div>

          <div>
            <Label className="mb-2.5">Nội dung</Label>
            <TextEditor value={formData.content ?? ''} onChange={handleEditorChange} />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}