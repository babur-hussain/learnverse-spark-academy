<<<<<<< HEAD

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { BookOpen, Bookmark, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import SearchBar from '@/components/UI/SearchBar';
import FilterDropdown, { FilterOption } from '@/components/UI/FilterDropdown';
import CourseCard from '@/components/UI/CourseCard';

// Filter options
const categoryOptions: FilterOption[] = [
  { id: 'math', label: 'Mathematics' },
  { id: 'science', label: 'Science' },
  { id: 'programming', label: 'Programming' },
  { id: 'languages', label: 'Languages' },
  { id: 'humanities', label: 'Humanities' }
];

const levelOptions: FilterOption[] = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' }
];

const durationOptions: FilterOption[] = [
  { id: 'short', label: 'Less than 5 hours' },
  { id: 'medium', label: '5-20 hours' },
  { id: 'long', label: 'More than 20 hours' }
];

// Sample course data
const allCourses = [
  {
    id: '1',
    title: 'Complete Python Programming: Beginner to Advanced',
    instructor: 'Dr. Rahul Sharma',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2062&auto=format&fit=crop',
    category: 'Programming',
    rating: 4.8,
    studentsCount: 12450,
    duration: 42,
    isPopular: true,
    description: 'Learn Python programming from scratch',
    lastUpdated: new Date('2023-01-15')
  },
  {
    id: '2',
    title: 'Master the Fundamentals of Mathematics',
    instructor: 'Prof. Ananya Patel',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
    category: 'Mathematics',
    rating: 4.7,
    studentsCount: 8760,
    duration: 38,
    isPopular: true,
    description: 'Master mathematical concepts with ease',
    lastUpdated: new Date('2023-02-20')
  },
  {
    id: '3',
    title: 'Advanced Physics: Understanding Quantum Mechanics',
    instructor: 'Dr. Vikram Singh',
    thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=2074&auto=format&fit=crop',
    category: 'Physics',
    rating: 4.9,
    studentsCount: 6320,
    duration: 45,
    description: 'Dive deep into quantum physics',
    lastUpdated: new Date('2023-03-10')
  },
  {
    id: '4',
    title: 'English Grammar Mastery: From Basics to Advanced',
    instructor: 'Mrs. Priya Desai',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop',
    category: 'English',
    rating: 4.6,
    studentsCount: 14200,
    duration: 32,
    description: 'Perfect your English grammar skills',
    lastUpdated: new Date('2023-04-05')
  },
  {
    id: '5',
    title: 'Introduction to Organic Chemistry',
    instructor: 'Dr. Vikram Singh',
    thumbnailUrl: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=2070&auto=format&fit=crop',
    category: 'Chemistry',
    rating: 4.5,
    studentsCount: 7320,
    duration: 28,
    description: 'Understand the basics of organic chemistry',
    lastUpdated: new Date('2023-05-18')
  },
  {
    id: '6',
    title: 'World History: Ancient Civilizations',
    instructor: 'Prof. Rahul Sharma',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=2070&auto=format&fit=crop',
    category: 'History',
    rating: 4.7,
    studentsCount: 5680,
    duration: 36,
    description: 'Explore ancient civilizations and their impact',
    lastUpdated: new Date('2023-06-22')
  }
];

const liveCourses = [
  {
    id: '7',
    title: 'Live Algebra Problem Solving Session',
    instructor: 'Prof. Ananya Patel',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
    category: 'Mathematics',
    rating: 4.9,
    studentsCount: 2450,
    duration: 3,
    isLive: true,
    description: 'Solve algebra problems live with an expert',
    lastUpdated: new Date('2023-07-15')
  },
  {
    id: '8',
    title: 'Python Coding Workshop: Build a Web Scraper',
    instructor: 'Dr. Rahul Sharma',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2062&auto=format&fit=crop',
    category: 'Programming',
    rating: 4.8,
    studentsCount: 1820,
    duration: 2,
    isLive: true,
    description: 'Build a web scraper with Python',
    lastUpdated: new Date('2023-08-05')
  }
];

