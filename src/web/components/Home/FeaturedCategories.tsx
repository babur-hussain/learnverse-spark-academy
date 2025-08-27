import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import useIsMobile from '@/hooks/use-mobile';
import { 
  Code, 
  Calculator, 
  Languages, 
  PenTool, 
  ChartBar, 
  Grid3X3,
  BookOpen,
  Sparkles
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  Code,
  Calculator,
  Languages,
  PenTool,
  ChartBar,
  Grid3X3,
  BookOpen,
  Sparkles
};

interface FeaturedCategory {
  id: string;
  promotional_text: string | null;
  cta_text: string;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
  } | null;
}

function arraySafe<T>(arr: T[] | undefined | null): T[] {
  return Array.isArray(arr) ? arr : [];
}

const FeaturedCategories: React.FC = () => {
  const isMobile = useIsMobile();

  const { data: featuredCategories = [], isLoading, error } = useQuery({
    queryKey: ['featured-categories'],
    queryFn: async () => {
      try {
        console.log('Fetching featured categories');
        const { data, error } = await supabase
          .from('featured_categories')
          .select(`
            id,
            promotional_text,
            cta_text,
            category:categories(
              id,
              name,
              slug,
              description,
              icon,
              color
            )
          `)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching featured categories:', error);
          throw error;
        }

        console.log('Featured categories data:', data);
        
        // Validate and filter data
        const validCategories = (data || []).filter(item => 
          item && 
          item.category && 
          item.category.name && 
          item.category.slug &&
          typeof item.category.name === 'string' &&
          item.category.name.trim() !== ''
        );
        
        console.log('Valid featured categories:', validCategories);
        
        return validCategories as FeaturedCategory[];
      } catch (err) {
        console.error('Error in featured categories query:', err);
        throw err;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000
  });

  if (error) {
    console.error('Featured categories error:', error);
    return (
      <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 md:p-8">
            <h3 className="text-base md:text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Unable to load categories
            </h3>
            <p className="text-sm md:text-base text-red-600 dark:text-red-300">
              Please refresh the page to try again.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="h-6 md:h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 md:w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 md:w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 md:h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]"></div>
      
      {/* Floating background elements */}
      <div className="absolute top-10 md:top-20 left-5 md:left-10 w-16 md:w-20 h-16 md:h-20 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-bounce"></div>
      <div className="absolute bottom-10 md:bottom-20 right-5 md:right-10 w-24 md:w-32 h-24 md:h-32 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6 leading-tight">
            Explore Learning
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600">
              Categories
            </span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Discover your passion and master new skills with our comprehensive learning paths designed for modern learners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {arraySafe(featuredCategories).map((item, index) => {
            // Additional safety check
            if (!item || !item.category || !item.category.name) {
              return null;
            }

            const IconComponent = iconMap[item.category.icon] || BookOpen;
            
            return (
              <Card 
                key={item.id} 
                className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 md:hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden touch-feedback"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fade-in 0.6s ease-out forwards'
                }}
              >
                <CardContent className="p-6 md:p-8 relative">
                  <div className="absolute top-0 right-0 w-16 md:w-20 h-16 md:h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full"></div>
                  
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className={`p-3 md:p-4 rounded-2xl ${item.category.color || 'bg-blue-100'} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.category.name}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4 md:mb-6 line-clamp-2 leading-relaxed">
                    {item.category.description || 'Explore this category to learn more.'}
                  </p>
                  
                  <Button 
                    asChild 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl py-3 font-semibold transition-all duration-300 group-hover:scale-105 touch-button"
                  >
                    <Link to={`/catalog?category=${item.category.slug}`}>
                      {item.cta_text || 'Explore'}
                      <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {featuredCategories.length === 0 && (
          <div className="text-center py-12 md:py-16">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 md:p-12">
              <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No categories available
              </h3>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-500">
                Categories will appear here once they're added.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;
