
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Course {
  id: string;
  title: string;
}

interface FeaturedCourse {
  id: string;
  course_id: string;
  is_active: boolean;
  promotional_text: string | null;
  cta_text: string;
}

interface FeaturedCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featuredCourse?: FeaturedCourse;
  onSuccess: () => void;
}

const formSchema = z.object({
  course_id: z.string().min(1, 'Course is required'),
  is_active: z.boolean().default(true),
  promotional_text: z.string().nullable().optional(),
  cta_text: z.string().min(1, 'CTA text is required'),
});

export function FeaturedCourseDialog({ 
  open, 
  onOpenChange, 
  featuredCourse, 
  onSuccess 
}: FeaturedCourseDialogProps) {
  const { toast } = useToast();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const isEditing = !!featuredCourse?.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course_id: featuredCourse?.course_id || '',
      is_active: featuredCourse?.is_active ?? true,
      promotional_text: featuredCourse?.promotional_text || '',
      cta_text: featuredCourse?.cta_text || 'Learn More',
    },
  });

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('title');
      
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load courses',
          variant: 'destructive',
        });
        return;
      }
      
      setCourses(data as Course[]);
    }
    
    if (open) {
      fetchCourses();
    }
  }, [open, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('featured_courses')
          .update({
            course_id: values.course_id,
            is_active: values.is_active,
            promotional_text: values.promotional_text,
            cta_text: values.cta_text,
          })
          .eq('id', featuredCourse.id);

        if (error) throw error;
        toast({
          title: 'Featured course updated',
          description: 'The featured course has been successfully updated.',
        });
      } else {
        // Get the highest order_index
        const { data: maxOrderCourse, error: orderError } = await supabase
          .from('featured_courses')
          .select('order_index')
          .order('order_index', { ascending: false })
          .limit(1)
          .single();

        const nextOrderIndex = maxOrderCourse ? maxOrderCourse.order_index + 1 : 0;

        const { error } = await supabase
          .from('featured_courses')
          .insert({
            course_id: values.course_id,
            is_active: values.is_active,
            promotional_text: values.promotional_text,
            cta_text: values.cta_text,
            order_index: nextOrderIndex,
          });

        if (error) throw error;
        toast({
          title: 'Featured course created',
          description: 'The featured course has been successfully added.',
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Featured Course' : 'Add Featured Course'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="course_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
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
              name="promotional_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotional Text</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Short promotional text" 
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
              name="cta_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CTA Text</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Call to action button text" 
                      {...field} 
                      value={field.value} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
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
                {isEditing ? 'Save Changes' : 'Add Featured Course'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
