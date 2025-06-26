
import React, { useState } from 'react';
<<<<<<< HEAD
import { useQuery } from '@tanstack/react-query';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/UI/table';
import { Button } from '@/components/UI/button';
import { Switch } from '@/components/UI/switch';
import { Edit, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { FeaturedCourseDialog } from './FeaturedCourseDialog';
=======
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/UI/table';
import { Button } from '@/components/UI/button';
import { Switch } from '@/components/UI/switch';
import { Badge } from '@/components/UI/badge';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Edit, Trash2, Plus, Star, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/UI/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/UI/select';
>>>>>>> main
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

<<<<<<< HEAD
interface FeaturedCourse {
  id: string;
  course_id: string;
  course: {
    title: string;
    description: string;
  };
=======
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  instructor_id: string | null;
}

interface FeaturedCourse {
  id: string;
  course_id: string;
>>>>>>> main
  is_active: boolean;
  order_index: number;
  promotional_text: string | null;
  cta_text: string;
<<<<<<< HEAD
=======
  course_title?: string;
  course_description?: string;
  course_thumbnail?: string;
>>>>>>> main
}

export function FeaturedCoursesList() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
<<<<<<< HEAD
  const [selectedCourse, setSelectedCourse] = useState<FeaturedCourse | undefined>();

  const { data: featuredCourses, isLoading, refetch } = useQuery({
    queryKey: ['admin-featured-courses'],
=======
  const [selectedFeatured, setSelectedFeatured] = useState<FeaturedCourse | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    course_id: '',
    promotional_text: '',
    cta_text: 'Learn More',
    is_active: true,
    order_index: 0
  });
  const queryClient = useQueryClient();

  const { data: featuredCourses, isLoading, refetch } = useQuery({
    queryKey: ['featured-courses'],
>>>>>>> main
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_courses')
        .select(`
          id,
          course_id,
<<<<<<< HEAD
          course:courses(title, description),
          is_active,
          order_index,
          promotional_text,
          cta_text
=======
          is_active,
          order_index,
          promotional_text,
          cta_text,
          courses:course_id (
            title,
            description,
            thumbnail_url
          )
>>>>>>> main
        `)
        .order('order_index');
      
      if (error) throw error;
<<<<<<< HEAD
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
=======
      
      return data?.map(item => ({
        ...item,
        course_title: item.courses?.title,
        course_description: item.courses?.description,
        course_thumbnail: item.courses?.thumbnail_url
      })) as FeaturedCourse[];
    }
  });

  const { data: availableCourses } = useQuery({
    queryKey: ['available-courses-for-featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, thumbnail_url')
        .order('title');
      
      if (error) throw error;
      return data as Course[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('featured_courses')
        .insert([{
          course_id: data.course_id,
          promotional_text: data.promotional_text || null,
          cta_text: data.cta_text,
          is_active: data.is_active,
          order_index: data.order_index
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Featured course added successfully"
      });
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add featured course",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: typeof formData }) => {
      const { error } = await supabase
        .from('featured_courses')
        .update({
          course_id: data.course_id,
          promotional_text: data.promotional_text || null,
          cta_text: data.cta_text,
          is_active: data.is_active,
          order_index: data.order_index
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
>>>>>>> main
      toast({
        title: "Success",
        description: "Featured course updated successfully"
      });
      refetch();
<<<<<<< HEAD
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
    
=======
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update featured course",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('featured_courses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Featured course removed successfully"
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove featured course",
        variant: "destructive"
      });
    }
  });

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('featured_courses')
      .update({ is_active: isActive })
      .eq('id', id);

>>>>>>> main
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
<<<<<<< HEAD
        description: "Featured course removed successfully"
=======
        description: "Featured course status updated"
>>>>>>> main
      });
      refetch();
    }
  };
<<<<<<< HEAD
  
  const handleAdd = () => {
    setSelectedCourse(undefined);
    setIsDialogOpen(true);
  };

