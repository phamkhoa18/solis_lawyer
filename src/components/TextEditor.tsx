'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';

// import Editor chỉ trên client, tắt SSR để tránh hydration mismatch
const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
  ssr: false,
});

type TextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const TextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<unknown>(null);
  const [uploading, setUploading] = useState(false);

  const handleFilePicker = (
    callback: (value: string, meta?: Record<string, unknown>) => void,
    _value: string,
    meta: Record<string, unknown>
  ) => {
    if (meta.filetype === 'image') {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
          alert('File quá lớn. Vui lòng chọn file dưới 5MB.');
          return;
        }

        if (!file.type.startsWith('image/')) {
          alert('Vui lòng chọn file ảnh.');
          return;
        }

        setUploading(true);

        try {
          // Upload lên server local qua /api/upload
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          let data;
          try {
            data = await response.json();
          } catch (e) {
            // Handle non-JSON response (like Nginx 413 HTML or 502 Bad Gateway)
            throw new Error(`Server trả về lỗi HTTP ${response.status}: ${response.statusText}`);
          }

          if (!response.ok || !data?.success || !data?.url) {
            throw new Error(data?.message || `Lỗi tải lên: HTTP ${response.status}`);
          }

          callback(data.url, { alt: file.name });
        } catch (error: any) {
          console.error('Lỗi khi upload:', error);
          alert(`Không thể upload hình ảnh: ${error.message || 'Vui lòng thử lại.'}`);
        } finally {
          setUploading(false);
        }
      };

      input.click();
    }
  };

  return (
    <div>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        onInit={(_evt, editor) => (editorRef.current = editor)}
        value={value}
        onEditorChange={onChange}
        init={{
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'preview',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'code',
            'help',
            'wordcount',
          ],
          toolbar:
            'undo redo | formatselect | fontselect | fontsizeselect | bold italic underline strikethrough | ' +
            'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
            'link image media table | code preview fullscreen | help',
          menubar: 'file edit view insert format tools table help',
          font_formats:
            "Arial=arial,helvetica,sans-serif;" +
            "Courier New=courier new,courier,monospace;" +
            "Georgia=georgia,palatino,serif;" +
            "Tahoma=tahoma,arial,helvetica,sans-serif;" +
            "Times New Roman=times new roman,times,serif;" +
            "Verdana=verdana,geneva,sans-serif",
          height: 500,
          image_uploadtab: true,
          file_picker_types: 'image',
          file_picker_callback: handleFilePicker,
        }}
      />

      <Dialog open={uploading}>
        <DialogContent className="bg-white z-[9999] text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin h-8 w-8 border-4 border-[#d5aa6d] border-t-transparent rounded-full" />
            <p className="text-sm font-medium">Đang upload ảnh lên server...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TextEditor;
