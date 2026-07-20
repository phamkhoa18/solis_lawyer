'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, Upload } from 'lucide-react';

async function uploadImageLocal(file: File): Promise<string> {
  if (!file) throw new Error('Không có file để upload');
  if (file.size > 5 * 1024 * 1024) throw new Error('File quá lớn (max 5MB)');
  if (!file.type.startsWith('image/')) throw new Error('Chỉ hỗ trợ file ảnh');

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

async function deleteImageLocal(url: string): Promise<void> {
  const res = await fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    console.warn('Không thể xóa ảnh cũ:', url);
  }
}

export default function MultiImageUploader({
  onUploadSuccess,
  initialImages = [],
}: {
  onUploadSuccess?: (urls: string[]) => void;
  initialImages?: string[];
}) {
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setImageUrls(initialImages || []);
  }, [initialImages]);

  const handleFiles = async (files: FileList) => {
    setLoading(true);
    setError(null);

    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const url = await uploadImageLocal(file);
        newUrls.push(url);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    const updatedImages = [...imageUrls, ...newUrls];
    setImageUrls(updatedImages);
    onUploadSuccess?.(updatedImages);
    setLoading(false);
  };

  const handleRemoveImage = async (index: number) => {
    const url = imageUrls[index];
    // Try to delete from server if it's a local upload
    if (url && url.startsWith('/uploads/')) {
      await deleteImageLocal(url);
    }

    const updatedImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedImages);
    onUploadSuccess?.(updatedImages);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white border rounded shadow">
      <div
        className={`border-2 border-dashed p-6 text-center rounded cursor-pointer transition ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
        } ${loading ? 'cursor-wait' : 'hover:border-blue-500'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-blue-500 text-sm">Đang upload ảnh...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-6 w-6 text-blue-500" />
            <p className="text-sm text-gray-600">Kéo ảnh vào đây hoặc bấm để chọn</p>
            <p className="text-xs text-gray-400">JPG, PNG, WebP - max 5MB mỗi ảnh</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          ref={inputRef}
          disabled={loading}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded border border-red-300">
          {error}
        </div>
      )}

      {imageUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative group w-full h-40 border rounded overflow-hidden">
              <Image
                src={url}
                alt={`Ảnh ${index + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Xóa ảnh"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
