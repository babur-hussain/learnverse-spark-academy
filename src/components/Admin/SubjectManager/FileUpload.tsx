
import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Loader2, Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  subjectId: string;
  onFileUploaded: () => void;
}

export function FileUpload({ subjectId, onFileUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileTitle, setFileTitle] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isPdf = (file: File) => {
    const nameOk = file.name.toLowerCase().endsWith('.pdf');
    const typeOk = file.type === 'application/pdf';
    return nameOk || typeOk;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const pdfs = files.filter(isPdf);
    const rejected = files.filter(f => !isPdf(f));

    if (rejected.length) {
      toast({
        title: 'Some files were skipped',
        description: `${rejected.length} non-PDF file(s) ignored. Only PDFs are allowed.`,
        variant: 'destructive'
      });
    }

    setSelectedFiles(pdfs);

    // When one file, pre-fill title from filename
    if (pdfs.length === 1) {
      const base = pdfs[0].name.split('.').slice(0, -1).join('.') || pdfs[0].name;
      setFileTitle(base);
    } else {
      setFileTitle('');
    }
  };

  const handleClearFile = () => {
    setSelectedFiles([]);
    setFileTitle('');
    setFileDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadSingleFile = async (file: File, titleOverride?: string, descriptionOverride?: string) => {
    const fileId = uuidv4();
    const fileExt = file.name.split('.').pop();
    const fileName = `${fileId}.${fileExt}`;
    const filePath = `${subjectId}/${fileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from('subject-content')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = await supabase
      .storage
      .from('subject-content')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('subject_resources')
      .insert({
        subject_id: subjectId,
        title: (titleOverride && titleOverride.trim()) || file.name,
        description: descriptionOverride || null,
        resource_type: 'file',
        file_url: publicUrlData.publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        is_published: true
      });
    if (dbError) throw dbError;
  };

  const handleUpload = async () => {
    if (!subjectId || selectedFiles.length === 0) return;

    try {
      setIsUploading(true);
      setUploadedCount(0);

      for (const file of selectedFiles) {
        await uploadSingleFile(
          file,
          selectedFiles.length === 1 ? fileTitle : undefined,
          selectedFiles.length === 1 ? fileDescription : undefined
        );
        setUploadedCount(prev => prev + 1);
      }

      toast({
        title: 'Upload complete',
        description: selectedFiles.length === 1
          ? `${selectedFiles[0].name} has been uploaded.`
          : `${selectedFiles.length} PDF files have been uploaded.`
      });

      // Reset form
      setSelectedFiles([]);
      setFileTitle('');
      setFileDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      onFileUploaded();
    } catch (error: any) {
      console.error('Full upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'There was an error uploading the files.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadedCount(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Choose File</Label>
        {selectedFiles.length > 0 ? (
          <div className="flex items-center justify-between p-2 border rounded-md bg-slate-50 dark:bg-slate-900">
            <span className="truncate">
              {selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files selected`}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFile}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf,.pdf"
              multiple
              className="w-full"
            />
          </div>
        )}
      </div>
      
      {selectedFiles.length > 0 && (
        <>
          {selectedFiles.length === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter file title"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Enter file description"
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Titles will default to their filenames. Only PDF files are allowed.
            </div>
          )}
          
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || (selectedFiles.length === 1 && !fileTitle.trim())}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {selectedFiles.length > 1
                  ? `Uploading ${uploadedCount}/${selectedFiles.length}...`
                  : 'Uploading...'}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {selectedFiles.length > 1 ? 'Upload All' : 'Upload File'}
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
