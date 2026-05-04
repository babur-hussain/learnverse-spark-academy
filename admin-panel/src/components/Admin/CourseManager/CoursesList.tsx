import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/UI/table';
import { Button } from '@/components/UI/button';
import { Switch } from '@/components/UI/switch';
import { Badge } from '@/components/UI/badge';
import { Edit, Trash2, Copy, Eye, EyeOff, Book, Tag, Folder } from 'lucide-react';
import apiClient from '@/integrations/api/client';
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
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  _id?: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  instructor_id: string | null;
  subscription_required: boolean;
  price: number | null;
  instructor_name?: string;
  category_id?: { id: string; name: string; slug: string } | null;
  featured?: boolean;
}

const CoursesList = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: courses, isLoading, refetch } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      try {
        // Fetch courses (using the main API which populates category_id natively)
        const response = await apiClient.get('/api/courses');
        const coursesData = response.data;

        // Fetch all profiles at once to avoid N+1 queries
        const profilesResponse = await apiClient.get('/api/admin/profiles');
        const profilesData = profilesResponse.data;
        
        const profilesMap = new Map();
        if (Array.isArray(profilesData)) {
          profilesData.forEach(p => {
            profilesMap.set(p.id || p._id, p.full_name || p.username || 'No Name');
          });
        }
        
        // Map courses with instructor names efficiently
        const enrichedCourses = coursesData.map((course: Course) => {
          let instructorName = 'No Instructor';
          if (course.instructor_id && profilesMap.has(course.instructor_id)) {
            instructorName = profilesMap.get(course.instructor_id);
          }
          
          return {
            ...course,
            id: course.id || course._id, // Normalize ID
            instructor_name: instructorName,
          };
        });
        
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
    try {
      await apiClient.put(`/api/admin/courses/${id}`, { subscription_required: value });
      toast({
        title: "Success",
        description: "Course updated successfully"
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive"
      });
    }
  };

  const togglePaid = async (id: string, value: boolean) => {
    try {
      await apiClient.put(`/api/admin/courses/${id}`, { 
        subscription_required: value,
        price: value ? 499 : 0 // Default price for paid courses
      });
      toast({
        title: "Success",
        description: "Course updated successfully"
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive"
      });
    }
  };

  const toggleFeatured = async (id: string, value: boolean) => {
    try {
      await apiClient.put(`/api/admin/courses/${id}`, { featured: value });
      toast({
        title: "Success",
        description: "Course updated successfully"
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete the course (resources will be handled by backend cleanup hooks if configured)
      await apiClient.delete(`/api/admin/courses/${id}`);
      toast({
        title: "Success",
        description: "Course deleted successfully"
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive"
      });
    }
  };
  
  const handleClone = async (course: Course) => {
    try {
      const { title, description, thumbnail_url, instructor_id, subscription_required } = course;
      await apiClient.post('/api/admin/courses', {
        title: `${title} (Copy)`,
        description,
        thumbnail_url,
        instructor_id,
        subscription_required
      });
      
      toast({
        title: "Success",
        description: "Course cloned successfully"
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clone course",
        variant: "destructive"
      });
    }
  };
  
  const handleAdd = () => {
    setSelectedCourse(undefined);
    setIsDialogOpen(true);
  };

  const filteredCourses = courses?.filter((course: Course) => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading courses...</div>;
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
      
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Paid Course</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No courses found.
                </TableCell>
              </TableRow>
            ) : null}
            {filteredCourses?.map((course: Course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {course.thumbnail_url ? (
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title} 
                        className="h-10 w-10 rounded-md object-cover border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center border">
                        <Book className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{course.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]" title={course.description}>
                        {course.description || "No description"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{course.instructor_name}</TableCell>
                <TableCell>
                  {course.category_id ? (
                    <Badge variant="secondary" className="font-normal">
                      {course.category_id.name}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400 italic">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={course.price || 0}
                    onChange={async (e) => {
                      const newPrice = parseFloat(e.target.value);
                      await apiClient.put(`/api/admin/courses/${course.id}`, { price: newPrice });
                      refetch();
                    }}
                    className="w-24 h-8"
                    disabled={!course.subscription_required}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={course.subscription_required}
                    onCheckedChange={(checked) => togglePaid(course.id, checked)}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={!!course.featured}
                    onCheckedChange={(checked) => toggleFeatured(course.id, checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(course)} title="Edit Course">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleClone(course)} title="Clone Course">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-indigo-600" onClick={() => navigate(`/admin/course-resources/${course.id}`)} title="Manage Files & Resources">
                      <Folder className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
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
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => handleDelete(course.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CourseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        course={selectedCourse}
        onSuccess={refetch}
      />
    </div>
  );
};

export default CoursesList;

