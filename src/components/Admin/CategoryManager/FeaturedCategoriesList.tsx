
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/UI/table';
import { Button } from '@/components/UI/button';
import { Switch } from '@/components/UI/switch';
import { Edit, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FeaturedCategoryDialog } from './FeaturedCategoryDialog';
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

export function FeaturedCategoriesList() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFeaturedCategory, setSelectedFeaturedCategory] = useState<FeaturedCategory | undefined>(undefined);

  const { data: featuredCategories, isLoading, refetch } = useQuery({
    queryKey: ['admin-featured-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_categories')
        .select(`
          id,
          category_id,
          category:categories(name, slug),
          order_index,
          is_active,
          promotional_text,
          cta_text
        `)
        .order('order_index');
      
      if (error) throw error;
      return data as FeaturedCategory[];
    }
  });

  const toggleStatus = async (id: string, value: boolean) => {
    const { error } = await supabase
      .from('featured_categories')
      .update({ is_active: value })
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
        description: "Featured category updated successfully"
      });
      refetch();
    }
  };

  const updateOrder = async (id: string, direction: 'up' | 'down') => {
    if (!featuredCategories) return;
    
    const currentIndex = featuredCategories.findIndex(cat => cat.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= featuredCategories.length) return;
    
    const { error } = await supabase
      .from('featured_categories')
      .update({ order_index: featuredCategories[newIndex].order_index })
      .eq('id', id);

    if (!error) {
      await supabase
        .from('featured_categories')
        .update({ order_index: featuredCategories[currentIndex].order_index })
        .eq('id', featuredCategories[newIndex].id);
        
      refetch();
    }
  };
  
  const handleEdit = (featuredCategory: FeaturedCategory) => {
    setSelectedFeaturedCategory(featuredCategory);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('featured_categories')
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
        description: "Featured category removed successfully"
      });
      refetch();
    }
  };
  
  const handleAdd = () => {
    setSelectedFeaturedCategory(undefined);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading featured categories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Featured Categories</h2>
        <Button onClick={handleAdd}>Add Featured Category</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>CTA Text</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {featuredCategories?.map((featured) => (
            <TableRow key={featured.id}>
              <TableCell className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateOrder(featured.id, 'up')}
                  disabled={featured === featuredCategories[0]}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateOrder(featured.id, 'down')}
                  disabled={featured === featuredCategories[featuredCategories.length - 1]}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell>{featured.category.name}</TableCell>
              <TableCell>
                <Switch
                  checked={featured.is_active}
                  onCheckedChange={(checked) => toggleStatus(featured.id, checked)}
                />
              </TableCell>
              <TableCell>{featured.cta_text || 'Explore'}</TableCell>
              <TableCell className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(featured)}>
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
                      <AlertDialogTitle>Remove Featured Category</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove "{featured.category.name}" from featured categories? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(featured.id)}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <FeaturedCategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        featuredCategory={selectedFeaturedCategory}
        onSuccess={refetch}
      />
    </div>
  );
}
