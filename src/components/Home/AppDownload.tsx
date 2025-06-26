
import React from 'react';
import { Button } from '@/components/UI/button';
import { Download, Smartphone } from 'lucide-react';

const AppDownload: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Get the learning app</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Download lessons and learn anytime, anywhere with the Spark Academy app
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                className="border-2 border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 h-14"
              >
                <img 
                  src="/public/lovable-uploads/a52e4e42-5192-4a92-8bcc-e23b4f2fdd5b.png" 
                  alt="App Store" 
                  className="w-6 h-6 mr-2 invert-0 dark:invert" 
                />
                Download on the<br />App Store
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 h-14"
              >
                <img 
                  src="/public/lovable-uploads/a52e4e42-5192-4a92-8bcc-e23b4f2fdd5b.png" 
                  alt="Google Play" 
                  className="w-6 h-6 mr-2 invert-0 dark:invert" 
                />
                GET IT ON<br />Google Play
              </Button>
            </div>
          </div>
          <div className="relative max-w-md mx-auto">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1565538420870-da08ff96a207?auto=format&fit=crop&q=80&w=1470" 
                alt="Mobile app screenshot" 
                className="rounded-lg shadow-2xl dark:shadow-purple-900/20"
              />
              <div className="absolute -top-4 -right-4 bg-learn-purple dark:bg-purple-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                <Smartphone className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;
