
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/UI/table';
import { Button } from '@/components/UI/button';
import { Switch } from '@/components/UI/switch';
import { Edit, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CategoryDialog } from './CategoryDialog';
import { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from '@/components/UI/alert-dialog';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  is_public: boolean;
  order_index: number;
  color: string | null;
}

export function CategoryList() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [categoryToDelete, setCategoryToDelete] = useState<string | undefined>(undefined);

  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data as Category[];
    }
  });

  const toggleStatus = async (id: string, field: 'is_active' | 'is_public', value: boolean) => {
    const { error } = await supabase
      .from('categories')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Category updated successfully"
      });
      refetch();
    }
  };

  const updateOrder = async (id: string, direction: 'up' | 'down') => {
    if (!categories) return;
    
    const currentIndex = categories.findIndex(cat => cat.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;
    
    const { error } = await supabase
      .from('categories')
      .update({ order_index: categories[newIndex].order_index })
      .eq('id', id);

    if (!error) {
      await supabase
        .from('categories')
        .update({ order_index: categories[currentIndex].order_index })
        .eq('id', categories[newIndex].id);
        
      refetch();
    }
  };
  
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
      refetch();
    }
  };
  
  const handleAdd = () => {
    setSelectedCategory(undefined);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Categories</h2>
        <Button onClick={handleAdd}>Add Category</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Public</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateOrder(category.id, 'up')}
                    disabled={category === categories[0]}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateOrder(category.id, 'down')}
                    disabled={category === categories[categories.length - 1]}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">
                    {category.slug || <span className="text-red-500">missing</span>}
                  </code>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={category.is_active}
                    onCheckedChange={(checked) => toggleStatus(category.id, 'is_active', checked)}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={category.is_public}
                    onCheckedChange={(checked) => toggleStatus(category.id, 'is_public', checked)}
                  />
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{category.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(category.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No categories found. Add your first category to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory}
        onSuccess={refetch}
      />
    </div>
  );
}
