
import React from 'react';
import { Card, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
<<<<<<< HEAD
import Scene3D from './3D/Scene3D';

const Interactive3DSection = () => {
=======
import { Button } from '@/components/UI/button';
import Scene3D from './3D/Scene3D';
import { ArrowRight, Sparkles } from 'lucide-react';
import useIsMobile from '@/hooks/use-mobile';

const Interactive3DSection = () => {
  const isMobile = useIsMobile();

>>>>>>> main
  const features = [
    {
      model: 'books' as const,
      title: 'Interactive Textbooks',
<<<<<<< HEAD
      description: 'Explore subjects through immersive 3D textbooks and materials',
      badge: 'Most Popular',
      color: 'bg-blue-500'
=======
      description: 'Explore subjects through immersive 3D textbooks and interactive learning materials that bring concepts to life.',
      badge: 'Most Popular',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      badgeColor: 'bg-orange-500'
>>>>>>> main
    },
    {
      model: 'programming' as const,
      title: 'Code Visualization',
<<<<<<< HEAD
      description: 'Learn programming languages with 3D code structures',
      badge: 'New',
      color: 'bg-green-500'
    },
    {
      model: 'materials' as const,
      title: 'Virtual Lab',
      description: 'Experiment with virtual laboratory equipment and tools',
      badge: 'Premium',
      color: 'bg-purple-500'
=======
      description: 'Master programming languages with 3D code structures and visual programming environments.',
      badge: 'New',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      badgeColor: 'bg-emerald-500'
    },
    {
      model: 'materials' as const,
      title: 'Virtual Laboratory',
      description: 'Experiment with virtual laboratory equipment and conduct safe, interactive scientific experiments.',
      badge: 'Premium',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      badgeColor: 'bg-purple-500'
>>>>>>> main
    }
  ];

  return (
<<<<<<< HEAD
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Experience <span className="text-blue-600">3D Learning</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Dive into an immersive learning experience with our cutting-edge 3D educational models
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="h-64 relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                  <Scene3D model={feature.model} className="w-full h-full" />
                  
                  <Badge className={`absolute top-4 left-4 ${feature.color} text-white`}>
                    {feature.badge}
                  </Badge>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-3 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
=======
    <section className="py-12 md:py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]"></div>
      <div className="absolute top-5 md:top-10 left-5 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-blue-300/10 dark:bg-blue-700/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-5 md:bottom-10 right-5 md:right-10 w-64 md:w-96 h-64 md:h-96 bg-purple-300/10 dark:bg-purple-700/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
            Next-Generation Learning
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6 leading-tight">
            Experience
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600">
              3D Learning
            </span>
          </h2>
          <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Dive into an immersive educational experience with our cutting-edge 3D learning environment that makes complex concepts easy to understand and remember.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-700 cursor-pointer border-0 overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:-translate-y-1 md:hover:-translate-y-3 hover:scale-[1.02] md:hover:scale-105 touch-feedback"
              style={{ 
                animationDelay: `${index * 200}ms`,
                animation: 'fade-in 0.8s ease-out forwards'
              }}
            >
              <CardContent className="p-0 relative">
                <div className={`${isMobile ? 'h-48' : 'h-72'} relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 overflow-hidden`}>
                  <Scene3D model={feature.model} className="w-full h-full" />
                  
                  <Badge className={`absolute top-3 md:top-4 left-3 md:left-4 ${feature.badgeColor} text-white shadow-lg z-10 text-xs`}>
                    {feature.badge}
                  </Badge>
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                <div className="p-4 md:p-8">
                  <h3 className="font-bold text-lg md:text-2xl mb-3 md:mb-4 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <Button 
                    className={`w-full ${feature.color} text-white border-0 rounded-xl py-3 md:py-3 font-semibold transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg touch-button`}
                  >
                    Explore Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
>>>>>>> main
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
<<<<<<< HEAD
=======
        
        {/* Call to action */}
        <div className="text-center animate-fade-in">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 max-w-2xl mx-auto shadow-xl">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
              Ready to Transform Your Learning?
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6">
              Join thousands of students already experiencing the future of education.
            </p>
            <Button 
              size={isMobile ? "default" : "lg"}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 touch-button"
            >
              Start Learning Today
              <Sparkles className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
>>>>>>> main
      </div>
    </section>
  );
};

export default Interactive3DSection;
