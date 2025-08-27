import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import SearchBar from '@/components/UI/SearchBar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Folder, 
  Calendar,
  Star,
  Share2,
  BookOpen,
  GraduationCap,
  Building2,
  Play,
  Download,
  FileText,
  Headphones,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';

interface Subject {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  icon?: string;
  class_id?: string;
  college_id?: string;
}

interface Class {
  id: string;
  name: string;
  description?: string;
}

interface College {
  id: string;
  name: string;
  description?: string;
}

const NotesSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'classes' | 'colleges' | 'subjects'>('classes');

  // Fetch all classes
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Class[];
    }
  });

  // Fetch all colleges
  const { data: colleges, isLoading: collegesLoading } = useQuery({
    queryKey: ['colleges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as College[];
    }
  });

  // Fetch subjects for selected class or college
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['notes-subjects', selectedClass, selectedCollege],
    queryFn: async () => {
      if (!selectedClass && !selectedCollege) return [];
      
      if (selectedClass) {
        const { data, error } = await supabase
          .from('class_subjects')
          .select('subject_id, subjects(*)')
          .eq('class_id', selectedClass)
          .order('order_index', { ascending: true });
        if (error) throw error;
        return (data || []).map((row: any) => row.subjects);
      } else if (selectedCollege) {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('college_id', selectedCollege)
          .order('title', { ascending: true });
        if (error) throw error;
        return data || [];
      }
      
      return [];
    },
    enabled: !!(selectedClass || selectedCollege)
  });

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    setSelectedCollege('');
    setActiveTab('subjects');
  };

  const handleCollegeSelect = (collegeId: string) => {
    setSelectedCollege(collegeId);
    setSelectedClass('');
    setActiveTab('subjects');
  };

  const isUrl = (str: string) => {
    return !!str && (str.startsWith('http://') || str.startsWith('https://'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 pt-20 pb-8 md:pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Study Notes & Resources
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Access comprehensive study materials, notes, and audio resources for all classes and colleges
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="classes" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Classes
              </TabsTrigger>
              <TabsTrigger value="colleges" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Colleges
              </TabsTrigger>
              <TabsTrigger value="subjects" className="flex items-center gap-2" disabled={!selectedClass && !selectedCollege}>
                <BookOpen className="h-4 w-4" />
                Subjects
              </TabsTrigger>
            </TabsList>

            {/* Classes Tab */}
            <TabsContent value="classes" className="mt-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Your Class</h2>
                <p className="text-gray-600 dark:text-gray-300">Choose your class to view available subjects and study materials</p>
              </div>
              
              {classesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {classes?.map((cls) => (
                    <Card 
                      key={cls.id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-2 hover:border-indigo-300"
                      onClick={() => handleClassSelect(cls.id)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {cls.name}
                        </h3>
                        {cls.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {cls.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Colleges Tab */}
            <TabsContent value="colleges" className="mt-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Your College</h2>
                <p className="text-gray-600 dark:text-gray-300">Choose your college to view available subjects and study materials</p>
              </div>
              
              {collegesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {colleges?.map((college) => (
                    <Card 
                      key={college.id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-2 hover:border-purple-300"
                      onClick={() => handleCollegeSelect(college.id)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Building2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                          {college.name}
                        </h3>
                        {college.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {college.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Subjects Tab */}
            <TabsContent value="subjects" className="mt-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedClass ? 'Class Subjects' : 'College Subjects'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Browse subjects and access study materials, notes, and audio resources
                </p>
              </div>
              
              {subjectsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : !subjects || subjects.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Subjects Available</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedClass ? 'No subjects mapped to this class yet.' : 'No subjects available for this college yet.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {subjects.map((subject: Subject) => (
                    <Card 
                      key={subject.id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-2 hover:border-indigo-300"
                      onClick={() => navigate(`/subject/${subject.id}`)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center group-hover:scale-110 transition-transform">
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
                              <span className="text-3xl text-indigo-600 dark:text-indigo-400 opacity-80">{subject.icon}</span>
                            )
                          ) : (
                            <BookOpen size={32} className="text-indigo-600 dark:text-indigo-400 opacity-80" />
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {subject.title}
                        </h3>
                        {subject.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {subject.description}
                          </p>
                        )}
                        <div className="flex justify-center mt-3">
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default NotesSection;