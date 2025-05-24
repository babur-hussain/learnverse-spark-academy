import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/UI/button';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, BookOpen, Code, Video, Calculator, PenTool, ChartBar, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  slug: string;
}

interface FeaturedCategory {
  category: Category;
  promotional_text: string | null;
  cta_text: string;
}

const iconMap: Record<string, React.ReactNode> = {
  ChartBar: <ChartBar className="h-6 w-6" />,
  Grid3X3: <Grid3X3 className="h-6 w-6" />,
  Code: <Code className="h-6 w-6" />,
  PenTool: <PenTool className="h-6 w-6" />,
  Calculator: <Calculator className="h-6 w-6" />,
  Languages: <Languages className="h-6 w-6" />,
  Video: <Video className="h-6 w-6" />,
  BookOpen: <BookOpen className="h-6 w-6" />,
};

const FeaturedCategories = () => {
  const navigate = useNavigate();

  const { data: categories, isLoading, isError, error } = useQuery({
    queryKey: ['featuredCategories'],
    queryFn: async () => {
      console.log('Fetching featured categories');
      try {
        const { data, error } = await supabase
          .from('featured_categories')
          .select(`
            category:categories(
              id,
              name,
              description,
              icon,
              color,
              slug
            ),
            promotional_text,
            cta_text
          `)
          .eq('is_active', true)
          .order('order_index');

        if (error) {
          console.error('Error fetching featured categories:', error);
          throw error;
        }
        
        console.log('Featured categories data:', data);
        
        // Add defensive checks for the data structure
        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data, data);
          return [];
        }
        
        // Filter out any invalid entries
        const validData = data.filter(item => {
          if (!item || typeof item !== 'object') {
            console.warn('Invalid category item:', item);
            return false;
          }
          if (!item.category || typeof item.category !== 'object') {
            console.warn('Invalid category data:', item);
            return false;
          }
          return true;
        });
        
        console.log('Valid featured categories:', validData);
        return validData as FeaturedCategory[];
      } catch (err) {
        console.error('Error in featured categories query:', err);
        throw err;
      }
    },
    retry: 1
  });

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="w-full py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error('FeaturedCategories render error:', error);
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading categories.</p>
        <p className="text-sm text-gray-500 mt-2">Please refresh the page to try again.</p>
      </div>
    );
  }

  // Add safety check for categories
  if (!categories || !Array.isArray(categories)) {
    console.warn('Categories is not an array:', categories);
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No categories available.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <BookOpen className="h-5 w-5 text-purple-500 dark:text-purple-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Featured Categories</h2>
          
          <div className="ml-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full hover:bg-purple-50 hover:text-purple-500 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
              onClick={() => navigate('/explore')}
            >
              Explore All
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((featured) => {
            // Add safety checks for each featured category
            if (!featured || !featured.category) {
              console.warn("Invalid featured category:", featured);
              return null;
            }
            
            // Skip categories without a slug
            if (!featured.category.slug) {
              console.warn("Category missing slug:", featured.category);
              return null;
            }
            
            const handleCategoryClick = () => {
              try {
                console.log('Navigating to category:', featured.category.slug);
                navigate(`/explore?category=${encodeURIComponent(featured.category.slug)}`);
              } catch (error) {
                console.error('Navigation error:', error);
              }
            };
            
            return (
              <div 
                key={featured.category.id}
                className="flex flex-col items-center justify-center p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                onClick={handleCategoryClick}
              >
                <div className={cn("p-3 rounded-full mb-3", featured.category.color || "bg-gray-100")}>
                  {featured.category.icon && iconMap[featured.category.icon] ? 
                    iconMap[featured.category.icon] : 
                    <BookOpen className="h-6 w-6" />
                  }
                </div>
                <h3 className="font-medium text-center dark:text-gray-100">{featured.category.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {featured.promotional_text || `Explore ${featured.category.name}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCategories;
