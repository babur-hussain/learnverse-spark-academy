
import React from 'react';
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
import { Textarea } from '@/components/UI/textarea';
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
import { Grid3X3, BookOpen, Code, Video, Calculator, PenTool, ChartBar, Languages } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import slugify from 'slugify';

interface Category {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  is_public: boolean;
  order_index: number;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onSuccess: () => void;
}

const iconOptions = [
  { value: 'ChartBar', label: 'Chart Bar', icon: <ChartBar className="h-4 w-4" /> },
  { value: 'Grid3X3', label: 'Grid', icon: <Grid3X3 className="h-4 w-4" /> },
  { value: 'Code', label: 'Code', icon: <Code className="h-4 w-4" /> },
  { value: 'PenTool', label: 'Pen Tool', icon: <PenTool className="h-4 w-4" /> },
  { value: 'Calculator', label: 'Calculator', icon: <Calculator className="h-4 w-4" /> },
  { value: 'Languages', label: 'Languages', icon: <Languages className="h-4 w-4" /> },
  { value: 'Video', label: 'Video', icon: <Video className="h-4 w-4" /> },
  { value: 'BookOpen', label: 'Book', icon: <BookOpen className="h-4 w-4" /> },
];

const colorOptions = [
  { value: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300', label: 'Blue' },
  { value: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300', label: 'Green' },
  { value: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300', label: 'Red' },
  { value: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300', label: 'Yellow' },
  { value: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300', label: 'Purple' },
  { value: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300', label: 'Pink' },
  { value: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300', label: 'Indigo' },
];

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  is_public: z.boolean().default(true),
});

export function CategoryDialog({ open, onOpenChange, category, onSuccess }: CategoryDialogProps) {
  const { toast } = useToast();
  const isEditing = !!category?.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      icon: category?.icon || null,
      color: category?.color || null,
      is_active: category?.is_active ?? true,
      is_public: category?.is_public ?? true,
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('name', value);
    if (!isEditing) {
      form.setValue('slug', slugify(value, { lower: true }));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing) {
        console.log('Updating category:', values);
        const { error } = await supabase
          .from('categories')
          .update({
            name: values.name,
            slug: values.slug,
            description: values.description,
            icon: values.icon,
            color: values.color,
            is_active: values.is_active,
            is_public: values.is_public,
          })
          .eq('id', category.id);

        if (error) throw error;
        toast({
          title: 'Category updated',
          description: 'The category has been successfully updated.',
        });
      } else {
        // Get the highest order_index
        const { data: maxOrderCategory, error: orderError } = await supabase
          .from('categories')
          .select('order_index')
          .order('order_index', { ascending: false })
          .limit(1);

        const nextOrderIndex = maxOrderCategory && maxOrderCategory.length > 0 ? maxOrderCategory[0].order_index + 1 : 1;
        
        console.log('Creating new category:', values, 'with order index:', nextOrderIndex);
        
        // Ensure slug is unique
        const { data: existingSlug } = await supabase
          .from('categories')
          .select('slug')
          .eq('slug', values.slug)
          .maybeSingle();
          
        if (existingSlug) {
          toast({
            title: 'Slug already exists',
            description: 'Please choose a different slug for this category.',
            variant: 'destructive',
          });
          return;
        }

        const { error, data } = await supabase
          .from('categories')
          .insert({
            name: values.name,
            slug: values.slug,
            description: values.description,
            icon: values.icon,
            color: values.color,
            is_active: values.is_active,
            is_public: values.is_public,
            order_index: nextOrderIndex,
          })
          .select();

        if (error) throw error;
        
        console.log('Category created:', data);
        toast({
          title: 'Category created',
          description: 'The category has been successfully created.',
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving category:', error);
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
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Category name" 
                      {...field} 
                      onChange={(e) => handleNameChange(e)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="category-slug" 
                      {...field} 
                    />
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
                      placeholder="Category description" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              {option.icon}
                              <span>{option.label}</span>
                            </div>
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colorOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-4 h-4 rounded-full ${option.value.split(' ')[0]}`} 
                              />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              
              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Public</FormLabel>
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
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
