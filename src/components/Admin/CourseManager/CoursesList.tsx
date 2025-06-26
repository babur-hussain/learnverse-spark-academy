
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/UI/table';
import { Button } from '@/components/UI/button';
import { Switch } from '@/components/UI/switch';
import { Badge } from '@/components/UI/badge';
import { Edit, Trash2, Copy, Eye, EyeOff, Book, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CourseDialog } from './CourseDialog';
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
import { Input } from '@/components/UI/input';
import { CourseSubjectsDialog } from './CourseSubjectsDialog';
import { CourseCategoriesDialog } from './CourseCategoriesDialog';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  instructor_id: string | null;
  subscription_required: boolean;
  price: number | null;
  instructor_name?: string;
  subject_count?: number;
  category_count?: number;
}

const CoursesList = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubjectsDialogOpen, setIsSubjectsDialogOpen] = useState(false);
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: courses, isLoading, refetch } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      try {
        // First fetching courses data
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select(`
            id,
            title,
            description,
            thumbnail_url,
            instructor_id,
            subscription_required,
            price
          `)
          .order('title');
        
        if (coursesError) throw coursesError;
        
        // Enrich with instructor names and subject/category counts
        const enrichedCourses = await Promise.all(
          coursesData.map(async (course) => {
            // Get instructor name
            let instructorName = 'No Instructor';
            if (course.instructor_id) {
              const { data: instructorData } = await supabase
                .from('profiles')
                .select('username, full_name')
                .eq('id', course.instructor_id)
                .single();
                
              instructorName = instructorData?.full_name || instructorData?.username || 'No Instructor';
            }
            
            // Get subject count
            const { count: subjectCount, error: subjectError } = await supabase
              .from('course_subjects')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id);
              
            // Get category count
            const { count: categoryCount, error: categoryError } = await supabase
              .from('course_categories')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id);
              
            return {
              ...course,
              instructor_name: instructorName,
              subject_count: subjectCount || 0,
              category_count: categoryCount || 0
            };
          })
        );
        
        return enrichedCourses;
      } catch (error: any) {
        console.error('Error fetching courses:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load courses",
          variant: "destructive"
        });
        return [];
      }
    }
  });

  const toggleSubscription = async (id: string, value: boolean) => {
    const { error } = await supabase
      .from('courses')
      .update({ subscription_required: value })
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
        description: "Course updated successfully"
      });
      refetch();
    }
  };

  const togglePaid = async (id: string, value: boolean) => {
    const { error } = await supabase
      .from('courses')
      .update({ 
        subscription_required: value,
        price: value ? 499 : 0 // Default price for paid courses
      })
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
        description: "Course updated successfully"
      });
      refetch();
    }
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    // First check for dependencies
    const { count: subjectCount } = await supabase
      .from('course_subjects')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', id);
      
    const { count: categoryCount } = await supabase
      .from('course_categories')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', id);
      
    // Confirm with the user if there are dependencies
    if (subjectCount > 0 || categoryCount > 0) {
      const confirmDelete = window.confirm(
        `This course has ${subjectCount} subjects and ${categoryCount} categories associated with it. These associations will be deleted. Are you sure you want to proceed?`
      );
      
      if (!confirmDelete) return;
    }
    
    // Delete the course (cascade should handle dependencies)
    const { error } = await supabase
      .from('courses')
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
        description: "Course deleted successfully"
      });
      refetch();
    }
  };
  
  const handleClone = async (course: Course) => {
    const { title, description, thumbnail_url, instructor_id, subscription_required } = course;
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: `${title} (Copy)`,
        description,
        thumbnail_url,
        instructor_id,
        subscription_required
      })
      .select();
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Course cloned successfully"
      });
      refetch();
    }
  };
  
  const handleAdd = () => {
    setSelectedCourse(undefined);
    setIsDialogOpen(true);
  };
  
  const handleManageSubjects = (course: Course) => {
    setSelectedCourse(course);
    setIsSubjectsDialogOpen(true);
  };
  
  const handleManageCategories = (course: Course) => {
    setSelectedCourse(course);
    setIsCategoriesDialogOpen(true);
  };

  const filteredCourses = courses?.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Courses</h2>
        <Button onClick={handleAdd}>Add Course</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search courses by title, description, or instructor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-lg"
        />
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Paid Course</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCourses?.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {course.thumbnail_url && (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title} 
                      className="h-8 w-8 rounded object-cover"
                    />
                  )}
                  <div>
                    <div>{course.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {course.description}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{course.instructor_name}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Book className="h-3 w-3" />
                    {course.subject_count} subjects
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {course.category_count} categories
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={course.price || 0}
                  onChange={async (e) => {
                    const newPrice = parseFloat(e.target.value);
                    await supabase
                      .from('courses')
                      .update({ price: newPrice })
                      .eq('id', course.id);
                    refetch();
                  }}
                  className="w-24"
                  disabled={!course.subscription_required}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={course.subscription_required}
                  onCheckedChange={(checked) => togglePaid(course.id, checked)}
                />
              </TableCell>
              <TableCell className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(course)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleManageSubjects(course)}
                  title="Manage Subjects"
                >
                  <Book className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleManageCategories(course)}
                  title="Manage Categories"
                >
                  <Tag className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleClone(course)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Course</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{course.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(course.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CourseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        course={selectedCourse}
        onSuccess={refetch}
      />
      
      {selectedCourse && (
        <>
          <CourseSubjectsDialog
            open={isSubjectsDialogOpen}
            onOpenChange={setIsSubjectsDialogOpen}
            courseId={selectedCourse.id}
            courseTitle={selectedCourse.title}
          />
          
          <CourseCategoriesDialog
            open={isCategoriesDialogOpen}
            onOpenChange={setIsCategoriesDialogOpen}
            courseId={selectedCourse.id}
            courseTitle={selectedCourse.title}
          />
        </>
      )}
    </div>
  );
};

export default CoursesList;