=======

  const moveOrder = async (id: string, direction: 'up' | 'down') => {
    const currentItem = featuredCourses?.find(item => item.id === id);
    if (!currentItem || !featuredCourses) return;

    const newIndex = direction === 'up' 
      ? Math.max(0, currentItem.order_index - 1)
      : currentItem.order_index + 1;

    const { error } = await supabase
      .from('featured_courses')
      .update({ order_index: newIndex })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      refetch();
    }
  };

  const resetForm = () => {
    setFormData({
      course_id: '',
      promotional_text: '',
      cta_text: 'Learn More',
      is_active: true,
      order_index: featuredCourses?.length || 0
    });
    setSelectedFeatured(undefined);
  };

  const handleEdit = (featured: FeaturedCourse) => {
    setSelectedFeatured(featured);
    setFormData({
      course_id: featured.course_id,
      promotional_text: featured.promotional_text || '',
      cta_text: featured.cta_text,
      is_active: featured.is_active,
      order_index: featured.order_index
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (selectedFeatured) {
      updateMutation.mutate({ id: selectedFeatured.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const filteredFeatured = featuredCourses?.filter(featured => 
    featured.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    featured.promotional_text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

>>>>>>> main
  if (isLoading) {
    return <div>Loading featured courses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Featured Courses</h2>
<<<<<<< HEAD
        <Button onClick={handleAdd}>Add Featured Course</Button>
=======
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Featured Course
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search featured courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-lg"
        />
>>>>>>> main
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
<<<<<<< HEAD
            <TableHead>Order</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>CTA Text</TableHead>
=======
            <TableHead>Course</TableHead>
            <TableHead>Promotional Text</TableHead>
            <TableHead>CTA Text</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
>>>>>>> main
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
<<<<<<< HEAD
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
=======
          {filteredFeatured?.map((featured) => (
            <TableRow key={featured.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {featured.course_thumbnail && (
                    <img 
                      src={featured.course_thumbnail} 
                      alt={featured.course_title} 
                      className="h-8 w-8 rounded object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{featured.course_title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {featured.course_description}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs truncate">
                  {featured.promotional_text || '—'}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{featured.cta_text}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span>{featured.order_index + 1}</span>
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveOrder(featured.id, 'up')}
                      disabled={featured.order_index === 0}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveOrder(featured.id, 'down')}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Switch
                  checked={featured.is_active}
                  onCheckedChange={(checked) => toggleActive(featured.id, checked)}
                />
              </TableCell>
>>>>>>> main
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
<<<<<<< HEAD
                        Are you sure you want to remove "{featured.course.title}" from featured courses? This action cannot be undone.
=======
                        Are you sure you want to remove "{featured.course_title}" from featured courses?
>>>>>>> main
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
<<<<<<< HEAD
                      <AlertDialogAction onClick={() => handleDelete(featured.id)}>Remove</AlertDialogAction>
=======
                      <AlertDialogAction onClick={() => handleDelete(featured.id)}>
                        Remove
                      </AlertDialogAction>
>>>>>>> main
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

<<<<<<< HEAD
      <FeaturedCourseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        featuredCourse={selectedCourse}
        onSuccess={refetch}
      />
=======
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedFeatured ? 'Edit Featured Course' : 'Add Featured Course'}
            </DialogTitle>
            <DialogDescription>
              {selectedFeatured ? 'Update the featured course details.' : 'Add a new featured course to highlight on your platform.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <Select
                value={formData.course_id}
                onValueChange={(value) => setFormData({ ...formData, course_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Promotional Text</label>
              <Textarea
                placeholder="Special promotional message for this course"
                value={formData.promotional_text}
                onChange={(e) => setFormData({ ...formData, promotional_text: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Call-to-Action Text</label>
              <Input
                placeholder="Learn More"
                value={formData.cta_text}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Order Index</label>
              <Input
                type="number"
                min="0"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.course_id || !formData.cta_text}
            >
              {selectedFeatured ? 'Update' : 'Add'} Featured Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
>>>>>>> main
    </div>
  );
}
