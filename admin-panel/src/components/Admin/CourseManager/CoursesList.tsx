import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/UI/table';
import { Button } from '@/components/UI/button';
import { Switch } from '@/components/UI/switch';
import { Badge } from '@/components/UI/badge';
import { Edit, Trash2, Copy, Eye, EyeOff, Book, Tag, Folder, Upload, ImageIcon, X } from 'lucide-react';
import apiClient from '@/integrations/api/client';
import { useToast } from '@/hooks/use-toast';
import { CourseDialog } from './CourseDialog';
import { uploadFileToS3 } from '@/integrations/s3/upload';
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
  banner_url?: string | null;
  instructor_id: string | null;
  subscription_required: boolean;
  price: number | null;
  instructor_name?: string;
  category_id?: { id: string; name: string; slug: string } | null;
  featured?: boolean;
}

// ─── Drag & Drop Image Zone ──────────────────────────────────────────────────
interface DropZoneProps {
  label: string;
  currentUrl: string | null | undefined;
  aspectRatio?: string; // e.g. "16/9" or "1/1"
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  uploading: boolean;
  width?: string;
  height?: string;
}

function DropZone({ label, currentUrl, aspectRatio = '1/1', onUpload, onRemove, uploading, width = '100%', height }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) return; // 10MB max
    
    await onUpload(file);
  }, [onUpload]);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && file.type.startsWith('image/')) {
        await onUpload(file);
      }
    };
    input.click();
  }, [onUpload]);

  const is16by9 = aspectRatio === '16/9';

  if (currentUrl) {
    return (
      <div className="relative group" style={{ width, aspectRatio }}>
        <img 
          src={currentUrl.replace(/\+/g, '%2B')} 
          alt={label} 
          className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
          style={{ aspectRatio }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        />
        {/* Removed hover overlay as per user request to always show the banner without obscuring it */}
        {/* Remove button */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
        >
          <X className="h-3 w-3" />
        </button>
        {uploading && (
          <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        {isDragOver && (
          <div className="absolute inset-0 bg-indigo-500/30 border-2 border-dashed border-indigo-400 rounded-lg flex items-center justify-center">
            <Upload className="h-5 w-5 text-indigo-600" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        relative rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1
        ${isDragOver 
          ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }
        ${uploading ? 'pointer-events-none opacity-60' : ''}
      `}
      style={{ width, aspectRatio, minHeight: is16by9 ? '60px' : '56px' }}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {uploading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
      ) : (
        <>
          <ImageIcon className={`${is16by9 ? 'h-5 w-5' : 'h-4 w-4'} text-gray-400`} />
          <span className="text-[10px] text-gray-400 font-medium text-center leading-tight px-1">{label}</span>
        </>
      )}
    </div>
  );
}

// ─── Price Input Component ──────────────────────────────────────────────────
function PriceInput({ course, onSave }: { course: Course, onSave: (id: string, price: number) => void }) {
  const [price, setPrice] = useState(course.price || 0);

  useEffect(() => {
    setPrice(course.price || 0);
  }, [course.price]);

  const handleSave = () => {
    if (price !== course.price) {
      onSave(course.id, price);
    }
  };

  return (
    <Input
      type="number"
      value={price}
      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSave();
          (e.target as HTMLInputElement).blur();
        }
      }}
      className="w-24 h-8"
    />
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
const CoursesList = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingStates, setUploadingStates] = useState<Record<string, { icon?: boolean; banner?: boolean }>>({});
  // Local blob previews for instant feedback before refetch completes
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/admin/profiles');
        return response.data;
      } catch (error) {
        console.error('Error fetching profiles:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const { data: courses, isLoading, refetch } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      try {
        // Fetch courses using the admin CRUD route
        const response = await apiClient.get('/api/admin/courses');
        const coursesData = response.data;
        
        const profilesMap = new Map();
        if (Array.isArray(profiles)) {
          profiles.forEach((p: any) => {
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
    },
    // Ensure we have profiles before mapping, or at least handle the absence
    enabled: true 
  });

  // ── Image upload & auto-save handlers ──────────────────────────────────────
  const handleImageUpload = async (courseId: string, file: File, field: 'thumbnail_url' | 'banner_url') => {
    const stateKey = field === 'thumbnail_url' ? 'icon' : 'banner';
    const previewKey = `${courseId}_${field}`;
    
    // Instantly show local preview using blob URL
    const blobUrl = URL.createObjectURL(file);
    setLocalPreviews(prev => ({ ...prev, [previewKey]: blobUrl }));

    setUploadingStates(prev => ({
      ...prev,
      [courseId]: { ...prev[courseId], [stateKey]: true }
    }));

    try {
      const folder = field === 'thumbnail_url' ? 'course-icons' : 'course-banners';
      const result = await uploadFileToS3(file, folder);
      
      // Auto-save to course
      await apiClient.put(`/api/admin/courses/${courseId}`, { [field]: result.url });
      
      toast({
        title: "✅ Saved",
        description: `Banner uploaded and saved automatically.`,
      });
      
      // After refetch completes, the server URL replaces the local preview
      await refetch();
      // Clean up local blob preview now that server data is loaded
      setLocalPreviews(prev => {
        const next = { ...prev };
        delete next[previewKey];
        return next;
      });
      URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      // On error, remove the local preview
      setLocalPreviews(prev => {
        const next = { ...prev };
        delete next[previewKey];
        return next;
      });
      URL.revokeObjectURL(blobUrl);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploadingStates(prev => ({
        ...prev,
        [courseId]: { ...prev[courseId], [stateKey]: false }
      }));
    }
  };

  const handleRemoveImage = async (courseId: string, field: 'thumbnail_url' | 'banner_url') => {
    const previewKey = `${courseId}_${field}`;
    // Instantly clear local preview
    setLocalPreviews(prev => {
      const next = { ...prev };
      delete next[previewKey];
      return next;
    });
    try {
      await apiClient.put(`/api/admin/courses/${courseId}`, { [field]: null });
      toast({
        title: "Removed",
        description: `Banner removed.`,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove image",
        variant: "destructive"
      });
    }
  };

  const togglePaid = async (id: string, value: boolean) => {
    try {
      await apiClient.put(`/api/admin/courses/${id}`, { 
        subscription_required: value,
        price: value ? 499 : 0
      });
      toast({ title: "Success", description: "Course updated successfully" });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update course", variant: "destructive" });
    }
  };

  const toggleFeatured = async (id: string, value: boolean) => {
    try {
      await apiClient.put(`/api/admin/courses/${id}`, { featured: value });
      toast({ title: "Success", description: "Course updated successfully" });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update course", variant: "destructive" });
    }
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/admin/courses/${id}`);
      toast({ title: "Success", description: "Course deleted successfully" });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete course", variant: "destructive" });
    }
  };
  
  const handleClone = async (course: Course) => {
    try {
      const { title, description, thumbnail_url, banner_url, instructor_id, subscription_required } = course;
      await apiClient.post('/api/admin/courses', {
        title: `${title} (Copy)`,
        description,
        thumbnail_url,
        banner_url,
        instructor_id,
        subscription_required
      });
      toast({ title: "Success", description: "Course cloned successfully" });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to clone course", variant: "destructive" });
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
      
      {/* Hint */}
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg px-3 py-2 border border-indigo-100 dark:border-indigo-800/30">
        <Upload className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
        <span>Drag & drop images onto the Banner area to upload and auto-save. Banners use 16:9 aspect ratio.</span>
      </div>

      <div className="rounded-md border bg-white dark:bg-gray-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead className="w-[200px]">Banner (16:9)</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No courses found.
                </TableCell>
              </TableRow>
            ) : null}
            {filteredCourses?.map((course: Course) => {
              const uploadState = uploadingStates[course.id] || {};
              return (
                <TableRow key={course.id} className="group">

                  {/* Course Info */}
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{course.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]" title={course.description}>
                        {course.description || "No description"}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{course.instructor_name}</span>
                        {course.category_id ? (
                          <Badge variant="secondary" className="font-normal text-[10px] px-1.5 py-0">
                            {course.category_id.name}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  {/* Banner Drop Zone (16:9) */}
                  <TableCell className="py-2">
                    <DropZone
                      label="Drop 16:9 banner"
                      currentUrl={
                        localPreviews[`${course.id}_banner_url`] || 
                        course.banner_url || 
                        course.thumbnail_url || 
                        (course as any).thumbnailUrl
                      }
                      aspectRatio="16/9"
                      width="180px"
                      uploading={!!uploadState.banner}
                      onUpload={(file) => handleImageUpload(course.id, file, 'banner_url')}
                      onRemove={() => handleRemoveImage(course.id, 'banner_url')}
                    />
                  </TableCell>
                  {/* Price */}
                  <TableCell>
                    <PriceInput
                      course={course}
                      onSave={async (id, newPrice) => {
                        await apiClient.put(`/api/admin/courses/${id}`, { price: newPrice });
                        refetch();
                      }}
                    />
                  </TableCell>
                  {/* Paid Toggle */}
                  <TableCell>
                    <Switch
                      checked={course.subscription_required}
                      onCheckedChange={(checked) => togglePaid(course.id, checked)}
                    />
                  </TableCell>
                  {/* Featured Toggle */}
                  <TableCell>
                    <Switch
                      checked={!!course.featured}
                      onCheckedChange={(checked) => toggleFeatured(course.id, checked)}
                    />
                  </TableCell>
                  {/* Actions */}
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
              );
            })}
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
