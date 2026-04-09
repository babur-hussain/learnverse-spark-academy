
import React from 'react';
import { Book, Users, Video, Clock } from 'lucide-react';
import { Button } from '@/components/UI/button';

interface StatItemProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, icon, color, bgColor }) => {
  return (
    <div className="flex items-center space-x-4">
      <div className={`rounded-lg p-3 ${bgColor}`}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          {value}
          <span className="text-green-500 dark:text-green-400 font-bold">+</span>
        </div>
        <div className="text-gray-500 dark:text-gray-400">{label}</div>
      </div>
    </div>
  );
};

const LearningStats: React.FC = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Start learning with Spark Academy</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get unlimited access to structured courses & doubt clearing sessions
            </p>
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 h-auto text-lg"
              onClick={() => window.location.href = '/auth'}
            >
              Start learning
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <StatItem
              value="60"
              label="Exam categories"
              icon={<Book className="h-6 w-6 text-orange-500 dark:text-orange-400" />}
              color="text-orange-500 dark:text-orange-400"
              bgColor="bg-orange-100 dark:bg-orange-900/30"
            />
            <StatItem
              value="14k"
              label="Educators"
              icon={<Users className="h-6 w-6 text-blue-500 dark:text-blue-400" />}
              color="text-blue-500 dark:text-blue-400"
              bgColor="bg-blue-100 dark:bg-blue-900/30"
            />
            <StatItem
              value="1.5k"
              label="Daily live classes"
              icon={<Video className="h-6 w-6 text-pink-500 dark:text-pink-400" />}
              color="text-pink-500 dark:text-pink-400"
              bgColor="bg-pink-100 dark:bg-pink-900/30"
            />
            <StatItem
              value="1M"
              label="Video lessons"
              icon={<Video className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />}
              color="text-yellow-500 dark:text-yellow-400"
              bgColor="bg-yellow-100 dark:bg-yellow-900/30"
            />
            <StatItem
              value="3.2B"
              label="Mins. watched"
              icon={<Clock className="h-6 w-6 text-blue-500 dark:text-blue-400" />}
              color="text-blue-500 dark:text-blue-400"
              bgColor="bg-blue-100 dark:bg-blue-900/30"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningStats;
