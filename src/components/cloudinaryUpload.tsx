'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

async function uploadImage(file: File): Promise<string> {
  if (!file) throw new Error('Không có file để upload');
  if (file.size > 5 * 1024 * 1024) throw new Error('File quá lớn (max 5MB)');
  if (!file.type.startsWith('image/')) throw new Error('Chỉ hỗ trợ file ảnh');

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error('Upload ảnh lên Cloudinary thất bại');
    }
    const data = await res.json();
    return data.secure_url;
  } else {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Upload lỗi: ${res.status}`);
    }

    const data = await res.json();
    if (!data.success || !data.url) throw new Error('Không nhận được URL ảnh');
    return data.url;
  }
}

async function deleteImageLocal(url: string): Promise<void> {
  // If it's a cloudinary URL, we generally don't delete from client side due to security (requires API Secret)
  // We'll only attempt delete for local uploads.
  if (url.startsWith('http://localhost') || url.startsWith('/uploads/')) {
    try {
      await fetch(`/api/upload?url=${encodeURIComponent(url)}`, { method: 'DELETE' });
    } catch {
      console.warn('Không thể xóa ảnh cũ:', url);
    }
  }
}

export default function ImageUploader({
  onUploadSuccess,
  initialImage,
}: {
  onUploadSuccess?: (url: string) => void;
  initialImage?: string;
}) {
  const [imageUrl, setImageUrl] = useState<string>(initialImage || '');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (initialImage) {
      setImageUrl(initialImage);
    }
  }, [initialImage]);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      if (onUploadSuccess) {
        onUploadSuccess(url);
      }
      toast.success('Upload ảnh thành công');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
      setDragOver(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemoveImage = async () => {
    if (imageUrl) {
      await deleteImageLocal(imageUrl);
    }
    setImageUrl('');
    if (onUploadSuccess) {
      onUploadSuccess('');
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!imageUrl ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
          onDrop={handleDrop}
          className={`relative overflow-hidden cursor-pointer rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all p-8
            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}
            ${loading ? 'cursor-wait opacity-70' : 'cursor-pointer'}
          `}
        >
          {loading ? (
            <div className="flex flex-col items-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-600">Đang tải lên...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">Click để tải ảnh lên hoặc kéo thả vào đây</p>
              <p className="text-xs text-slate-500">Hỗ trợ JPG, PNG, WebP (Tối đa 5MB)</p>
            </>
          )}
        </div>
      ) : (
        <div className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
          <div className="aspect-video w-full relative flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Uploaded preview" className="max-w-full max-h-[300px] object-contain rounded-lg shadow-sm" />
            
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity ${loading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {loading ? (
                 <RefreshCw className="w-8 h-8 text-white animate-spin" />
              ) : (
                <>
                  <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2 bg-white/90 hover:bg-white text-slate-800 rounded-lg text-sm font-medium transition shadow-sm backdrop-blur-sm">
                    <RefreshCw className="w-4 h-4" /> Đổi ảnh
                  </button>
                  <button type="button" onClick={handleRemoveImage} className="flex items-center gap-1.5 px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition shadow-sm backdrop-blur-sm">
                    <X className="w-4 h-4" /> Xóa ảnh
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={loading}
        onChange={handleFileChange}
      />
    </div>
  );
}
