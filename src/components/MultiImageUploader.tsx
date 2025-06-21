'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!file) throw new Error('Không có file để upload');
  if (file.size > 5 * 1024 * 1024) throw new Error('File quá lớn (max 5MB)');
  if (!file.type.startsWith('image/')) throw new Error('Chỉ hỗ trợ file ảnh');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();
  return data.secure_url;
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

  useEffect(() => {
    setImageUrls(initialImages || []);
  }, [initialImages]);

  const handleFiles = async (files: FileList) => {
    setLoading(true);
    setError(null);

    const urls: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const url = await uploadImageToCloudinary(file);
        urls.push(url);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    const updatedImages = [...imageUrls, ...urls];
    setImageUrls(updatedImages);
    onUploadSuccess?.(urls);
    setLoading(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white border rounded shadow">
      <div
        className={`border-2 border-dashed p-6 text-center rounded cursor-pointer ${
          loading ? 'cursor-wait' : 'hover:border-blue-500'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <p className="text-sm text-gray-600">Kéo ảnh vào đây hoặc bấm để chọn</p>
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

      {loading && (
        <p className="mt-2 text-blue-500 text-sm">Đang upload ảnh...</p>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded border border-red-300">
          {error}
        </div>
      )}

      {imageUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative w-full h-40 border rounded overflow-hidden">
              <Image
                src={url}
                alt={`Ảnh ${index + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
