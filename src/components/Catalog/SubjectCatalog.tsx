import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Badge } from '@/components/UI/badge';
import { BookOpen, Search, Filter, Grid3X3, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EducationalLoader } from '@/components/UI/educational-loader';

interface Subject {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

function arraySafe<T>(arr: T[] | undefined | null): T[] {
  return Array.isArray(arr) ? arr : [];
}

const isUrl = (str?: string | null) => {
  return !!str && (str.startsWith('http://') || str.startsWith('https://'));
};

function getImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('pfw.supabase.co')) return `https://${url}`;
  return url;
}

function SubjectCard({ subject, chapterCount, viewMode }: { subject: Subject, chapterCount: number, viewMode: 'grid' | 'list' }) {
  const [imageError, setImageError] = React.useState(false);
  const imageUrl = getImageUrl(subject.thumbnail_url);
  const showImage = !!imageUrl && !imageError;
  if (viewMode === 'grid') {
    return (
      <Card key={subject.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-[16/9] w-full bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 relative flex items-center justify-center">
          {showImage ? (
            <img 
              src={imageUrl!} 
              alt={subject.title}
              className="w-full h-full object-cover rounded-lg"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center absolute top-0 left-0">
              {subject.icon ? (
                isUrl(subject.icon) ? (
                  <img
                    src={subject.icon}
                    alt={subject.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => {/* hide if broken */}}
                  />
                ) : (
                  <span className="text-4xl text-primary opacity-80">{subject.icon}</span>
                )
              ) : (
                <BookOpen size={40} className="text-primary opacity-80" />
              )}
            </div>
          )}
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-2">{subject.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {subject.description || 'No description available'}
          </p>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary">
              {chapterCount} {chapterCount === 1 ? 'Chapter' : 'Chapters'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Updated {new Date(subject.updated_at || subject.created_at).toLocaleDateString()}
            </span>
          </div>
          <Link to={`/catalog/subject/${subject.id}`}>
            <Button className="w-full">
              Explore Subject
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  } else {
    return (
      <Card key={subject.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              {subject.thumbnail_url && !imageError ? (
                <img 
                  src={subject.thumbnail_url} 
                  alt={subject.title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={() => setImageError(true)}
                />
              ) : subject.icon ? (
                isUrl(subject.icon) ? (
                  <img
                    src={subject.icon}
                    alt={subject.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => {/* hide if broken */}}
                  />
                ) : (
                  <span className="text-2xl text-primary opacity-80">{subject.icon}</span>
                )
              ) : (
                <BookOpen size={24} className="text-primary opacity-80" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{subject.title}</h3>
              <p className="text-muted-foreground mb-3 line-clamp-2">
                {subject.description || 'No description available'}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary">
                  {chapterCount} {chapterCount === 1 ? 'Chapter' : 'Chapters'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(subject.updated_at || subject.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link to={`/catalog/subject/${subject.id}`}>
                <Button>
                  Explore
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

const SubjectCatalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch all subjects with comprehensive error handling
  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ['subjects-catalog', searchTerm],
    queryFn: async () => {
      try {
        let query = supabase
          .from('subjects')
          .select('*')
          .order('title');

        if (searchTerm.trim()) {
          query = query.ilike('title', `%${searchTerm.trim()}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Subjects fetch error:', error);
          throw error;
        }

        // Validate and filter subjects
        const validSubjects = (data || []).filter(subject => 
          subject && 
          subject.id && 
          subject.title &&
          typeof subject.title === 'string' &&
          subject.title.trim() !== ''
        );

        console.log('Valid subjects loaded:', validSubjects.length);
        return validSubjects as Subject[];
      } catch (err) {
        console.error('Subjects catalog query error:', err);
        throw err;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000
  });

  // Fetch chapter counts for each subject
  const { data: chapterCounts = {} } = useQuery({
    queryKey: ['subject-chapters-catalog'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('subject_id, id');

        if (error) {
          console.error('Chapter counts fetch error:', error);
          throw error;
        }

        // Count chapters per subject
        const counts: Record<string, number> = {};
        (data || []).forEach(item => {
          if (item && item.subject_id) {
            counts[item.subject_id] = (counts[item.subject_id] || 0) + 1;
          }
        });

        return counts;
      } catch (err) {
        console.error('Chapter counts query error:', err);
        return {};
      }
    },
    enabled: subjects.length > 0
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Subjects</h2>
          <p className="text-muted-foreground mb-6">
            {error.message || 'Unable to load subjects. Please try again.'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <EducationalLoader message="Loading subjects..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Subject Catalog</h1>
        <p className="text-muted-foreground">
          Explore our comprehensive collection of learning subjects
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      {subjects.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {searchTerm ? 'No subjects found' : 'No subjects available'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? `No subjects match "${searchTerm}". Try a different search term.`
              : 'Subjects will appear here once they are added.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
          </div>
          
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {arraySafe(subjects).map((subject) => {
              if (!subject || !subject.title) return null;
              const chapterCount = chapterCounts[subject.id] || 0;
              return <SubjectCard key={subject.id} subject={subject} chapterCount={chapterCount} viewMode={viewMode} />;
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SubjectCatalog;
