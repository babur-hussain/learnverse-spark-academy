
import React, { useState, ChangeEvent, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from '@/components/UI/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/UI/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/UI/select';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import { Textarea } from '@/components/UI/textarea';
import { Loader2, Upload, File, X, Check } from 'lucide-react';
import { Progress } from '@/components/UI/progress';

const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  resource_type: z.string().min(1, 'Type is required'),
  file_url: z.string().url('Must be a valid URL').or(z.string().length(0)).optional(),
  external_url: z.string().url('Must be a valid URL').or(z.string().length(0)).optional(),
  subject_id: z.string().min(1, 'Subject is required'),
  chapter_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  file_url?: string | null;
  external_url?: string | null;
  created_at: string;
}

interface ResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSubjectId: string;
  initialChapterId?: string;
  onSuccess?: () => void;
  resource?: Resource;
}

export const ResourceDialog: React.FC<ResourceDialogProps> = ({
  open,
  onOpenChange,
  initialSubjectId,
  initialChapterId = '',
  onSuccess,
  resource
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: resource?.title || '',
      description: resource?.description || '',
      resource_type: resource?.resource_type || 'document',
      file_url: resource?.file_url || '',
      external_url: resource?.external_url || '',
      subject_id: initialSubjectId,
      chapter_id: initialChapterId || '',
    },
  });
  
  const resourceType = form.watch('resource_type');
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const pdfs = files.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    const rejected = files.filter(f => !(f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')));
    if (rejected.length) {
      toast({ title: 'Some files were skipped', description: `${rejected.length} non-PDF file(s) ignored.`, variant: 'destructive' });
    }
    setUploadedFiles(pdfs);
  };
  
  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${uuidv4()}.${fileExt}`;
      
      // Upload with simulated progress
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          if (progress >= 95) {
            clearInterval(interval);
          }
          setUploadProgress(progress);
        }, 100);
        
        return () => clearInterval(interval);
      };
      
      const cleanup = simulateProgress();
      
      const { error: uploadError, data } = await supabase.storage
        .from('resource-files')
        .upload(filePath, file);
      
      cleanup();
      setUploadProgress(100);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('resource-files')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    }
  };
  
  const clearFileInput = () => {
    setUploadedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const publicUrl = await uploadFile(file);
          const titleFromName = file.name.replace(/\.[^.]+$/, '') || file.name;
          const { error: dbErr } = await supabase
            .from('subject_resources')
            .insert({
              id: uuidv4(),
              title: titleFromName,
              description: values.description || null,
              resource_type: values.resource_type || 'document',
              file_url: publicUrl,
              external_url: null,
              subject_id: values.subject_id,
              chapter_id: values.chapter_id || null,
              is_published: true,
            });
          if (dbErr) throw dbErr;
        }
      } else {
        const resourceData = {
          id: resource?.id || uuidv4(),
          title: values.title || 'Untitled',
          description: values.description || null,
          resource_type: values.resource_type,
          file_url: values.file_url || null,
          external_url: values.external_url || null,
          subject_id: values.subject_id,
          chapter_id: values.chapter_id || null,
        } as any;
        const { error } = resource 
          ? await supabase
              .from('subject_resources')
              .update(resourceData)
              .eq('id', resource.id)
          : await supabase
              .from('subject_resources')
              .insert(resourceData);
        if (error) throw error;
      }
      
      toast({
        title: uploadedFiles.length > 1 ? 'Resources created' : (resource ? 'Resource updated' : 'Resource created'),
        description: uploadedFiles.length > 1
          ? `${uploadedFiles.length} files uploaded successfully.`
          : (resource ? 'The resource has been updated successfully.' : 'The resource has been created successfully.'),
      });
      
      form.reset();
      setUploadedFiles([]);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to save resource. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {resource ? 'Edit Learning Resource' : 'Add Learning Resource'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter resource title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter resource description" 
                      {...field} 
                      rows={3}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="resource_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="link">External Link</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="worksheet">Worksheet</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* File upload section with improved UI */}
            <div className="space-y-4">
              <div>
                <FormLabel>Upload PDF File(s)</FormLabel>
                <div className="mt-1 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-700 p-6 flex flex-col items-center">
                  {uploadedFiles.length > 0 ? (
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <File className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium">{uploadedFiles.length === 1 ? uploadedFiles[0].name : `${uploadedFiles.length} files selected`}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearFileInput}
                          className="h-7 w-7 p-0"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove files</span>
                        </Button>
                      </div>
                      
                      {isUploading && (
                        <div className="space-y-1">
                          <Progress value={uploadProgress} className="h-2" />
                          <p className="text-xs text-center text-muted-foreground">
                            {uploadProgress < 100 ? 'Uploading...' : 'Upload complete!'}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2"
                          >
                            Choose File(s)
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Upload one or more PDF files
                          </p>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="h-px bg-muted flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px bg-muted flex-1" />
            </div>
            
            <FormField
              control={form.control}
              name="external_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter external URL" 
                      type="url" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    You can provide either a file upload or an external URL
                  </p>
                </FormItem>
              )}
            />
            
            <input type="hidden" {...form.register("subject_id")} />
            <input type="hidden" {...form.register("chapter_id")} />
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isUploading}
                className="gradient-primary"
              >
                {(isSubmitting || isUploading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {resource ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    {resource ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Update Resource
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Save Resource
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
