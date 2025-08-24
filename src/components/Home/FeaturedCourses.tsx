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
  banner_url?: string | null; // Added banner_url to the interface
}

const FeaturedCourses = () => {
  const navigate = useNavigate();
  
  // Always fetch featured courses first
  const { data: featuredCourses, isLoading, error } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      try {
        // Query featured_courses table and join with courses to get full course data
        const { data, error } = await supabase
          .from('featured_courses')
          .select(`
            *,
            courses (
              id,
              title,
              description,
              thumbnail_url,
              banner_url,
              price,
              currency
            )
          `)
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        
        // Transform the data to flatten the nested structure
        const transformedData = data?.map(item => ({
          id: item.courses?.id || item.course_id,
          title: item.courses?.title || 'Unknown Course',
          description: item.courses?.description || 'No description available',
          thumbnail_url: item.courses?.thumbnail_url || null,
          banner_url: item.courses?.banner_url || null,
          price: item.courses?.price || null,
          currency: item.courses?.currency || null,
          promotional_text: item.promotional_text,
          cta_text: item.cta_text
        })).filter(course => course.id) || [];
        
        // Debug logging to see what thumbnail data we're getting
        console.log('FeaturedCourses: Fetched featured courses with thumbnails:', transformedData.map(course => ({
          id: course.id,
          title: course.title,
          thumbnail_url: course.thumbnail_url,
          banner_url: course.banner_url
        })));
        
        return transformedData;
      } catch (err) {
        console.error('Error fetching featured courses:', err);
        throw err;
      }
    },
  });

  // Always fetch fallback courses (but only enable if no featured courses)
  const { data: fallbackCourses } = useQuery({
    queryKey: ['fallback-courses'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, title, description, thumbnail_url, banner_url, price, currency')
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (error) throw error;
        
        console.log('FeaturedCourses: Fallback courses with thumbnails:', data?.map(course => ({
          id: course.id,
          title: course.title,
          thumbnail_url: course.thumbnail_url,
          banner_url: course.banner_url
        })));
        
        return data || [];
      } catch (err) {
        console.error('Error fetching fallback courses:', err);
        return [];
      }
    },
    enabled: !featuredCourses || featuredCourses.length === 0
  });

  // Handle loading state
  if (isLoading) {
    return (
      <section className="w-full py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Featured Courses</h2>
            <div className="flex justify-center">
              <div className="w-20 h-1 rounded-full bg-primary mb-6"></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Loading featured courses...</p>
          </div>
        </div>
      </section>
    );
  }

  // Handle error state
  if (error) {
    console.error('Featured courses error:', error);
    return (
      <section className="w-full py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Featured Courses</h2>
            <div className="flex justify-center">
              <div className="w-20 h-1 rounded-full bg-primary mb-6"></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Unable to load featured courses at this time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Determine which courses to display
  let coursesToDisplay = featuredCourses || [];
  let sectionTitle = "Featured Courses";
  let sectionDescription = "Transform your career with our expert-led courses";

  // If no featured courses, use fallback courses
  if (!featuredCourses || featuredCourses.length === 0) {
    console.log('FeaturedCourses: No featured courses found, using fallback courses');
    coursesToDisplay = fallbackCourses || [];
    sectionTitle = "Latest Courses";
    sectionDescription = "Explore our most recent courses";
  }

  // If still no courses, show empty state
  if (!coursesToDisplay || coursesToDisplay.length === 0) {
    return (
      <section className="w-full py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Featured Courses</h2>
            <div className="flex justify-center">
              <div className="w-20 h-1 rounded-full bg-primary mb-6"></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              No courses available at the moment. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">{sectionTitle}</h2>
          <div className="flex justify-center">
            <div className="w-20 h-1 rounded-full bg-primary mb-6"></div>
          </div>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            {sectionDescription}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coursesToDisplay.map((course) => (
            <Card key={course.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg border-t-4 border-indigo-500 rounded-lg">
              <div className="aspect-[16/9] w-full bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 dark:from-indigo-500/20 dark:to-indigo-500/10 relative">
                {course.thumbnail_url || course.banner_url ? (
                  <img 
                    src={course.thumbnail_url || course.banner_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log(`FeaturedCourses: Image failed to load for course "${course.title}":`, course.thumbnail_url || course.banner_url);
                      e.currentTarget.style.display = 'none';
                      // Show fallback when image fails to load
                      const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }}
                  />
                ) : null}
                
                                  {/* Fallback when no image or image fails to load */}
                  <div className={`image-fallback w-full h-full flex items-center justify-center ${(course.thumbnail_url || course.banner_url) ? 'hidden' : ''}`}>
                    <img 
                      src="/course-placeholder.svg" 
                      alt="Course placeholder" 
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                
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
                  {course.description || 'No description available'}
                </p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button 
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                  onClick={() => navigate(`/catalog/course/${course.id}`)}
                >
                  Learn More
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button 
            variant="outline"
            size="lg"
            onClick={() => navigate('/all-courses')}
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
