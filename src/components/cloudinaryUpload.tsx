/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react';

async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!file) throw new Error('Không có file để upload');
  if (file.size > 5 * 1024 * 1024) throw new Error('File quá lớn (max 5MB)');
  if (!file.type.startsWith('image/')) throw new Error('Chỉ hỗ trợ file ảnh');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload lỗi: ${text}`);
  }

  const data = await res.json();
  if (!data.secure_url) throw new Error('Không nhận được URL ảnh');

  return data.secure_url;
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  useEffect(() => {
    if (initialImage) {
      setImageUrl(initialImage);
    }
  }, [initialImage]);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const url = await uploadImageToCloudinary(file);
      setImageUrl(url);
      if (onUploadSuccess) {
        onUploadSuccess(url);
      }
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-sm mx-auto p-4 bg-white rounded-md shadow border border-gray-200 text-sm">
      <div
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
        className={`relative cursor-pointer rounded border-2 border-dashed p-6 flex flex-col items-center justify-center transition text-xs
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${loading ? 'cursor-wait' : 'cursor-pointer'}
        `}
      >
        {loading ? (
          <svg
            className="animate-spin h-6 w-6 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <>
            <svg
              className="mb-2 h-6 w-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12V4M12 8v8m-4-4h8" />
            </svg>
            <p className="text-blue-600 font-medium">Tải ảnh hoặc kéo vào</p>
            <p className="mt-0.5 text-gray-400">JPG, PNG - max 5MB</p>
          </>
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

      {imageUrl && (
        <div className="mt-4 rounded border border-gray-200 overflow-hidden">
          <img src={imageUrl} alt="Ảnh đã upload" className="w-full h-40 object-contain bg-white" />
        </div>
      )}

      {error && (
        <div className="mt-3 px-3 py-2 text-xs text-red-700 bg-red-100 rounded border border-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 px-3 py-2 text-xs text-green-700 bg-green-100 rounded border border-green-300">
          Upload ảnh thành công!
        </div>
      )}
    </div>
  );
}
