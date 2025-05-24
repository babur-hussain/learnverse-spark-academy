
import React from 'react';
import { Star, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';

const TrendingCoursesSection = () => {
  const courses = [
    {
      id: 1,
      title: "Start the Web Design Course Process",
      instructor: "John Williams",
      category: "Design",
      rating: 4.9,
      students: 2500,
      duration: "12 weeks",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=300&h=200",
      badge: "Best Seller"
    },
    {
      id: 2,
      title: "Build Wireframes and Low-Fidelity Prototypes",
      instructor: "Sarah Connor", 
      category: "UX/UI",
      rating: 4.8,
      students: 1800,
      duration: "8 weeks",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=300&h=200",
      badge: "Popular"
    },
    {
      id: 3,
      title: "Learn Professional Logo & Branding Design",
      instructor: "Mike Johnson",
      category: "Branding",
      rating: 4.7,
      students: 3200,
      duration: "10 weeks",
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=300&h=200",
      badge: "New"
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🔥</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Trending Course's
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="relative">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge 
                  className={`absolute top-3 left-3 ${
                    course.badge === 'Best Seller' ? 'bg-green-500' : 
                    course.badge === 'Popular' ? 'bg-blue-500' : 'bg-purple-500'
                  } text-white`}
                >
                  {course.badge}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 dark:text-gray-100 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      by {course.instructor}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium dark:text-gray-300">{course.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{course.students}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{course.duration}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingCoursesSection;
