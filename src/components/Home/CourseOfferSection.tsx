
import React from 'react';
import { Button } from '@/components/UI/button';
import { Card, CardContent } from '@/components/UI/card';
import { Star, Clock, Users, BookOpen } from 'lucide-react';

const CourseOfferSection = () => {
  const courses = [
    {
      id: 1,
      title: "Data Science and Machine Learning with Python - Beginners",
      instructor: "John Williams",
      category: "Science",
      rating: 4.9,
      reviews: 23,
      duration: "26 hr 56 mins",
      lectures: 23,
      price: 385,
      originalPrice: 449,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300&h=200"
    },
    {
      id: 2,
      title: "Create Amazing Color Schemes for Your UX Design Projects",
      instructor: "Priyanka Foster",
      category: "Science",
      rating: 4.9,
      reviews: 29,
      duration: "26 hr 56 mins",
      lectures: 23,
      price: 420,
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=300&h=200"
    },
    {
      id: 3,
      title: "Culture & Leadership: Strategies for a Successful Business",
      instructor: "Rose Simmons",
      category: "Science",
      rating: 4.9,
      reviews: 25,
      duration: "09 hr 56 mins",
      lectures: 25,
      price: 295,
      originalPrice: 340,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=300&h=200"
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            All <span className="text-green-600">Courses</span> of LearnVerse
          </h2>
          <div className="w-20 h-1 bg-green-600 mx-auto mb-8"></div>
          
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["UI/UX Design", "Development", "Data Science", "Business", "Financial"].map((category) => (
              <Button 
                key={category}
                variant={category === "UI/UX Design" ? "default" : "outline"}
                className={category === "UI/UX Design" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://images.unsplash.com/photo-${507003211169 + course.id}?auto=format&fit=crop&q=80&w=40&h=40`}
                      alt={course.instructor}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{course.instructor}</p>
                      <p className="text-xs text-green-600">{course.category}</p>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg dark:text-gray-100 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.lectures} Lectures</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm font-medium dark:text-gray-300">{course.rating}</span>
                      <span className="text-sm text-gray-500">({course.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">${course.price}.00</span>
                      {course.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">${course.originalPrice}.00</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium dark:text-gray-300">{course.rating}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
            Other Course
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CourseOfferSection;
