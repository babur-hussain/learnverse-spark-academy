import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { supabase } from '@/integrations/supabase/client';
import CourseCard from '@/components/UI/CourseCard';
import { Card } from '@/components/UI/card';
import { EducationalLoader } from '@/components/UI/educational-loader';
import useIsMobile from '@/hooks/use-mobile';
import { BookOpen, Video, FileText, Users } from 'lucide-react';
import { ComingSoonInline } from '@/components/ErrorPage';

const Explore = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const isMobile = useIsMobile();

  // Add logging for debugging
  console.log('Explore page - Category slug from URL:', categorySlug);

  // First fetch the category based on slug
  const { data: category, isLoading: categoryLoading, error: categoryError } = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: async () => {
      if (!categorySlug) {
        console.log('No category slug provided');
        return null;
      }
      
      console.log('Fetching category with slug:', categorySlug);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching category:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No category found for slug:', categorySlug);
      } else {
        console.log('Found category:', data);
      }
      
      return data;
    },
    enabled: !!categorySlug
  });

  // Then fetch content for that category if we found it
  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ['category-content', category?.id],
    queryFn: async () => {
      console.log('Fetching content for category ID:', category?.id);
      const { data, error } = await supabase
        .from('content_category_mappings')
        .select(`
          content_type,
          content_id,
          courses:content_id (
            id,
            title,
            description,
            thumbnail_url,
            instructor:instructor_id (
              profiles:id (
                full_name,
                avatar_url
              )
            )
          ),
          videos:content_id (
            id,
            title,
            description,
            thumbnail_url,
            duration,
            video_url
          )
        `)
        .eq('category_id', category?.id);

      if (error) {
        console.error('Error fetching content:', error);
        throw error;
      }
      
      console.log('Content results:', data);
      
      // Group content by type
      return {
        courses: data.filter(item => item.content_type === 'course').map(item => item.courses),
        videos: data.filter(item => item.content_type === 'video').map(item => item.videos),
      };
    },
    enabled: !!category?.id
  });

  // Show a more informative loading state
  if (categoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <EducationalLoader message="Loading category content..." />
      </div>
    );
  }

  // Show errors when category not found
  if (categoryError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Category</h1>
          <p className="text-muted-foreground">
            There was an error loading this category. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Handle case where slug doesn't match any category
  if (categorySlug && !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground">
            The category "{categorySlug}" doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Handle case when no category is selected (show all categories)
  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Explore Content</h1>
          <p className="text-muted-foreground">
            Please select a category to explore content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Courses</span>
            {content?.courses?.length ? (
              <span className="ml-1 text-xs">({content.courses.length})</span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span>Videos</span>
            {content?.videos?.length ? (
              <span className="ml-1 text-xs">({content.videos.length})</span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="tests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Tests</span>
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Live Classes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          {contentLoading ? (
            <Card className="p-8 text-center">
              <EducationalLoader message="Loading courses..." />
            </Card>
          ) : content?.courses?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {content.courses.map((course: any) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  image={course.thumbnail_url}
                  description={course.description}
                  instructor={course.instructor?.profiles ? {
                    name: course.instructor.profiles.full_name,
                    avatar: course.instructor.profiles.avatar_url
                  } : undefined}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No courses available in this category yet.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="videos">
          {contentLoading ? (
            <Card className="p-8 text-center">
              <EducationalLoader message="Loading videos..." />
            </Card>
          ) : content?.videos?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {content.videos.map((video: any) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={video.thumbnail_url || '/placeholder.svg'} 
                      alt={video.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{video.title}</h3>
                    {video.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No videos available in this category yet.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tests">
          <Card className="p-8 text-center">
            <ComingSoonInline message="Tests coming soon for this category." />
          </Card>
        </TabsContent>

        <TabsContent value="live">
          <Card className="p-8 text-center">
            <ComingSoonInline message="Live classes coming soon for this category." />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Explore;