const popularCourses = [
  {
    id: '1',
    title: 'Complete Python Programming: Beginner to Advanced',
    instructor: 'Dr. Rahul Sharma',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2062&auto=format&fit=crop',
    category: 'Programming',
    rating: 4.8,
    studentsCount: 12450,
    duration: 42,
    isPopular: true,
    description: 'Learn Python programming from scratch',
    lastUpdated: new Date('2023-01-15')
  },
  {
    id: '2',
    title: 'Master the Fundamentals of Mathematics',
    instructor: 'Prof. Ananya Patel',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
    category: 'Mathematics',
    rating: 4.7,
    studentsCount: 8760,
    duration: 38,
    isPopular: true,
    description: 'Master mathematical concepts with ease',
    lastUpdated: new Date('2023-02-20')
  },
  {
    id: '9',
    title: 'Biology: Human Anatomy and Physiology',
    instructor: 'Dr. Priya Desai',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop',
    category: 'Biology',
    rating: 4.7,
    studentsCount: 9120,
    duration: 40,
    isPopular: true,
    description: 'Learn about human anatomy and physiology',
    lastUpdated: new Date('2023-09-12')
  }
];

const SubjectCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Courses & Subjects</h1>
          <p className="text-muted-foreground">Explore our catalog of 500+ subjects</p>
        </div>
        
        <SearchBar 
          placeholder="Search for courses, subjects..."
          className="md:w-64"
          onSearch={handleSearch}
        />
      </div>
      
      <div className="flex flex-wrap gap-3 mb-8">
        <FilterDropdown 
          title="Category" 
          options={categoryOptions} 
          onSelect={(value) => setSelectedCategories([...selectedCategories, value])}
        />
        <FilterDropdown 
          title="Level" 
          options={levelOptions} 
          onSelect={(value) => setSelectedLevels([...selectedLevels, value])}
        />
        <FilterDropdown 
          title="Duration" 
          options={durationOptions} 
          onSelect={(value) => setSelectedDurations([...selectedDurations, value])}
        />
        
        {(selectedCategories.length > 0 || selectedLevels.length > 0 || selectedDurations.length > 0) && (
          <Button variant="outline" onClick={() => {
            setSelectedCategories([]);
            setSelectedLevels([]);
            setSelectedDurations([]);
          }}>
            Clear Filters
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="live">Live Classes</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.map(course => (
              <CourseCard 
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                duration={`${course.duration} hours`} 
                studentsCount={course.studentsCount}
                rating={course.rating}
                lastUpdated={course.lastUpdated}
                tags={[course.category]}
                image={course.thumbnailUrl}
                instructor={{
                  name: course.instructor,
                  avatar: ""
                }}
              />
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button variant="outline">Load More Courses</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="live" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveCourses.map(course => (
              <CourseCard 
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                duration={`${course.duration} hours`}
                studentsCount={course.studentsCount}
                rating={course.rating}
                lastUpdated={course.lastUpdated}
                tags={[course.category, 'Live']}
                image={course.thumbnailUrl}
                instructor={{
                  name: course.instructor,
                  avatar: ""
                }}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="popular" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCourses.map(course => (
              <CourseCard 
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                duration={`${course.duration} hours`}
                studentsCount={course.studentsCount}
                rating={course.rating}
                lastUpdated={course.lastUpdated}
                tags={[course.category, 'Popular']}
                image={course.thumbnailUrl}
                instructor={{
                  name: course.instructor,
                  avatar: ""
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
=======
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
              // Additional safety check
              if (!subject || !subject.title) {
                return null;
              }

              const chapterCount = chapterCounts[subject.id] || 0;

              return viewMode === 'grid' ? (
                <Card key={subject.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[16/9] w-full bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 relative">
                    {subject.thumbnail_url ? (
                      <img 
                        src={subject.thumbnail_url} 
                        alt={subject.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Subject thumbnail load error');
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {subject.icon ? (
                          <span className="text-4xl text-primary opacity-80">{subject.icon}</span>
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
              ) : (
                <Card key={subject.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {subject.thumbnail_url ? (
                          <img 
                            src={subject.thumbnail_url} 
                            alt={subject.title}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              console.error('Subject thumbnail load error');
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : subject.icon ? (
                          <span className="text-2xl text-primary opacity-80">{subject.icon}</span>
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
            })}
          </div>
        </>
      )}
>>>>>>> main
    </div>
  );
};

export default SubjectCatalog;
