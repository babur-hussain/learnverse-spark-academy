import React from 'react';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

function arraySafe<T>(arr: T[] | undefined | null): T[] {
  return Array.isArray(arr) ? arr : [];
}

const isUrl = (str?: string | null) => {
  return !!str && (str.startsWith('http://') || str.startsWith('https://'));
};

const FeaturedSubjects = ({ selectedCollege }: { selectedCollege?: string }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch featured subjects directly using is_featured flag, filtered by college if selected
  const { data: featuredSubjects, isLoading, error } = useQuery({
    queryKey: ['featured-subjects', selectedCollege],
    queryFn: async () => {
      try {
        let query = supabase
          .from('subjects')
          .select('id, title, description, thumbnail_url, icon')
          .eq('is_featured', true);
        
        // If a college is selected, filter by that college
        if (selectedCollege) {
          query = query.eq('college_id', selectedCollege);
        }
        
        const { data, error } = await query.order('title');

        if (error) {
          throw error;
        }
        
        // Validate data structure
        const validData = (data || []).filter(item => 
          item && 
          typeof item.id === 'string' && 
          typeof item.title === 'string' &&
          item.title.trim() !== ''
        );
        
        return validData as Subject[];
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
        if (item && item.subject_id) {
          counts[item.subject_id] = (counts[item.subject_id] || 0) + 1;
        }
      });
      
      return counts;
    },
    enabled: !!featuredSubjects?.length
  });

  // Handle error state
  if (error) {
    console.error('Featured subjects error:', error);
    return (
      <section className="w-full py-12 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Unable to load featured subjects at this time.
            </p>
          </div>
        </div>
      </section>
    );
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
        {/* Responsive grid: circular for mobile/tablet, card for desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:hidden gap-6">
          {arraySafe(featuredSubjects).map((subject) => {
            if (!subject || !subject.title) return null;
            return (
              <div
                key={subject.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => navigate(`/subject/${subject.id}`)}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/30 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center mb-3">
                  {subject.thumbnail_url ? (
                    <img
                      src={subject.thumbnail_url}
                      alt={subject.title}
                      className="w-full h-full object-cover"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                  ) : subject.icon ? (
                    isUrl(subject.icon) ? (
                      <img
                        src={subject.icon}
                        alt={subject.title}
                        className="w-full h-full object-cover"
                        onError={e => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <span className="text-3xl text-primary opacity-80">{subject.icon}</span>
                    )
                  ) : (
                    <BookOpen size={32} className="text-primary opacity-80" />
                  )}
                </div>
                <div className="text-center text-base font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {subject.title}
                </div>
              </div>
            );
          })}
        </div>
        {/* Desktop card grid */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {arraySafe(featuredSubjects).map((subject) => {
            if (!subject || !subject.title) return null;
            return (
              <Card key={subject.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg rounded-lg">
                <div className="aspect-[16/9] w-full bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 relative flex items-center justify-center">
                  {subject.thumbnail_url ? (
                    <img 
                      src={subject.thumbnail_url} 
                      alt={subject.title}
                      className="w-full h-full object-cover bg-gray-100 dark:bg-gray-800"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : subject.icon ? (
                    isUrl(subject.icon) ? (
                      <img
                        src={subject.icon}
                        alt={subject.title}
                        className="w-full h-full object-cover bg-gray-100 dark:bg-gray-800"
                        onError={e => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <span className="text-5xl text-primary opacity-80">{subject.icon}</span>
                    )
                  ) : (
                    <BookOpen size={48} className="text-primary opacity-80" />
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
                    {subject.description || 'No description available'}
                  </p>
                  {chapters && chapters[subject.id] && (
                    <div className="mt-4 mb-2">
                      <Progress value={100} className="h-2" />
                    </div>
                  )}
                  <Button className="w-full mt-4" onClick={() => navigate(`/subject/${subject.id}`)}>
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSubjects;
