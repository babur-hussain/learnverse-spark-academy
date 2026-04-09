
import React from 'react';
import { Button } from '@/components/UI/button';
import { Play, BookOpen } from 'lucide-react';
import Scene3D from './3D/Scene3D';

const Enhanced3DHero = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                🚀 Transform Your Learning Experience
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Master Skills with
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600">
                  Interactive 3D Learning
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg">
                Experience the future of education with our immersive 3D learning environment. 
                From programming to mathematics, explore subjects like never before.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Learning
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-purple-400 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">50K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">3D Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">98%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="h-96 lg:h-[500px] relative">
              <Scene3D model="computer" className="absolute inset-0" />
              
              {/* Floating elements */}
              <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium dark:text-gray-200">Live Session</span>
                </div>
              </div>
              
              <div className="absolute bottom-8 left-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Progress</div>
                <div className="text-lg font-bold dark:text-gray-200">87%</div>
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                  <div className="w-4/5 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Enhanced3DHero;
