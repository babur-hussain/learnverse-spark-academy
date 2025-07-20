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
import { MultiSelect } from './MultiSelect';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Category {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  title: string;
  description: string | null;
  icon?: string | null;
  thumbnail_url?: string | null;
  categories?: { id: string, name: string }[];
}

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject | null;
  onSuccess: () => void;
}

interface College {
  id: string;
  name: string;
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
  categoryIds: z.array(z.string()).optional(),
});

// Utility to safely map over possibly undefined/null arrays
function arraySafe<T>(arr: T[] | undefined | null): T[] {
  return Array.isArray(arr) ? arr : [];
}

export function SubjectDialog({ 
  open, 
  onOpenChange, 
  subject, 
  onSuccess 
}: SubjectDialogProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!subject?.id;
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      icon: '',
      thumbnail_url: '',
      categoryIds: [],
    },
  });

  const { data: colleges = [] } = useQuery({
    queryKey: ['colleges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colleges')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as College[];
    }
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchClasses();
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
        fetchSubjectCategories(subject.id);
        fetchSubjectClass(subject.id);
      } else {
        form.reset({
          title: '',
          description: '',
          icon: '',
          thumbnail_url: '',
          categoryIds: [],
        });
        setSelectedCategoryIds([]);
        setSelectedClassId('');
        setIconPreview(null);
        setIconFile(null);
      }
    }
  }, [subject, open, form]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('is_active', true)
        .order('order_index');
      if (error) throw error;
      setClasses(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load classes',
        variant: 'destructive',
      });
    }
  };

  const fetchSubjectCategories = async (subjectId: string) => {
    try {
      const { data, error } = await supabase
        .from('content_category_mappings')
        .select('category_id')
        .eq('content_id', subjectId)
        .eq('content_type', 'subject');
      
      if (error) throw error;
      
      const categoryIds = data.map(item => item.category_id);
      setSelectedCategoryIds(categoryIds);
      form.setValue('categoryIds', categoryIds);
    } catch (error: any) {
      console.error('Error fetching subject categories:', error);
    }
  };

  const fetchSubjectClass = async (subjectId: string) => {
    try {
      const { data, error } = await supabase
        .from('class_subjects')
        .select('class_id')
        .eq('subject_id', subjectId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      setSelectedClassId(data?.class_id || '');
    } catch (error: any) {
      console.error('Error fetching subject class:', error);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadIcon = async (): Promise<string | null> => {
    if (!iconFile) return form.getValues('icon') || null;
    
    try {
      const fileName = `subject-icon-${Date.now()}-${iconFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const filePath = `subject-icons/${fileName}`;
      
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
        
        // Update categories mapping
        if (values.categoryIds && values.categoryIds.length > 0) {
          // Remove existing mappings
          const { error: deleteError } = await supabase
            .from('content_category_mappings')
            .delete()
            .eq('content_id', subject.id)
            .eq('content_type', 'subject');
          
          if (deleteError) {
            console.error('Error deleting category mappings:', deleteError);
          }
          
          // Add new mappings
          const mappings = values.categoryIds.map(categoryId => ({
            content_id: subject.id,
            category_id: categoryId,
            content_type: 'subject'
          }));
          
          const { error: mappingError } = await supabase
            .from('content_category_mappings')
            .insert(mappings);
          
          if (mappingError) {
            console.error('Error creating category mappings:', mappingError);
            throw mappingError;
          }
        }

        // Update class mapping (single class)
        await supabase
          .from('class_subjects')
          .delete()
          .eq('subject_id', subject.id);
        if (selectedClassId) {
          await supabase.from('class_subjects').insert({
            class_id: selectedClassId,
            subject_id: subject.id
          });
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
            college_id: selectedCollegeId || null,
          })
          .select();

        if (error) {
          console.error('Error creating subject:', error);
          throw error;
        }

        console.log('Subject created successfully:', data);
        
        // Add category mappings if categories were selected
        if (values.categoryIds && values.categoryIds.length > 0 && data && data.length > 0) {
          const newSubjectId = data[0].id;
          console.log('Adding category mappings for new subject:', newSubjectId);
          
          const mappings = values.categoryIds.map(categoryId => ({
            content_id: newSubjectId,
            category_id: categoryId,
            content_type: 'subject'
          }));
          
          const { error: mappingError } = await supabase
            .from('content_category_mappings')
            .insert(mappings);
          
          if (mappingError) {
            console.error('Error creating category mappings:', mappingError);
            throw mappingError;
          }
        }

        // Add class mapping (single class)
        if (selectedClassId && data && data.length > 0) {
          const newSubjectId = data[0].id;
          const { error: classMapError } = await supabase.from('class_subjects').insert({
            class_id: selectedClassId,
            subject_id: newSubjectId
          });
          if (classMapError) {
            console.error('Error creating class-subject mapping:', classMapError);
            toast({
              title: 'Error',
              description: 'Failed to assign class to subject: ' + (classMapError.message || classMapError.details),
              variant: 'destructive',
            });
          } else {
            console.log('Class-subject mapping created:', { class_id: selectedClassId, subject_id: newSubjectId });
          }
        }

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

  const handleCategoryChange = (selected: string[]) => {
    setSelectedCategoryIds(selected);
    form.setValue('categoryIds', selected);
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClassId(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Subject' : 'Create Subject'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edit subject details below.' : 'Fill out the form to create a new subject.'}
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
            
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex items-center gap-4">
                {iconPreview && (
                  <div className="h-16 w-16 rounded-lg border overflow-hidden">
                    <img 
                      src={iconPreview} 
                      alt="Icon Preview" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/64';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <label 
                    htmlFor="icon-upload" 
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{iconFile ? iconFile.name : 'Upload icon'}</span>
                    <input
                      id="icon-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleIconChange}
                    />
                  </label>
                  <div className="text-xs text-muted-foreground mt-1">
                    Recommended size: 64x64px. Max size: 1MB.
                  </div>
                </div>
              </div>
            </div>
            
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

            <div>
              <FormLabel>Categories</FormLabel>
              {Array.isArray(categories) ? (
              <MultiSelect
                  options={arraySafe(categories).map(category => ({
                  value: category.id,
                  label: category.name
                }))}
                  selected={arraySafe(selectedCategoryIds)}
                onChange={handleCategoryChange}
                placeholder="Select categories"
              />
              ) : (
                <div className="p-2 text-center text-muted-foreground text-sm">Loading categories...</div>
              )}
            </div>

            <div>
              <FormLabel>Classes</FormLabel>
              {Array.isArray(classes) ? (
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={selectedClassId}
                  onChange={handleClassChange}
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              ) : (
                <div className="p-2 text-center text-muted-foreground text-sm">Loading classes...</div>
              )}
            </div>

            <div>
              <FormLabel>College (optional)</FormLabel>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={selectedCollegeId}
                onChange={e => setSelectedCollegeId(e.target.value)}
              >
                <option value="">Select a college</option>
                {colleges.map(college => (
                  <option key={college.id} value={college.id}>{college.name}</option>
                ))}
              </select>
            </div>

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
