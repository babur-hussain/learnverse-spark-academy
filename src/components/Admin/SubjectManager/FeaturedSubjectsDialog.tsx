
import React, { useEffect, useState } from 'react';
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
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

interface Subject {
  id: string;
  title: string;
}

interface FeaturedSubject {
  id: string;
  subject_id: string;
  is_active: boolean;
  order_index: number;
  promotional_text: string | null;
  cta_text: string | null;
}

interface FeaturedSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featuredSubject?: FeaturedSubject;
  onSuccess: () => void;
}

const formSchema = z.object({
  subject_id: z.string().min(1, 'Subject is required'),
  is_active: z.boolean().default(true),
  promotional_text: z.string().nullable().optional(),
  cta_text: z.string().nullable().optional(),
});

export function FeaturedSubjectDialog({ 
  open, 
  onOpenChange, 
  featuredSubject, 
  onSuccess 
}: FeaturedSubjectDialogProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!featuredSubject?.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject_id: featuredSubject?.subject_id || '',
      is_active: featuredSubject?.is_active ?? true,
      promotional_text: featuredSubject?.promotional_text || '',
      cta_text: featuredSubject?.cta_text || 'Learn More',
    },
  });

  // Reset form when dialog opens or featuredSubject changes
  useEffect(() => {
    if (open) {
      form.reset({
        subject_id: featuredSubject?.subject_id || '',
        is_active: featuredSubject?.is_active ?? true,
        promotional_text: featuredSubject?.promotional_text || '',
        cta_text: featuredSubject?.cta_text || 'Learn More',
      });
      fetchSubjects();
    }
  }, [open, featuredSubject, form]);

  async function fetchSubjects() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('id, title')
        .order('title');
      
      if (error) {
        throw error;
      }
      
      setSubjects(data || []);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load subjects: ' + err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      if (isEditing && featuredSubject) {
        const { error } = await supabase
          .from('featured_subjects')
          .update({
            subject_id: values.subject_id,
            is_active: values.is_active,
            promotional_text: values.promotional_text,
            cta_text: values.cta_text,
            updated_at: new Date().toISOString(),
          })
          .eq('id', featuredSubject.id);

        if (error) throw error;
        
        toast({
          title: 'Featured subject updated',
          description: 'The featured subject has been successfully updated.',
        });
      } else {
        // Calculate the next order index
        let nextOrderIndex = 1;
        
        try {
          // Fixed: Get max order_index without using single()
          const { data: maxOrderData, error: orderError } = await supabase
            .from('featured_subjects')
            .select('order_index')
            .order('order_index', { ascending: false })
            .limit(1);
            
          if (orderError) {
            console.error('Error getting max order index:', orderError);
            throw orderError;
          }
          
          // If we have results, get the max order_index + 1
          if (maxOrderData && maxOrderData.length > 0) {
            nextOrderIndex = (maxOrderData[0].order_index || 0) + 1;
          }
        } catch (orderErr) {
          console.error('Error calculating order index:', orderErr);
          // Continue with default value if there's an error
        }

        console.log('Creating featured subject with order index:', nextOrderIndex);

        const { error } = await supabase
          .from('featured_subjects')
          .insert({
            subject_id: values.subject_id,
            is_active: values.is_active,
            promotional_text: values.promotional_text,
            cta_text: values.cta_text,
            order_index: nextOrderIndex,
          });

        if (error) throw error;
        
        toast({
          title: 'Featured subject added',
          description: 'The subject has been successfully added to featured subjects.',
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving featured subject:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while saving',
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
            {isEditing ? 'Edit Featured Subject' : 'Add Featured Subject'}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subject_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isSubmitting}
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
                name="promotional_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotional Text</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Short promotional text" 
                        {...field} 
                        value={field.value || ''} 
                        disabled={isSubmitting}
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
                        value={field.value || 'Learn More'} 
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Saving...' : 'Adding...'}
                    </>
                  ) : (
                    isEditing ? 'Save Changes' : 'Add To Featured'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
