import React from 'react';
import { useQuery } from '@tanstack/react-query';
<<<<<<< HEAD
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
=======
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
>>>>>>> main

        if (error) {
          console.error('Error fetching featured categories:', error);
          throw error;
        }
<<<<<<< HEAD
        
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
=======

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
>>>>>>> main
      } catch (err) {
        console.error('Error in featured categories query:', err);
        throw err;
      }
    },
<<<<<<< HEAD
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
=======
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
>>>>>>> main
    );
  }

  return (
<<<<<<< HEAD
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
=======
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
>>>>>>> main
  );
};

export default FeaturedCategories;
