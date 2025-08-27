
import React from 'react';
import { Button } from '@/components/UI/button';
import { Card, CardContent } from '@/components/UI/card';
import { Target, Users, Award, TrendingUp, CheckCircle } from 'lucide-react';

const CareerReadinessSection = () => {
  const steps = [
    {
      step: "01",
      title: "Skill Assessment",
      description: "Evaluate your current skills and identify areas for improvement",
      color: "text-blue-600"
    },
    {
      step: "02", 
      title: "Personalized Learning",
      description: "Get customized learning paths based on your career goals",
      color: "text-purple-600"
    },
    {
      step: "03",
      title: "Industry Projects",
      description: "Work on real-world projects to build your portfolio",
      color: "text-green-600"
    },
    {
      step: "04",
      title: "Career Placement",
      description: "Get connected with top employers and job opportunities",
      color: "text-orange-600"
    }
  ];

  const stats = [
    { icon: <Users className="h-6 w-6" />, value: "15K+", label: "Students Placed" },
    { icon: <Award className="h-6 w-6" />, value: "500+", label: "Partner Companies" },
    { icon: <TrendingUp className="h-6 w-6" />, value: "92%", label: "Placement Rate" },
    { icon: <Target className="h-6 w-6" />, value: "₹8.5L", label: "Average Package" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Your Journey to <span className="text-blue-400">Career Success</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            From learning to landing your dream job - we guide you through every step of your career journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className={`${step.color} text-2xl font-bold min-w-[60px]`}>
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </div>
              </div>
            ))}
            
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white mt-8">
              Start Your Journey
            </Button>
          </div>

          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=500&h=600" 
              alt="Professional success" 
              className="rounded-3xl shadow-2xl w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-3xl"></div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-blue-400 mb-3 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CareerReadinessSection;
