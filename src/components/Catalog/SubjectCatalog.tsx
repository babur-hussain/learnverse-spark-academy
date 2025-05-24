
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
    </div>
  );
};

export default SubjectCatalog;
