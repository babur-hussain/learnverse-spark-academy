
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/UI/dialog';
import { Button } from '@/components/UI/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/table';
import { Input } from '@/components/UI/input';
import { Checkbox } from '@/components/UI/checkbox';
import { Plus, Minus } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CourseCategory {
  id: string;
  course_id: string;
  category_id: string;
  category_name?: string;
}

interface CourseCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
}

export function CourseCategoriesDialog({ 
  open, 
  onOpenChange, 
  courseId,
  courseTitle
}: CourseCategoriesDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  
  const { data: courseCategories, isLoading: isLoadingCourseCategories } = useQuery({
    queryKey: ['course-categories', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select(`
          id,
          course_id,
          category_id,
          categories:category_id (name)
        `)
        .eq('course_id', courseId);
      
      if (error) throw error;
      
      return data?.map(item => ({
        ...item,
        category_name: item.categories?.name
      })) as CourseCategory[];
    },
    enabled: open && !!courseId,
  });

  const { data: availableCategories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['available-categories', courseId],
    queryFn: async () => {
      const { data: existingCategoryIds } = await supabase
        .from('course_categories')
        .select('category_id')
        .eq('course_id', courseId);

      const alreadyAddedIds = existingCategoryIds?.map(item => item.category_id) || [];

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Filter out categories that are already added
      return (data as Category[]).filter(
        category => !alreadyAddedIds.includes(category.id)
      );
    },
    enabled: open && !!courseId,
  });

  const addCategoriesMutation = useMutation({
    mutationFn: async (categoryIds: string[]) => {
      const newCourseCategories = categoryIds.map(categoryId => ({
        course_id: courseId,
        category_id: categoryId,
      }));
      
      const { error } = await supabase
        .from('course_categories')
        .insert(newCourseCategories);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-categories', courseId] });
      queryClient.invalidateQueries({ queryKey: ['available-categories', courseId] });
      setSelectedCategoryIds([]);
      toast({
        title: 'Categories added',
        description: 'The categories have been added to the course.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add categories',
        variant: 'destructive',
      });
    }
  });

  const removeCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('course_categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-categories', courseId] });
      queryClient.invalidateQueries({ queryKey: ['available-categories', courseId] });
      toast({
        title: 'Category removed',
        description: 'The category has been removed from the course.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove category',
        variant: 'destructive',
      });
    }
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleAddCategories = () => {
    if (selectedCategoryIds.length > 0) {
      addCategoriesMutation.mutate(selectedCategoryIds);
    }
  };

  const handleRemoveCategory = (id: string) => {
    removeCategoryMutation.mutate(id);
  };

  const filteredCategories = availableCategories?.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Course Categories</DialogTitle>
          <DialogDescription>
            Add or remove categories for "{courseTitle}"
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="current">
          <TabsList className="mb-4">
            <TabsTrigger value="current">
              Current Categories ({courseCategories?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="add">
              Add Categories ({availableCategories?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            {isLoadingCourseCategories ? (
              <div className="py-4 text-center">Loading categories...</div>
            ) : courseCategories?.length === 0 ? (
              <div className="py-4 text-center">
                No categories added to this course yet. Use the "Add Categories" tab to add some.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseCategories?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.category_name}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveCategory(item.id)}
                        >
                          <Minus className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="add">
            <div className="mb-4">
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isLoadingCategories ? (
              <div className="py-4 text-center">Loading categories...</div>
            ) : filteredCategories?.length === 0 ? (
              <div className="py-4 text-center">
                No categories available to add. All categories are already added or none match your search.
              </div>
            ) : (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories?.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedCategoryIds.includes(category.id)}
                            onCheckedChange={() => handleCategorySelect(category.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="max-w-sm truncate">{category.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={handleAddCategories}
                    disabled={selectedCategoryIds.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Selected Categories
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
