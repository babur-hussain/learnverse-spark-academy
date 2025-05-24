
import React from 'react';
import { Button } from '@/components/UI/button';
import { CheckCircle, Users, Clock, DollarSign, Headphones, Heart } from 'lucide-react';

const OnlineEducationSection = () => {
  const features = [
    { icon: <Clock className="h-5 w-5" />, text: "20k+ Online Courses" },
    { icon: <Clock className="h-5 w-5" />, text: "Lifetime Access" },
    { icon: <DollarSign className="h-5 w-5" />, text: "Value For Money" },
    { icon: <Headphones className="h-5 w-5" />, text: "Lifetime Support" },
    { icon: <Heart className="h-5 w-5" />, text: "Community Support" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-200">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-sm font-medium">ONLINE E-LEARNING COURSE</span>
              </div>
              
              <h1 className="text-5xl font-bold leading-tight">
                Online Education
                <br />
                <span className="text-blue-200">Feels Like Real Classroom</span>
              </h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Get Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Gain Job-ready Skills</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Great Life</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-400 text-white">
                  GET STARTED
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                  OUR COURSES
                </Button>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616c95956a1?auto=format&fit=crop&q=80&w=500&h=600" 
                alt="Student with books" 
                className="rounded-3xl shadow-2xl w-full max-w-md mx-auto"
              />
              
              {/* Floating stats */}
              <div className="absolute -top-8 -left-8 bg-white text-gray-900 rounded-2xl p-4 shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">16500+</div>
                  <div className="text-sm">Total Students</div>
                </div>
              </div>
              
              <div className="absolute -bottom-8 -right-8 bg-white text-gray-900 rounded-2xl p-4 shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">7500+</div>
                  <div className="text-sm">Active Courses</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features row */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-blue-500 rounded-full p-2">
                {feature.icon}
              </div>
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OnlineEducationSection;
