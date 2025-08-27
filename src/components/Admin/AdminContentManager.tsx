
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/UI/dropdown-menu';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Plus, 
  Search, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Upload,
  Download,
  Star,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string | null;
  created_at: string;
  instructor_name?: string;
  student_count?: number;
}

interface VideoData {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  course_id: string | null;
  created_at: string;
  course_title?: string;
  view_count?: number;
}

interface Resource {
  id: string;
  title: string;
  resource_type: string;
  file_size: number | null;
  created_at: string;
  download_count?: number;
}

export const AdminContentManager = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real content statistics
  const { data: contentStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-content-stats'],
    queryFn: async () => {
      // Get total courses count
      const { count: totalCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Get total videos count
      const { count: totalVideos } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

      // Get total resources count
      const { count: totalResources } = await supabase
        .from('subject_resources')
        .select('*', { count: 'exact', head: true });

      // For now, pending review is 0 since we don't have a review system
      const pendingReview = 0;

      return {
        totalCourses: totalCourses || 0,
        totalVideos: totalVideos || 0,
        totalResources: totalResources || 0,
        pendingReview
      };
    },
    refetchInterval: 30000,
  });

  // Fetch real courses data
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['admin-courses-content'],
    queryFn: async () => {
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          instructor_id,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get instructor names
      const instructorIds = coursesData?.map(c => c.instructor_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', instructorIds);

      const instructorMap = profiles?.reduce((acc, profile) => {
        acc[profile.id] = profile.full_name;
        return acc;
      }, {} as Record<string, string>) || {};

      // Get student enrollment counts
      const courseIds = coursesData?.map(c => c.id) || [];
      const { data: enrollments } = await supabase
        .from('user_courses')
        .select('course_id')
        .in('course_id', courseIds);

      const enrollmentCounts = enrollments?.reduce((acc, enrollment) => {
        acc[enrollment.course_id] = (acc[enrollment.course_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return coursesData?.map(course => ({
        ...course,
        instructor_name: course.instructor_id ? instructorMap[course.instructor_id] || 'Unknown' : 'No Instructor',
        student_count: enrollmentCounts[course.id] || 0
      })) as Course[];
    },
    refetchInterval: 30000,
  });

  // Fetch real videos data
  const { data: videos = [], isLoading: isLoadingVideos } = useQuery({
    queryKey: ['admin-videos-content'],
    queryFn: async () => {
      const { data: videosData, error } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          description,
          duration,
          course_id,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get course titles
      const courseIds = videosData?.map(v => v.course_id).filter(Boolean) || [];
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title')
        .in('id', courseIds);

      const courseMap = coursesData?.reduce((acc, course) => {
        acc[course.id] = course.title;
        return acc;
      }, {} as Record<string, string>) || {};

      return videosData?.map(video => ({
        ...video,
        course_title: video.course_id ? courseMap[video.course_id] || 'Unknown Course' : 'No Course',
        view_count: 0 // We don't have view tracking yet
      })) as VideoData[];
    },
    refetchInterval: 30000,
  });

  // Fetch real resources data
  const { data: resources = [], isLoading: isLoadingResources } = useQuery({
    queryKey: ['admin-resources-content'],
    queryFn: async () => {
      const { data: resourcesData, error } = await supabase
        .from('subject_resources')
        .select(`
          id,
          title,
          resource_type,
          file_size,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return resourcesData?.map(resource => ({
        ...resource,
        download_count: 0 // We don't have download tracking yet
      })) as Resource[];
    },
    refetchInterval: 30000,
  });

  const contentStatsDisplay = [
    { 
      title: "Total Courses", 
      value: isLoadingStats ? "..." : contentStats?.totalCourses?.toString() || "0", 
      icon: BookOpen, 
      color: "text-blue-600" 
    },
    { 
      title: "Total Videos", 
      value: isLoadingStats ? "..." : contentStats?.totalVideos?.toString() || "0", 
      icon: Video, 
      color: "text-green-600" 
    },
    { 
      title: "Resources", 
      value: isLoadingStats ? "..." : contentStats?.totalResources?.toString() || "0", 
      icon: FileText, 
      color: "text-purple-600" 
    },
    { 
      title: "Pending Review", 
      value: isLoadingStats ? "..." : contentStats?.pendingReview?.toString() || "0", 
      icon: Clock, 
      color: "text-orange-600" 
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-green-100 text-green-800'; // Default to published
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Management</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              New Course
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Upload Video
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Add Resource
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {contentStatsDisplay.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>Manage all courses and their content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {isLoadingCourses ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading courses...</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No courses found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div className="font-medium">{course.title}</div>
                            {course.description && (
                              <div className="text-sm text-muted-foreground max-w-xs truncate">
                                {course.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{course.instructor_name}</TableCell>
                          <TableCell>{course.student_count}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor('published')} variant="secondary">
                              published
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(course.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  View Course
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit Course
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                  Delete Course
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Videos</CardTitle>
              <CardDescription>Manage video content and uploads</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingVideos ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading videos...</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Video</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVideos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No videos found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVideos.map((video) => (
                        <TableRow key={video.id}>
                          <TableCell>
                            <div className="font-medium">{video.title}</div>
                            {video.description && (
                              <div className="text-sm text-muted-foreground max-w-xs truncate">
                                {video.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{video.course_title}</TableCell>
                          <TableCell>{formatDuration(video.duration)}</TableCell>
                          <TableCell>{video.view_count}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor('published')} variant="secondary">
                              published
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(video.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  Watch Video
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                  Delete Video
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Manage downloadable resources and materials</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingResources ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading resources...</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResources.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No resources found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResources.map((resource) => (
                        <TableRow key={resource.id}>
                          <TableCell>
                            <div className="font-medium">{resource.title}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{resource.resource_type}</Badge>
                          </TableCell>
                          <TableCell>{formatFileSize(resource.file_size)}</TableCell>
                          <TableCell>{resource.download_count}</TableCell>
                          <TableCell>{formatDate(resource.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Download className="h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                  Delete Resource
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
