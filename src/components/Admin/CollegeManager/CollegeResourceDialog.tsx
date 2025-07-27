import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
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
import { useQuery } from '@tanstack/react-query';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
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
  file_url: string | null;
  external_url: string | null;
  subject_id: string;
  chapter_id: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  title: string;
}

interface CollegeResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource | null;
  subjectId: string | null;
  chapterId: string | null;
  onSuccess: () => void;
}

export const CollegeResourceDialog: React.FC<CollegeResourceDialogProps> = ({
  open,
  onOpenChange,
  resource,
  subjectId,
  chapterId,
  onSuccess
}) => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!resource?.id;

  const { data: subjects = [] } = useQuery({
    queryKey: ['college-subjects-for-resource-dialog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, title')
        .not('college_id', 'is', null)
        .order('title');
        
      if (error) throw error;
      return data as Subject[];
    },
  });

  const { data: chapters = [] } = useQuery({
    queryKey: ['chapters-for-resource-dialog', subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      const { data, error } = await supabase
        .from('chapters')
        .select('id, title')
        .eq('subject_id', subjectId)
        .order('order_index');
        
      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!subjectId
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      resource_type: '',
      file_url: '',
      external_url: '',
      subject_id: subjectId || '',
      chapter_id: chapterId || '',
    },
  });

  useEffect(() => {
    if (open) {
      if (resource) {
        form.reset({
          title: resource.title || '',
          description: resource.description || '',
          resource_type: resource.resource_type || '',
          file_url: resource.file_url || '',
          external_url: resource.external_url || '',
          subject_id: resource.subject_id || '',
          chapter_id: resource.chapter_id || 'none',
        });
        setFileContent(`File: ${resource.file_name || 'No file'} (${resource.file_type || 'Unknown type'})`);
      } else {
        form.reset({
          title: '',
          description: '',
          resource_type: '',
          file_url: '',
          external_url: '',
          subject_id: subjectId || '',
          chapter_id: chapterId || 'none',
        });
        setUploadedFile(null);
        setFileContent('');
      }
    }
  }, [resource, open, form, subjectId, chapterId]);

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = uuidv4().substring(0, 8);
      const fileName = `${timestamp}-${randomId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `college-subjects/${subjectId || 'general'}/${fileName}`;
      
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
      
              // Use the manually created bucket
        const bucketName = 'college_content';

      const { error: uploadError, data } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
      
      cleanup();
      setUploadProgress(100);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
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
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 
      'image/png',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, Word document, image, or text file",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result as string);
      };
      reader.readAsText(file);
      return;
    }
    
    setFileContent(`File: ${file.name} (${file.type})`);
    
    toast({
      title: "File uploaded",
      description: `${file.name} ready for analysis`,
    });
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      let fileUrl = values.file_url || null;
      
      // If there's a file to upload, upload it first
      if (uploadedFile) {
        fileUrl = await uploadFile(uploadedFile);
      }
      
      const resourceData = {
        id: resource?.id || uuidv4(),
        title: values.title,
        description: values.description || null,
        resource_type: values.resource_type,
        file_url: fileUrl,
        external_url: values.external_url || null,
        subject_id: values.subject_id,
        chapter_id: values.chapter_id === 'none' ? null : values.chapter_id || null,
        file_name: uploadedFile?.name || resource?.file_name || null,
        file_type: uploadedFile?.type || resource?.file_type || null,
        file_size: uploadedFile?.size || resource?.file_size || null,
        is_published: true,
      };
      
      const { error } = resource 
        ? await supabase
            .from('subject_resources')
            .update(resourceData)
            .eq('id', resource.id)
        : await supabase
            .from('subject_resources')
            .insert(resourceData);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: resource ? 'Resource updated' : 'Resource created',
        description: resource 
          ? 'The resource has been updated successfully.' 
          : 'The resource has been created successfully.',
      });
      
      form.reset();
      setUploadedFile(null);
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
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Resource' : 'Create Resource'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    disabled={isEditing}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chapter_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a chapter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No chapter</SelectItem>
                      {chapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Resource title" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Resource description" 
                      className="min-h-[100px]"
                      {...field} 
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
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="link">External Link</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Upload File</label>
                <div className="mt-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    className="cursor-pointer"
                  />
                </div>
                {uploadedFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">{uploadedFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFileInput}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {isUploading && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="external_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Save Changes' : 'Create Resource'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 