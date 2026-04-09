
import React from 'react';
import { Button } from '@/components/UI/button';
import { Play, BookOpen, Users, Award } from 'lucide-react';

const OnlineSchoolSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
                New Platform
              </div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                Your Next
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Online School
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Learn new skills from the comfort of your home or anywhere anytime.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8">
                <BookOpen className="mr-2 h-5 w-5" />
                Enroll Now
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                <Play className="mr-2 h-5 w-5" />
                Play Video
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 transform rotate-3">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=500" 
                alt="Student with laptop" 
                className="rounded-2xl shadow-lg w-full"
              />
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium dark:text-gray-200">Top Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnlineSchoolSection;
