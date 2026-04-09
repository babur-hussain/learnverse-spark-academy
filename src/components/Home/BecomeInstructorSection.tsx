
import React from 'react';
import { Button } from '@/components/UI/button';
import { ArrowRight } from 'lucide-react';

const BecomeInstructorSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-200/30 to-blue-200/30 dark:from-green-800/30 dark:to-blue-800/30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium">
                Become A Instructor
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                You can join with LearnVerse as a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 underline decoration-wavy decoration-green-500">
                  instructor?
                </span>
              </h1>
            </div>
            
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg font-medium"
            >
              Drop Information <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="relative">
            <div className="relative">
              {/* Decorative dots pattern */}
              <div className="absolute -top-8 -left-8 w-32 h-32 opacity-20">
                <div className="grid grid-cols-8 gap-2">
                  {[...Array(64)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  ))}
                </div>
              </div>
              
              {/* Main illustration area */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=500" 
                  alt="Instructor teaching" 
                  className="rounded-2xl w-full"
                />
              </div>
              
              {/* Decorative arrow */}
              <div className="absolute -bottom-4 -right-4">
                <svg width="80" height="60" viewBox="0 0 80 60" className="text-green-500">
                  <path 
                    d="M10 30 Q40 10, 70 30" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    fill="none" 
                    strokeDasharray="5,5"
                  />
                  <polygon 
                    points="65,25 75,30 65,35" 
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BecomeInstructorSection;
