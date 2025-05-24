
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
  instructor_id: z.string().optional().nullable(),
  subscription_required: z.boolean().default(false),
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
      instructor_id: '',
      subscription_required: false,
    },
  });

  // Reset form when the dialog opens with course data or when creating a new course
  useEffect(() => {
    if (open) {
      if (course) {
        form.reset({
          title: course.title || '',
          description: course.description || '',
          thumbnail_url: course.thumbnail_url || '',
          instructor_id: course.instructor_id || '',
          subscription_required: course.subscription_required ?? false,
        });
      } else {
        // Reset to default values when creating a new course
        form.reset({
          title: '',
          description: '',
          thumbnail_url: '',
          instructor_id: '',
          subscription_required: false,
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && course) {
        const { error } = await supabase
          .from('courses')
          .update({
            title: values.title,
            description: values.description,
            thumbnail_url: values.thumbnail_url,
            instructor_id: values.instructor_id,
            subscription_required: values.subscription_required,
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
            instructor_id: values.instructor_id,
            subscription_required: values.subscription_required,
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Course' : 'Create Course'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edit course details below.' : 'Fill out the form to create a new course.'}
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
                  <FormLabel>Thumbnail URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
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

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Create Course'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
