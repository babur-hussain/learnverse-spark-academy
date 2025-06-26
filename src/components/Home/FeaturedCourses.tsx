import React from 'react';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Users, BookOpen } from 'lucide-react';
import { Progress } from '@/components/UI/progress';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  price: number | null;
  promotional_text?: string;
  cta_text?: string;
}

const FeaturedCourses = () => {
  const navigate = useNavigate();
  
  const { data: featuredCourses, isLoading, error } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      try {
        const { data: featuredData, error: featuredError } = await supabase
          .from('featured_courses')
          .select(`
            course_id,
            is_active,
            order_index,
            promotional_text,
            cta_text,
            courses:course_id (*)
          `)
          .eq('is_active', true)
          .order('order_index');

        if (featuredError) throw featuredError;
        
        // Validate and filter data
        const validCourses = featuredData
          ?.filter(item => item && item.courses && item.courses.title)
          ?.map((item: any) => ({
            ...item.courses,
            promotional_text: item.promotional_text,
            cta_text: item.cta_text || 'Learn More'
          })) || [];
        
        return validCourses as Course[];
      } catch (err) {
        console.error('Error fetching featured courses:', err);
        throw err;
      }
    },
  });

  const { data: subjects } = useQuery({
    queryKey: ['course-subjects-count'],
    queryFn: async () => {
      if (!featuredCourses?.length) return {};
      
      const courseIds = featuredCourses.map(course => course.id);
      
      const { data, error } = await supabase
        .from('course_subjects')
        .select('course_id, subject_id')
        .in('course_id', courseIds);
        
      if (error) throw error;
      
      // Count subjects per course
      const counts: Record<string, number> = {};
      data?.forEach(item => {
        if (item && item.course_id) {
          counts[item.course_id] = (counts[item.course_id] || 0) + 1;
        }
      });
      
      return counts;
    },
    enabled: !!featuredCourses?.length
  });

  if (error) {
    console.error('Featured courses error:', error);
    return (
      <section className="w-full py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Unable to load featured courses at this time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="w-full py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Courses</h2>
            <p className="mx-auto text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Expand your knowledge with our most popular courses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[16/9] w-full bg-gray-200 dark:bg-gray-700"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featuredCourses || featuredCourses.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Featured Courses</h2>
          <div className="flex justify-center">
            <div className="w-20 h-1 rounded-full bg-primary mb-6"></div>
          </div>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Transform your career with our expert-led courses
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course) => {
            // Additional safety check
            if (!course || !course.title) {
              return null;
            }

            return (
              <Card key={course.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg border-t-4 border-indigo-500 rounded-lg">
                <div className="aspect-[16/9] w-full bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 dark:from-indigo-500/20 dark:to-indigo-500/10 relative">
                  {course.thumbnail_url ? (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={48} className="text-indigo-500 opacity-80" />
                    </div>
                  )}
                  
                  {course.price !== null && course.price > 0 && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                      ₹{course.price}
                    </div>
                  )}
                  
                  {course.price === 0 && (
                    <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                      Free
                    </div>
                  )}
                  
                  {subjects && subjects[course.id] && (
                    <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-gray-800/80 rounded-full py-1 px-3 flex items-center gap-1 backdrop-blur-sm">
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                      <span className="text-xs font-medium">
                        {subjects[course.id]} {subjects[course.id] === 1 ? 'Subject' : 'Subjects'}
                      </span>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500 mr-1" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {course.promotional_text || course.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4 mt-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>8 weeks</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>1.2k students</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 mb-2">
                    <div className="flex justify-between items-center mb-1 text-xs font-medium">
                      <span>Popularity</span>
                      <span className="text-indigo-500">65%</span>
                    </div>
                    <Progress value={65} indicatorColor="bg-indigo-500" className="h-2" />
                  </div>
                </CardContent>
                
                <CardFooter className="p-6 pt-0">
                  <Button 
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                    onClick={() => navigate(`/catalog/course/${course.id}`)}
                  >
                    {course.cta_text || 'Learn More'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-10 text-center">
          <Button 
            variant="outline"
            size="lg"
            onClick={() => navigate('/catalog')}
            className="border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white"
          >
            Browse All Courses
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
