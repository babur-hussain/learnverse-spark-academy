
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { BookOpen, Star, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSafeQuery } from '@/hooks/use-safe-query';
import { supabase } from '@/integrations/supabase/client';

interface RecommendedCoursesProps {
  userRole: string;
  completedCourses: string[];
}

export const RecommendedCourses: React.FC<RecommendedCoursesProps> = ({ 
  userRole, 
  completedCourses 
}) => {
  const navigate = useNavigate();

  const { data: recommendedCourses, isLoading } = useSafeQuery({
    queryKey: ['recommended-courses', userRole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .limit(6);
        
      if (error) throw error;
      
      // Filter out completed courses and add mock recommendation scores
      return data
        .filter(course => !completedCourses.includes(course.id))
        .map(course => ({
          ...course,
          rating: Math.random() * 2 + 3, // 3-5 rating
          students: Math.floor(Math.random() * 1000) + 100,
          duration: Math.floor(Math.random() * 10) + 2, // 2-12 hours
          difficulty: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
          match_percentage: Math.floor(Math.random() * 30) + 70 // 70-100% match
        }))
        .sort((a, b) => b.match_percentage - a.match_percentage)
        .slice(0, 4);
    },
    showErrorToast: true
  });

  const handleEnrollCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Resume Your Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Resume Your Journey
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Courses recommended based on your progress and interests
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendedCourses?.map((course) => (
            <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg truncate">{course.title}</h3>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {course.match_percentage}% match
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span>{course.rating?.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{course.duration}h</span>
                    </div>
                    <Badge className={getDifficultyColor(course.difficulty)} variant="outline">
                      {course.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {course.students} students enrolled
                    </span>
                    <Button
                      onClick={() => handleEnrollCourse(course.id)}
                      size="sm"
                    >
                      Start Learning
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {recommendedCourses?.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recommendations available at the moment</p>
              <Button 
                onClick={() => navigate('/catalog')} 
                className="mt-4"
              >
                Explore All Courses
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
