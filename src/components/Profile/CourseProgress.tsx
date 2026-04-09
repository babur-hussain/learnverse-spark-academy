
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Progress } from '@/components/UI/progress';
import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
import { Play, BookOpen, Clock, Calendar } from 'lucide-react';
import { CourseProgress as CourseProgressType } from '@/hooks/use-profile-data';
import { useNavigate } from 'react-router-dom';

interface CourseProgressProps {
  courses: CourseProgressType[];
}

export const CourseProgress: React.FC<CourseProgressProps> = ({ courses }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleContinueCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No courses enrolled yet</p>
            <Button 
              onClick={() => navigate('/catalog')} 
              className="mt-4"
            >
              Explore Courses
            </Button>
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
          Course Progress ({courses.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                {course.course_thumbnail && (
                  <img
                    src={course.course_thumbnail}
                    alt={course.course_title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold truncate">{course.course_title}</h3>
                    <Badge className={getStatusColor(course.status)}>
                      {course.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{course.completed_lessons}/{course.total_lessons} lessons</span>
                      <span>{course.progress_percentage}% complete</span>
                    </div>
                    
                    <Progress value={course.progress_percentage} className="h-2" />
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Enrolled {new Date(course.enrollment_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last accessed {new Date(course.last_accessed).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleContinueCourse(course.course_id)}
                    size="sm"
                    className="mt-3"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Continue Learning
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
