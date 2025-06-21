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
import MultiImageUploader from '@/components/MultiImageUploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TextEditor from '@/components/TextEditor';
import { toast } from 'react-hot-toast';
import { ICategory } from '@/lib/types/icategory';
import { IProduct } from '@/lib/types/iproduct';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [formData, setFormData] = useState({
    title: '',
    shortContent: '',
    content: '',
    image: '',
    images: [] as string[],
    width: '',
    height: '',
    date: '',
    category: '',
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{_id: string; name: string}[]>([]);
  const [productFetched, setProductFetched] = useState<IProduct | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditorChange = (value: string) => {
    setFormData({ ...formData, content: value });
  };

  const handleImageUploadSuccess = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const handleMultiImageUpload = (urls: string[]) => {
    setFormData((prev) => ({ ...prev, images: urls }));
  };

  const getDataCategory = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      const simplified = data.data.map((item: ICategory) => ({
        _id: item._id,
        name: item.name,
      }));
      setCategories(simplified);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải danh mục');
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const product = data.data;
        setProductFetched(product);
        setFormData({
          title: product.title || '',
          shortContent: product.shortContent || '',
          content: product.content || '',
          image: product.image || '',
          images: product.images || [],
          width: product.width ? product.width.toString() : '',
          height: product.height ? product.height.toString() : '',
          date: product.date ? new Date(product.date).toISOString().split('T')[0] : '',
          category: product.category?._id || '',
        });
      } else {
        toast.error('Không tìm thấy sản phẩm');
        router.push('/admin/products');
      }
    } catch {
      toast.error('Lỗi khi tải sản phẩm');
    }
  };

  // Synchronize category after both product and categories are fetched
  useEffect(() => {
    if (productFetched && categories.length > 0) {
      setFormData((prev: any) => ({
        ...prev,
        category: productFetched.category?._id || '',
      }));
    }
  }, [productFetched, categories]);

  useEffect(() => {
    if (id) {
      fetchProduct();
      getDataCategory();
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.shortContent || !formData.content || !formData.image) {
      toast.error('Vui lòng nhập tiêu đề, mô tả ngắn, nội dung và ảnh chính.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          width: formData.width ? parseFloat(formData.width) : undefined,
          height: formData.height ? parseFloat(formData.height) : undefined,
          date: formData.date ? new Date(formData.date) : undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Cập nhật sản phẩm thành công!');
        router.push('/admin/products');
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
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa sản phẩm</h1>

      <Card>
        <CardContent className="flex flex-col gap-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="mb-2.5" htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label className="mb-2.5" htmlFor="width">Chiều rộng (m)</Label>
              <Input
                id="width"
                name="width"
                type="number"
                value={formData.width}
                onChange={handleChange}
                placeholder="Nhập chiều rộng"
              />
            </div>

            <div>
              <Label className="mb-2.5" htmlFor="height">Chiều cao (m)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                placeholder="Nhập chiều cao"
              />
            </div>

            <div className="w-full">
              <Label className="mb-2.5">Chọn danh mục</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2.5" htmlFor="date">Ngày thực hiện sản phẩm</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label className="mb-2.5" htmlFor="image">Ảnh chính</Label>
            <ImageUploader onUploadSuccess={handleImageUploadSuccess} initialImage={formData.image} />
            {formData.image && (
              <p className="mt-2 text-sm text-gray-600">
                Ảnh chính đã chọn: <a href={formData.image} target="_blank" rel="noreferrer" className="text-blue-600 underline">{formData.image}</a>
              </p>
            )}
          </div>

          <div>
            <Label className="mb-2.5">Ảnh phụ</Label>
            <MultiImageUploader onUploadSuccess={handleMultiImageUpload} initialImages={formData.images} />
            {formData.images.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Danh sách ảnh phụ:</p>
                <ul className="list-disc pl-5">
                  {formData.images.map((img, index) => (
                    <li key={index}>
                      <a href={img} target="_blank" rel="noreferrer" className="text-blue-600 underline">{img}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <Label className="mb-2.5" htmlFor="shortContent">Mô tả ngắn</Label>
            <Textarea
              id="shortContent"
              name="shortContent"
              rows={3}
              value={formData.shortContent}
              onChange={handleChange}
              maxLength={300}
            />
          </div>

          <div>
            <Label className="mb-2.5">Nội dung</Label>
            <TextEditor value={formData.content} onChange={handleEditorChange} />
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