
import React from 'react';
import { Card, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import Scene3D from './3D/Scene3D';

const Interactive3DSection = () => {
  const features = [
    {
      model: 'books' as const,
      title: 'Interactive Textbooks',
      description: 'Explore subjects through immersive 3D textbooks and materials',
      badge: 'Most Popular',
      color: 'bg-blue-500'
    },
    {
      model: 'programming' as const,
      title: 'Code Visualization',
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
    }
  ];

  return (
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Interactive3DSection;
