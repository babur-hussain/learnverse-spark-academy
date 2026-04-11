import React, { useRef, useState, DragEvent, ClipboardEvent } from 'react';
import { UploadCloud, ImageIcon, Loader2 } from 'lucide-react';
import { compressImageToWebP } from '@/utils/imageCompressor';
import { uploadBlobToS3 } from '@/integrations/s3/upload';
import apiClient from '@/integrations/api/client';
import { useToast } from '@/hooks/use-toast';

interface Subject {
  id: string;
  icon?: string | null;
  icon_url?: string | null;
}

interface InlineIconUploaderProps {
  subject: Subject;
  onSuccess: () => void;
}

export const InlineIconUploader: React.FC<InlineIconUploaderProps> = ({ subject, onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleProcessFile = async (file: File | Blob, originalFileName?: string) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);

      // 1. Compress & Convert to WebP
      const { blob, fileName } = await compressImageToWebP(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.8,
      });

      // 2. Upload to S3
      const nameToUse = originalFileName || fileName || 'pasted-image.webp';
      const safeName = `${Date.now()}-${nameToUse.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { url } = await uploadBlobToS3(blob, safeName, 'subjects/icons');

      // 3. Save to Subject
      await apiClient.put(`/api/admin/subjects/${subject.id}`, { icon_url: url });

      toast({
        title: 'Icon Uploaded',
        description: 'Subject icon updated successfully.',
      });

      // 4. Refresh List
      onSuccess();
    } catch (error) {
      console.error('Upload Error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'An error occurred during upload',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file, file.name);
    // Reset so the same file could be selected again if needed
    if (e.target) e.target.value = '';
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0], e.dataTransfer.files[0].name);
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) handleProcessFile(file, file.name);
        break; // Only process first pasted image
      }
    }
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onPaste={onPaste}
      tabIndex={0}
      title="Drop or Paste (Cmd+V) to upload icon"
      className={`relative w-12 h-12 flex items-center justify-center rounded-lg border-2 overflow-hidden transition-all duration-200 outline-none
        ${isDragActive ? 'border-learn-purple bg-learn-purple/10 border-dashed scale-105' : 'border-transparent bg-gray-100 dark:bg-gray-800 hover:border-learn-purple/50'}
        ${isUploading ? 'opacity-70' : ''}
        focus:ring-2 focus:ring-learn-purple/50
      `}
    >
      {/* Hidden file input kept just in case drag/drop interacts with it, though handled manually */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {isUploading ? (
        <Loader2 className="w-5 h-5 animate-spin text-learn-purple" />
      ) : subject.icon_url || subject.icon ? (
        <img
          src={subject.icon_url || subject.icon || ''}
          alt="icon"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center text-gray-400 group-hover:text-learn-purple transition-colors">
          <ImageIcon className="w-5 h-5 mb-0.5" />
        </div>
      )}

    </div>
  );
};
