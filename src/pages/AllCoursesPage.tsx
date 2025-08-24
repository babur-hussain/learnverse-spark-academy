import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/UI/card';
import Navbar from '@/components/Layout/Navbar';
import { BookOpen, Star, Clock, User } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  banner_url?: string;
  thumbnail_url?: string;
  price?: number;
  currency?: string;
  instructor_id?: string;
  created_at?: string;
}

const AllCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('AllCoursesPage: Fetching courses...');
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('title');
        
        if (error) {
          console.error('AllCoursesPage: Error fetching courses:', error);
          return;
        }
        
        if (data) {
          console.log('AllCoursesPage: Fetched courses with thumbnails:', data.map(course => ({
            id: course.id,
            title: course.title,
            thumbnail_url: course.thumbnail_url,
            banner_url: course.banner_url
          })));
          setCourses(data);
        }
      } catch (err) {
        console.error('AllCoursesPage: Exception in fetchCourses:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, courseId: string) => {
    console.log(`AllCoursesPage: Image failed to load for course ${courseId}:`, e.currentTarget.src);
    e.currentTarget.style.display = 'none';
    // Show fallback when image fails to load
    const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
    if (fallback) {
      fallback.classList.remove('hidden');
    }
  };

  const renderCourseImage = (course: Course) => {
    const imageUrl = course.thumbnail_url || course.banner_url;
    
    if (imageUrl) {
      return (
        <>
          <img
            src={imageUrl}
            alt={course.title}
            className="w-full h-40 object-cover rounded-t-lg"
            onError={(e) => handleImageError(e, course.id)}
          />
          {/* Fallback when image fails to load */}
          <div className="image-fallback w-full h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center rounded-t-lg hidden">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-indigo-200 rounded-full flex items-center justify-center">
                <BookOpen size={32} className="text-indigo-500" />
              </div>
              <p className="text-xs text-indigo-500 font-medium">Course</p>
            </div>
          </div>
        </>
      );
    }
    
    // Default fallback when no image URL
    return (
      <div className="w-full h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center rounded-t-lg">
        <img 
          src="/course-placeholder.svg" 
          alt="Course placeholder" 
          className="w-full h-full object-contain p-4"
        />
      </div>
    );
  };

  const formatPrice = (price: number | null | undefined, currency: string | null | undefined) => {
    if (price === null || price === undefined) return null;
    if (price === 0) return { text: 'Free', variant: 'bg-blue-500' };
    return { 
      text: `${currency || '₹'}${price}`, 
      variant: 'bg-green-500' 
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-100 to-white">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4 mt-20">
        <h1 className="text-3xl font-bold mb-8 text-indigo-700">All Courses</h1>
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-indigo-600">Loading courses...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {courses.map((course) => {
              const priceInfo = formatPrice(course.price, course.currency);
              
              return (
                <Card
                  key={course.id}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
                  onClick={() => navigate(`/catalog/course/${course.id}`)}
                >
                  <div className="relative">
                    {renderCourseImage(course)}
                    
                    {/* Price badge */}
                    {priceInfo && (
                      <div className={`absolute top-3 right-3 ${priceInfo.variant} text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm`}>
                        {priceInfo.text}
                      </div>
                    )}
                    
                    {/* Rating badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-amber-600 px-2 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      4.8
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h2 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {course.title}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {course.description || 'No description available'}
                    </p>
                    
                    {/* Course metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>2h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>120 students</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {!loading && courses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
              <BookOpen size={40} className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Courses Available</h3>
            <p className="text-gray-500">Check back soon for new courses!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCoursesPage; 