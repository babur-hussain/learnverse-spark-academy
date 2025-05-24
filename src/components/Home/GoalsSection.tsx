
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/UI/input';
import { Card } from '@/components/UI/card';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const GoalsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('active', true)
        .order('order_index');
      if (error) throw error;
      return data;
    },
  });

  const filteredGoals = goals?.filter(goal =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const popularGoals = filteredGoals.filter(goal => goal.is_popular);

  if (isLoading) {
    return (
      <section className="w-full py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-12"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Select your goal / exam
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            <span className="text-green-500 dark:text-green-400 font-semibold">{goals?.length ?? 0}+</span> exams available for your preparation
          </p>

          <div className="relative mb-12">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <Input
              type="text"
              placeholder="Type the goal / exam you're preparing for"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {popularGoals.length > 0 && (
            <>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Popular goals</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {popularGoals.map((goal) => (
                  <Card
                    key={goal.id}
                    className="p-6 flex flex-col items-center justify-center hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-purple-900/20"
                    onClick={() => navigate(`/catalog?exam=${goal.exam_code}`)}
                  >
                    <img
                      src={goal.icon}
                      alt={goal.title}
                      className="w-12 h-12 mb-4"
                    />
                    <h4 className="text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                      {goal.title}
                    </h4>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default GoalsSection;
