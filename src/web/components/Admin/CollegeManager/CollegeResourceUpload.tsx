import React, { useState, useRef } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Progress } from '@/components/UI/progress';
import { 
  Upload, 
  FolderOpen, 
  File, 
  X, 
  Check, 
  Download,
  ExternalLink,
  Loader2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface CollegeResourceUploadProps {
  subjectId: string;
  onResourceAdded: () => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export function CollegeResourceUpload({ subjectId, onResourceAdded }: CollegeResourceUploadProps) {
  const { toast } = useToast();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    // Check file sizes before upload
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${file.name} is ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB. Maximum allowed size is 2GB.`,
          variant: 'destructive'
        });
        return;
      }
    }

    const newFiles: UploadingFile[] = Array.from(files).map(file => ({
      id: uuidv4(),
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);

    for (const uploadFile of newFiles) {
      try {
        const fileExt = uploadFile.file.name.split('.').pop();
        const timestamp = Date.now();
        const randomId = uuidv4().substring(0, 8);
        const fileName = `${timestamp}-${randomId}-${uploadFile.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `college-subjects/${subjectId}/${fileName}`;

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ));
        }, 200);

        // Use the manually created bucket
        const bucketName = 'collegecontent';
        
        // Upload to Supabase Storage with upsert to handle duplicates
        const { error: uploadError, data } = await supabase.storage
          .from(bucketName)
          .upload(filePath, uploadFile.file, {
            cacheControl: '3600',
            upsert: true // Allow overwriting existing files
          });

        clearInterval(progressInterval);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        // Check if resource already exists in database
        const { data: existingResource } = await supabase
          .from('subject_resources')
          .select('id')
          .eq('subject_id', subjectId)
          .eq('file_name', uploadFile.file.name)
          .single();

        if (existingResource) {
          // Update existing resource
          const { error: dbError } = await supabase
            .from('subject_resources')
            .update({
              file_url: publicUrl,
              file_type: uploadFile.file.type,
              file_size: uploadFile.file.size,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingResource.id);

          if (dbError) {
            throw dbError;
          }
        } else {
          // Create new resource
          const { error: dbError } = await supabase
            .from('subject_resources')
            .insert({
              title: resourceTitle || uploadFile.file.name,
              description: resourceDescription,
              resource_type: 'document',
              file_url: publicUrl,
              external_url: externalUrl || null,
              subject_id: subjectId,
              file_name: uploadFile.file.name,
              file_type: uploadFile.file.type,
              file_size: uploadFile.file.size,
              is_published: true
            });

          if (dbError) {
            throw dbError;
          }
        }

        // Update progress to completed
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, progress: 100, status: 'completed' as const }
            : f
        ));

        toast({
          title: 'File uploaded successfully',
          description: `${uploadFile.file.name} has been uploaded.`
        });

      } catch (error: any) {
        console.error('Upload error:', error);
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error' as const, error: error.message }
            : f
        ));

        toast({
          title: 'Upload failed',
          description: `Failed to upload ${uploadFile.file.name}: ${error.message}`,
          variant: 'destructive'
        });
      }
    }

    setIsUploading(false);
    onResourceAdded();
  };

  const handleFolderUpload = async (files: FileList) => {
    if (!files.length) return;

    // Check file sizes before upload
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${file.name} is ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB. Maximum allowed size is 2GB.`,
          variant: 'destructive'
        });
        return;
      }
    }

    const newFiles: UploadingFile[] = Array.from(files).map(file => ({
      id: uuidv4(),
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);

    for (const uploadFile of newFiles) {
      try {
        const fileExt = uploadFile.file.name.split('.').pop();
        const timestamp = Date.now();
        const randomId = uuidv4().substring(0, 8);
        const fileName = `${timestamp}-${randomId}-${uploadFile.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `college-subjects/${subjectId}/${fileName}`;

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress: Math.min(f.progress + 5, 90) }
              : f
          ));
        }, 100);

        // Use the manually created bucket
        const bucketName = 'collegecontent';
        
        // Upload to Supabase Storage with upsert
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, uploadFile.file, {
            cacheControl: '3600',
            upsert: true // Allow overwriting existing files
          });

        clearInterval(progressInterval);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        // Check if resource already exists in database
        const { data: existingResource } = await supabase
          .from('subject_resources')
          .select('id')
          .eq('subject_id', subjectId)
          .eq('file_name', uploadFile.file.name)
          .single();

        if (existingResource) {
          // Update existing resource
          const { error: dbError } = await supabase
            .from('subject_resources')
            .update({
              file_url: publicUrl,
              file_type: uploadFile.file.type,
              file_size: uploadFile.file.size,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingResource.id);

          if (dbError) {
            throw dbError;
          }
        } else {
          // Create new resource
          const { error: dbError } = await supabase
            .from('subject_resources')
            .insert({
              title: uploadFile.file.name,
              description: `Uploaded from folder`,
              resource_type: 'document',
              file_url: publicUrl,
              subject_id: subjectId,
              file_name: uploadFile.file.name,
              file_type: uploadFile.file.type,
              file_size: uploadFile.file.size,
              is_published: true
            });

          if (dbError) {
            throw dbError;
          }
        }

        // Update progress to completed
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, progress: 100, status: 'completed' as const }
            : f
        ));

      } catch (error: any) {
        console.error('Upload error:', error);
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error' as const, error: error.message }
            : f
        ));
      }
    }

    setIsUploading(false);
    onResourceAdded();
    toast({
      title: 'Folder uploaded successfully',
      description: `${files.length} files have been uploaded.`
    });
  };

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearCompletedUploads = () => {
    setUploadingFiles(prev => prev.filter(f => f.status === 'uploading'));
  };

  return (
    <div className="space-y-6">
      {/* Upload Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resource Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Resource Title</label>
              <Input
                placeholder="Enter resource title"
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">External URL (Optional)</label>
              <Input
                placeholder="https://example.com"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Enter resource description"
              value={resourceDescription}
              onChange={(e) => setResourceDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Upload Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
            
            <Button
              onClick={() => folderInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
              className="flex-1"
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Upload Folder
            </Button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.mp4,.mp3"
          />
          
          <input
            ref={folderInputRef}
            type="file"
            webkitdirectory="true"
            multiple
            onChange={(e) => e.target.files && handleFolderUpload(e.target.files)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Upload Progress</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompletedUploads}
              >
                Clear Completed
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadingFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {uploadFile.status === 'uploading' && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      )}
                      {uploadFile.status === 'completed' && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      {uploadFile.status === 'error' && (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">{uploadFile.file.name}</span>
                    </div>
                    <Progress value={uploadFile.progress} className="w-full" />
                    {uploadFile.error && (
                      <p className="text-sm text-red-500 mt-1">{uploadFile.error}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadingFile(uploadFile.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 