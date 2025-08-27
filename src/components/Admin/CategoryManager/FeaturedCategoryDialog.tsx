
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

interface Category {
  id: string;
  name: string;
}

interface FeaturedCategory {
  id: string;
  category_id: string;
  category: {
    name: string;
    slug: string;
  };
  order_index: number;
  is_active: boolean;
  promotional_text: string | null;
  cta_text: string | null;
}

interface FeaturedCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featuredCategory?: FeaturedCategory;
  onSuccess: () => void;
}

const formSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  is_active: z.boolean().default(true),
  promotional_text: z.string().nullable().optional(),
  cta_text: z.string().nullable().optional(),
});

export function FeaturedCategoryDialog({ 
  open, 
  onOpenChange, 
  featuredCategory, 
  onSuccess 
}: FeaturedCategoryDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();
  const isEditing = !!featuredCategory?.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_id: featuredCategory?.category_id || '',
      is_active: featuredCategory?.is_active ?? true,
      promotional_text: featuredCategory?.promotional_text || '',
      cta_text: featuredCategory?.cta_text || 'Explore',
    },
  });

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load categories',
          variant: 'destructive',
        });
        return;
      }
      
      setCategories(data as Category[]);
    }
    
    if (open) {
      fetchCategories();
    }
  }, [open, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('featured_categories')
          .update({
            category_id: values.category_id,
            is_active: values.is_active,
            promotional_text: values.promotional_text,
            cta_text: values.cta_text,
          })
          .eq('id', featuredCategory.id);

        if (error) throw error;
        toast({
          title: 'Featured category updated',
          description: 'The featured category has been successfully updated.',
        });
      } else {
        // Get the highest order_index
        const { data: maxOrderCategory, error: orderError } = await supabase
          .from('featured_categories')
          .select('order_index')
          .order('order_index', { ascending: false })
          .limit(1)
          .single();

        const nextOrderIndex = maxOrderCategory ? maxOrderCategory.order_index + 1 : 1;

        const { error } = await supabase
          .from('featured_categories')
          .insert({
            category_id: values.category_id,
            is_active: values.is_active,
            promotional_text: values.promotional_text,
            cta_text: values.cta_text,
            order_index: nextOrderIndex,
          });

        if (error) throw error;
        toast({
          title: 'Featured category created',
          description: 'The featured category has been successfully created.',
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
            {isEditing ? 'Edit Featured Category' : 'Add Featured Category'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
                      value={field.value || 'Explore'} 
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
                {isEditing ? 'Save Changes' : 'Add To Featured'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
