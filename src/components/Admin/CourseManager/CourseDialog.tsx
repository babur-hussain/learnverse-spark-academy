
import React, { useEffect } from 'react';
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
import { Switch } from '@/components/UI/switch';
import { Textarea } from '@/components/UI/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { CourseResourceManager } from './CourseResourceManager';

interface Instructor {
  id: string;
  username: string;
  full_name?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  instructor_id: string | null;
  subscription_required: boolean;
  college_id?: string | null;
}

interface College {
  id: string;
  name: string;
}

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course;
  onSuccess: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  thumbnail_url: z.string().optional().nullable(),
  banner_url: z.string().optional().nullable(),
  instructor_id: z.string().optional().nullable(),
  subscription_required: z.boolean().default(false),
  college_id: z.string().optional().nullable(),
});

export function CourseDialog({ 
  open, 
  onOpenChange, 
  course, 
  onSuccess 
}: CourseDialogProps) {
  const { toast } = useToast();
  const [instructors, setInstructors] = React.useState<Instructor[]>([]);
  const isEditing = !!course?.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnail_url: '',
      banner_url: '',
      instructor_id: '',
      subscription_required: false,
      college_id: '',
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

  // Reset form when the dialog opens with course data or when creating a new course
  useEffect(() => {
    if (open) {
      if (course) {
        form.reset({
          title: course.title || '',
          description: course.description || '',
          thumbnail_url: course.thumbnail_url || '',
          banner_url: course.banner_url || '',
          instructor_id: course.instructor_id || '',
          subscription_required: course.subscription_required ?? false,
          college_id: course.college_id || '',
        });
      } else {
        // Reset to default values when creating a new course
        form.reset({
          title: '',
          description: '',
          thumbnail_url: '',
          banner_url: '',
          instructor_id: '',
          subscription_required: false,
          college_id: '',
        });
      }
    }
  }, [course, open, form]);

  useEffect(() => {
    async function fetchInstructors() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .or('role.eq.instructor,role.eq.admin')
          .order('full_name');
        
        if (error) {
          console.error('Error fetching instructors:', error);
          toast({
            title: 'Error',
            description: 'Failed to load instructors',
            variant: 'destructive',
          });
          return;
        }
        
        setInstructors(data as Instructor[]);
      } catch (error) {
        console.error('Error fetching instructors:', error);
        toast({
          title: 'Error',
          description: 'Failed to load instructors',
          variant: 'destructive',
        });
      }
    }
    
    if (open) {
      fetchInstructors();
    }
  }, [open, toast]);

  // Banner upload handler
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `banner_${Date.now()}.${fileExt}`;
    const filePath = `banners/${fileName}`;
    const { error } = await supabase.storage.from('courses').upload(filePath, file, { upsert: true });
    if (error) {
      toast({ title: 'Banner upload error', description: error.message, variant: 'destructive' });
      return;
    }
    const { data } = await supabase.storage.from('courses').getPublicUrl(filePath);
    form.setValue('banner_url', data?.publicUrl || '');
    toast({ title: 'Banner uploaded', description: 'Banner image uploaded successfully.' });
  };

  // Thumbnail upload handler
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: 'Invalid file type', 
        description: 'Please select an image file (JPEG, PNG, GIF, etc.)', 
        variant: 'destructive' 
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: 'File too large', 
        description: 'Please select an image smaller than 5MB', 
        variant: 'destructive' 
      });
      return;
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `thumbnail_${Date.now()}.${fileExt}`;
    const filePath = `thumbnails/${fileName}`;
    
    try {
      const { error } = await supabase.storage.from('courses').upload(filePath, file, { upsert: true });
      if (error) {
        toast({ title: 'Thumbnail upload error', description: error.message, variant: 'destructive' });
        return;
      }
      
      const { data } = await supabase.storage.from('courses').getPublicUrl(filePath);
      form.setValue('thumbnail_url', data?.publicUrl || '');
      toast({ title: 'Thumbnail uploaded', description: 'Thumbnail image uploaded successfully.' });
    } catch (error: any) {
      toast({ 
        title: 'Upload failed', 
        description: error.message || 'Failed to upload thumbnail', 
        variant: 'destructive' 
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && course) {
        const { error } = await supabase
          .from('courses')
          .update({
            title: values.title,
            description: values.description,
            thumbnail_url: values.thumbnail_url,
            banner_url: values.banner_url,
            instructor_id: values.instructor_id,
            subscription_required: values.subscription_required,
            college_id: values.college_id || null,
          })
          .eq('id', course.id);

        if (error) throw error;
        toast({
          title: 'Course updated',
          description: 'The course has been successfully updated.',
        });
      } else {
        const { error } = await supabase
          .from('courses')
          .insert({
            title: values.title,
            description: values.description,
            thumbnail_url: values.thumbnail_url,
            banner_url: values.banner_url,
            instructor_id: values.instructor_id || null,
            subscription_required: values.subscription_required,
            college_id: values.college_id || null, // Add college_id if present
          });

        if (error) throw error;
        toast({
          title: 'Course created',
          description: 'The course has been successfully created.',
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating/updating course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save course',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Course' : 'Create Course'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edit course details below.' : 'Fill out the form to create a new course.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <Form {...form}>
            <form id="course-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Course title" {...field} />
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
                        placeholder="Course description" 
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
                name="thumbnail_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Thumbnail</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        {field.value && (
                          <div className="relative">
                            <img 
                              src={field.value} 
                              alt="Thumbnail Preview" 
                              className="w-full h-32 object-cover rounded border" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                              onClick={() => {
                                form.setValue('thumbnail_url', '');
                                toast({ title: 'Thumbnail removed', description: 'Thumbnail has been removed.' });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleThumbnailUpload}
                            className="flex-1"
                          />
                          {field.value && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                form.setValue('thumbnail_url', '');
                                toast({ title: 'Thumbnail removed', description: 'Thumbnail has been removed.' });
                              }}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upload a thumbnail image (JPEG, PNG, GIF). Max size: 5MB.
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="banner_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Banner</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        {field.value && (
                          <img src={field.value} alt="Banner Preview" className="w-full h-32 object-cover rounded" />
                        )}
                        <Input type="file" accept="image/*" onChange={handleBannerUpload} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an instructor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.full_name || instructor.username}
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
                name="college_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College (optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a college" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colleges.map((college) => (
                          <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subscription_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Subscription Required</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter className="bg-background pt-4 pb-2 z-10 flex justify-end gap-2 mt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="course-form">
            {isEditing ? 'Save Changes' : 'Create Course'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
