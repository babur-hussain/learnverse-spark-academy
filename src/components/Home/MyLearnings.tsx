
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/UI/button';
import { Book, BookOpen, LogIn } from 'lucide-react';
import AuthDialog from '@/components/Auth/AuthDialog';

const MyLearnings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);
  
  // Mock data for enrolled courses
  const enrolledCourses = [
    {
      id: 1,
      title: "Mathematics",
      progress: 65,
      lastAccessed: "2 days ago"
    },
    {
      id: 2,
      title: "Physics",
      progress: 30,
      lastAccessed: "1 week ago"
    }
  ];

  if (!user) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">Your Learning Journey</h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
              Sign in to track your progress across all your courses.
            </p>
            <div className="mt-6">
              <Button 
                onClick={() => setAuthDialogOpen(true)}
                className="gradient-primary flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In to Access Your Courses</span>
              </Button>
            </div>
          </div>
          
          <AuthDialog 
            open={authDialogOpen} 
            onOpenChange={setAuthDialogOpen} 
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Learning Journey</h2>
          <Button 
            variant="outline"
            onClick={() => navigate('/catalog')}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>View All Courses</span>
          </Button>
        </div>
        
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition dark:bg-gray-800">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg dark:text-white">{course.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Last accessed: {course.lastAccessed}</p>
                    </div>
                    <div className="bg-learn-purple/10 dark:bg-purple-900/30 p-2 rounded-full">
                      <Book className="h-5 w-5 text-learn-purple dark:text-purple-300" />
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium dark:text-gray-200">Progress</span>
                      <span className="dark:text-gray-300">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-learn-purple dark:bg-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      onClick={() => navigate(`/course/${course.id}`)}
                      variant="ghost"
                      className="w-full justify-between hover:bg-learn-purple/5 dark:hover:bg-purple-900/30 dark:text-gray-200"
                    >
                      <span>Continue Learning</span>
                      <span>→</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">You haven't enrolled in any courses yet.</p>
            <Button 
              onClick={() => navigate('/catalog')}
              className="gradient-primary"
            >
              Browse Courses
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyLearnings;
