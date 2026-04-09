
import React from 'react';
import { Button } from '@/components/UI/button';
import { Card, CardContent } from '@/components/UI/card';
import { GraduationCap, BookOpen, Users, Trophy, Calendar, Clock } from 'lucide-react';

const CollegeStudentSection = () => {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Academic Excellence",
      description: "Comprehensive courses aligned with college curriculum"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Study Groups",
      description: "Connect with peers and form study groups"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Skill Development",
      description: "Build industry-relevant skills for career success"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Flexible Schedule",
      description: "Learn at your own pace with flexible timing"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <GraduationCap className="h-4 w-4" />
            For College Students
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Accelerate Your <span className="text-indigo-600">College Journey</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Specially designed courses and resources to help college students excel in academics and prepare for successful careers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3 w-fit mb-4">
                      <div className="text-indigo-600 dark:text-indigo-400">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 dark:text-gray-100">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex gap-4">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Explore College Courses
              </Button>
              <Button variant="outline" size="lg" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                View Success Stories
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=500&h=600" 
                alt="College students studying" 
                className="rounded-2xl shadow-2xl w-full"
              />
              
              {/* Floating stats */}
              <div className="absolute -top-6 -left-6 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">95%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">50K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">College Students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollegeStudentSection;
