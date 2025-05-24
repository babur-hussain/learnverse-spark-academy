
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/UI/table';
import { Button } from '@/components/UI/button';
import { Switch } from '@/components/UI/switch';
import { Edit, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { FeaturedCourseDialog } from './FeaturedCourseDialog';
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

interface FeaturedCourse {
  id: string;
  course_id: string;
  course: {
    title: string;
    description: string;
  };
  is_active: boolean;
  order_index: number;
  promotional_text: string | null;
  cta_text: string;
}

export function FeaturedCoursesList() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<FeaturedCourse | undefined>();

  const { data: featuredCourses, isLoading, refetch } = useQuery({
    queryKey: ['admin-featured-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_courses')
        .select(`
          id,
          course_id,
          course:courses(title, description),
          is_active,
          order_index,
          promotional_text,
          cta_text
        `)
        .order('order_index');
      
      if (error) throw error;
      return data as FeaturedCourse[];
    }
  });

  const toggleStatus = async (id: string, value: boolean) => {
    const { error } = await supabase
      .from('featured_courses')
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
        description: "Featured course updated successfully"
      });
      refetch();
    }
  };

  const updateOrder = async (id: string, direction: 'up' | 'down') => {
    if (!featuredCourses) return;
    
    const currentIndex = featuredCourses.findIndex(course => course.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= featuredCourses.length) return;
    
    const { error } = await supabase
      .from('featured_courses')
      .update({ order_index: featuredCourses[newIndex].order_index })
      .eq('id', id);

    if (!error) {
      await supabase
        .from('featured_courses')
        .update({ order_index: featuredCourses[currentIndex].order_index })
        .eq('id', featuredCourses[newIndex].id);
        
      refetch();
    }
  };
  
  const handleEdit = (course: FeaturedCourse) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('featured_courses')
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
        description: "Featured course removed successfully"
      });
      refetch();
    }
  };
  
  const handleAdd = () => {
    setSelectedCourse(undefined);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading featured courses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Featured Courses</h2>
        <Button onClick={handleAdd}>Add Featured Course</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>CTA Text</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {featuredCourses?.map((featured) => (
            <TableRow key={featured.id}>
              <TableCell className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateOrder(featured.id, 'up')}
                  disabled={featured === featuredCourses[0]}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateOrder(featured.id, 'down')}
                  disabled={featured === featuredCourses[featuredCourses.length - 1]}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell>{featured.course.title}</TableCell>
              <TableCell>
                <Switch
                  checked={featured.is_active}
                  onCheckedChange={(checked) => toggleStatus(featured.id, checked)}
                />
              </TableCell>
              <TableCell>{featured.cta_text}</TableCell>
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
                      <AlertDialogTitle>Remove Featured Course</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove "{featured.course.title}" from featured courses? This action cannot be undone.
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

      <FeaturedCourseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        featuredCourse={selectedCourse}
        onSuccess={refetch}
      />
    </div>
  );
}
