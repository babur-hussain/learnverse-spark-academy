import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/UI/dialog';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/UI/form';
import { Textarea } from '@/components/UI/textarea';
import { Label } from '@/components/UI/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Subject {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  thumbnail_url: string | null;
  college_id: string | null;
  created_at: string;
  updated_at: string;
}

interface CollegeSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
  collegeId: string | null;
  onSuccess: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  thumbnail_url: z.string().optional().refine(
    (val) => !val || val.startsWith('http://') || val.startsWith('https://'),
    {
      message: 'Thumbnail URL must start with http:// or https://',
    }
  ),
});

export function CollegeSubjectDialog({ 
  open, 
  onOpenChange, 
  subject, 
  collegeId,
  onSuccess 
}: CollegeSubjectDialogProps) {
  const { toast } = useToast();
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!subject?.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      icon: '',
      thumbnail_url: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (subject) {
        form.reset({
          title: subject.title || '',
          description: subject.description || '',
          icon: subject.icon || '',
          thumbnail_url: subject.thumbnail_url || '',
        });
        if (subject.icon) {
          setIconPreview(subject.icon);
        }
      } else {
        form.reset({
          title: '',
          description: '',
          icon: '',
          thumbnail_url: '',
        });
        setIconPreview(null);
        setIconFile(null);
      }
    }
  }, [subject, open, form]);

  const uploadIcon = async (): Promise<string | null> => {
    if (!iconFile) return form.getValues('icon') || null;
    
    try {
      const fileName = `college-subject-icon-${Date.now()}-${iconFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const filePath = `college-subject-icons/${fileName}`;
      
      console.log('Starting icon upload to bucket: icons, path:', filePath);
      // Check if bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('Error checking buckets:', bucketError);
        throw bucketError;
      }
      
      if (!buckets.some(b => b.name === 'icons')) {
        console.log('Icons bucket not found, attempting to create it');
        const { error: createBucketError } = await supabase.storage.createBucket('icons', {
          public: true,
          fileSizeLimit: 1024 * 1024, // 1MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif']
        });
        
        if (createBucketError) {
          console.error('Error creating bucket:', createBucketError);
          throw createBucketError;
        }
        console.log('Bucket created successfully');
      }

      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('icons')
        .upload(filePath, iconFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      if (!uploadData || !uploadData.path) {
        throw new Error('Upload failed - no path returned');
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('icons')
        .getPublicUrl(filePath);
      
      console.log('Uploaded successfully, public URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading icon:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload icon: ' + (error.message || error.error_description || 'Unknown error'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setUploading(true);
      console.log('Subject form submission started', values);
      
      // Upload icon if there is one
      let iconUrl = null;
      if (iconFile) {
        iconUrl = await uploadIcon();
        if (!iconUrl && iconFile) {
          setUploading(false);
          return; // Stop if icon upload failed
        }
      }
      
      if (isEditing && subject) {
        // Update subject
        console.log('Updating subject:', subject.id);
        const { error } = await supabase
          .from('subjects')
          .update({
            title: values.title,
            description: values.description,
            icon: iconUrl || values.icon,
            thumbnail_url: values.thumbnail_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', subject.id);

        if (error) {
          console.error('Error updating subject:', error);
          throw error;
        }

        toast({
          title: 'Subject updated',
          description: 'The subject has been successfully updated.',
        });
      } else {
        // Create new subject
        console.log('Creating new subject');
        const { data, error } = await supabase
          .from('subjects')
          .insert({
            title: values.title,
            description: values.description,
            icon: iconUrl || values.icon,
            thumbnail_url: values.thumbnail_url,
            college_id: collegeId,
          })
          .select();

        if (error) {
          console.error('Error creating subject:', error);
          throw error;
        }

        console.log('Subject created successfully:', data);

        toast({
          title: 'Subject created',
          description: 'The subject has been successfully created.',
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating/updating subject:', error);
      toast({
        title: 'Error',
        description: error.message || error.details || 'Failed to save subject',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Subject' : 'Create Subject'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edit subject details below.' : 'Fill out the form to create a new subject for this college.'}
          </DialogDescription>
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
                    <Input placeholder="Subject title" {...field} />
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
                      placeholder="Subject description" 
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
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Icon</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {iconPreview && (
                        <div className="flex items-center gap-2">
                          <img 
                            src={iconPreview} 
                            alt="Icon preview" 
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="text-sm text-gray-500">Icon preview</span>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleIconChange}
                        className="cursor-pointer"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
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
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Save Changes' : 'Create Subject'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 