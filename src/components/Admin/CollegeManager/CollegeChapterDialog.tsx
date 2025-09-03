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
import { Textarea } from '@/components/UI/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/UI/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  subject_id: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: string;
  title: string;
}

interface CollegeChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter: Chapter | null;
  subjectId: string | null;
  onSuccess: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  subject_id: z.string().min(1, 'Subject is required'),
});

export function CollegeChapterDialog({ 
  open, 
  onOpenChange, 
  chapter, 
  subjectId, 
  onSuccess 
}: CollegeChapterDialogProps) {
  const { toast } = useToast();
  const isEditing = !!chapter?.id;

  const { data: subjects } = useQuery({
    queryKey: ['college-subjects-for-chapter-dialog'],
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      subject_id: subjectId || '',
    },
  });

  useEffect(() => {
    if (open) {
      if (chapter) {
        form.reset({
          title: chapter.title || '',
          description: chapter.description || '',
          subject_id: chapter.subject_id || '',
        });
      } else {
        form.reset({
          title: '',
          description: '',
          subject_id: subjectId || '',
        });
      }
    }
  }, [chapter, open, form, subjectId]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && chapter) {
        // Update chapter
        const { error } = await supabase
          .from('chapters')
          .update({
            title: values.title,
            description: values.description,
            subject_id: values.subject_id,
          })
          .eq('id', chapter.id);

        if (error) throw error;

        toast({
          title: 'Chapter updated',
          description: 'The chapter has been successfully updated.',
        });
      } else {
        // Get current highest order index for the subject
        const { data: existingChapters, error: countError } = await supabase
          .from('chapters')
          .select('order_index')
          .eq('subject_id', values.subject_id)
          .order('order_index', { ascending: false })
          .limit(1);
          
        if (countError) throw countError;
        
        const nextOrderIndex = existingChapters && existingChapters.length > 0 
          ? existingChapters[0].order_index + 1 
          : 0;
          
        // Create new chapter
        const { error } = await supabase
          .from('chapters')
          .insert({
            title: values.title,
            description: values.description,
            subject_id: values.subject_id,
            order_index: nextOrderIndex,
          });

        if (error) throw error;

        toast({
          title: 'Chapter created',
          description: 'The chapter has been successfully created.',
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating/updating chapter:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save chapter',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Chapter' : 'Create Chapter'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edit chapter details below.' : 'Fill out the form to create a new chapter.'}
          </DialogDescription>
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
                      {subjects?.map((subject) => (
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Chapter title" {...field} />
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
                      placeholder="Chapter description" 
                      className="min-h-[100px]"
                      {...field} 
                      value={field.value || ''}
                    />
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
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Create Chapter'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 