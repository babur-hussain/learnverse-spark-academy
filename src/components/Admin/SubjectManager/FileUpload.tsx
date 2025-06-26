
import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Loader2, Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

interface FileUploadProps {
  subjectId: string;
  onFileUploaded: () => void;
}

export function FileUpload({ subjectId, onFileUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Set title to filename without extension by default
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setFileTitle(fileName || file.name);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !subjectId) return;

    try {
      setIsUploading(true);
      
      const fileId = uuidv4();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${fileId}.${fileExt}`;
      const filePath = `${subjectId}/${fileName}`;
      
      // Upload file to storage bucket
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('subject-content')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true // Overwrite if file exists
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = await supabase
        .storage
        .from('subject-content')
        .getPublicUrl(filePath);

      // Save file info in database
      const { error: dbError } = await supabase
        .from('subject_resources')
        .insert({
          subject_id: subjectId,
          title: fileTitle || selectedFile.name,
          description: fileDescription,
          resource_type: 'file',
          file_url: publicUrlData.publicUrl,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          is_published: true
        });
      
      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      toast({
        title: "File uploaded successfully",
        description: `${selectedFile.name} has been uploaded.`
      });
      
      // Reset form
      setSelectedFile(null);
      setFileTitle('');
      setFileDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notify parent component that file has been uploaded
      onFileUploaded();
      
    } catch (error: any) {
      console.error('Full upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading the file.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Choose File</Label>
        {selectedFile ? (
          <div className="flex items-center justify-between p-2 border rounded-md bg-slate-50 dark:bg-slate-900">
            <span className="truncate">{selectedFile.name}</span>
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
              className="w-full"
            />
          </div>
        )}
      </div>
      
      {selectedFile && (
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
          
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || !fileTitle.trim()}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
