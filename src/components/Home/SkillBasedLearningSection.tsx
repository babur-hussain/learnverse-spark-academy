
import React from 'react';
import { Button } from '@/components/UI/button';
import { Card, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Code, Palette, BarChart, Briefcase, Star, Clock } from 'lucide-react';

const SkillBasedLearningSection = () => {
  const skills = [
    {
      icon: <Code className="h-8 w-8" />,
      title: "Programming & Development",
      courses: 150,
      color: "bg-blue-500",
      popular: true
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Design & Creativity",
      courses: 89,
      color: "bg-pink-500",
      popular: false
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: "Data Science & Analytics",
      courses: 120,
      color: "bg-green-500",
      popular: true
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      title: "Business & Management",
      courses: 95,
      color: "bg-purple-500",
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Learn <span className="text-blue-600">In-Demand Skills</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Master the skills that employers are looking for. Our skill-based learning paths are designed to make you job-ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {skills.map((skill, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0">
              <CardContent className="p-6 text-center">
                {skill.popular && (
                  <Badge className="mb-4 bg-orange-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <div className={`${skill.color} rounded-full p-4 w-fit mx-auto mb-4`}>
                  <div className="text-white">
                    {skill.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 dark:text-gray-100">{skill.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{skill.courses} Courses Available</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8 Average Rating</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            View All Skills
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SkillBasedLearningSection;
