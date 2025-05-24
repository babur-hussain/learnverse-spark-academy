import React from 'react';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/UI/progress';
import { BookOpen, Award, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subject {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  icon: string | null;
}

const FeaturedSubjects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch featured subjects directly using is_featured flag
  const { data: featuredSubjects, isLoading, error } = useQuery({
    queryKey: ['featured-subjects'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('id, title, description, thumbnail_url, icon')
          .eq('is_featured', true)
          .order('title');

        if (error) {
          throw error;
        }
        
        return data as Subject[];
      } catch (err) {
        console.error('Error fetching featured subjects:', err);
        throw err;
      }
    },
  });

  // Fetch chapters count in a separate query
  const { data: chapters } = useQuery({
    queryKey: ['subject-chapters-count'],
    queryFn: async () => {
      if (!featuredSubjects?.length) return {};
      
      const subjectIds = featuredSubjects.map(subject => subject.id);
      
      const { data, error } = await supabase
        .from('chapters')
        .select('subject_id, id')
        .in('subject_id', subjectIds);
        
      if (error) throw error;
      
      // Count chapters per subject
      const counts: Record<string, number> = {};
      data?.forEach(item => {
        counts[item.subject_id] = (counts[item.subject_id] || 0) + 1;
      });
      
      return counts;
    },
    enabled: !!featuredSubjects?.length
  });

  // Handle error state
  if (error) {
    console.error('Featured subjects error:', error);
    toast({
      title: "Error loading featured subjects",
      description: "Failed to load featured content. Please refresh the page.",
      variant: "destructive"
    });
  }

  // Skeleton loader while loading
  if (isLoading) {
    return (
      <section className="w-full py-12 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Subjects</h2>
            <p className="mx-auto text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Explore our most popular learning subjects
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[16/9] w-full bg-gray-200 dark:bg-gray-700"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Hide section if no featured subjects
  if (!featuredSubjects || featuredSubjects.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Featured Subjects</h2>
          <div className="flex justify-center">
            <div className="w-20 h-1 rounded-full bg-primary mb-6"></div>
          </div>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Expand your knowledge with our most comprehensive learning subjects
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredSubjects.map((subject) => {
            return (
              <Card key={subject.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg border-t-4 border-primary rounded-lg">
                <div className="aspect-[16/9] w-full bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 relative">
                  {subject.thumbnail_url ? (
                    <img 
                      src={subject.thumbnail_url} 
                      alt={subject.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {subject.icon ? (
                        <span className="text-5xl text-primary opacity-80">{subject.icon}</span>
                      ) : (
                        <BookOpen size={48} className="text-primary opacity-80" />
                      )}
                    </div>
                  )}
                  
                  {chapters && chapters[subject.id] && (
                    <div className="absolute top-3 right-3 bg-white/80 dark:bg-gray-800/80 rounded-full py-1 px-3 flex items-center gap-1 backdrop-blur-sm">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">
                        {chapters[subject.id]} {chapters[subject.id] === 1 ? 'Chapter' : 'Chapters'}
                      </span>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <CardTitle className="mb-3 text-xl font-bold">{subject.title}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {subject.description}
                  </p>
                  
                  {chapters && chapters[subject.id] && (
                    <div className="mt-4 mb-2">
                      <div className="flex justify-between items-center mb-1 text-xs font-medium">
                        <span>Progress</span>
                        <span className="text-primary">30%</span>
                      </div>
                      <Progress value={30} className="h-2 bg-gray-100 dark:bg-gray-700">
                        <div className="h-full bg-primary rounded-full" style={{ width: '30%' }}></div>
                      </Progress>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="p-6 pt-0">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    onClick={() => navigate(`/catalog/subject/${subject.id}`)}
                  >
                    Learn More
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-10 text-center">
          <Button 
            variant="outline"
            size="lg"
            onClick={() => navigate('/catalog')}
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            View All Subjects
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSubjects;
