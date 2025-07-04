import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { BookOpen, Users, Clock, Star, Play, Download, Eye, ChevronRight, GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import MobileFooter from '@/components/Layout/MobileFooter';
import useIsMobile from '@/hooks/use-mobile';

interface Subject {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  thumbnail_url?: string;
}

interface ClassData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface SubjectWithOrder {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  thumbnail_url?: string;
  order_index: number;
}

const StudyClass = () => {
  const { classSlug } = useParams();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (classSlug) {
      fetchClassData();
      fetchSubjects();
    }
  }, [classSlug]);

  const fetchClassData = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('slug', classSlug)
        .single();
      
      if (error) throw error;
      setClassData(data);
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data: classData } = await supabase
        .from('classes')
        .select('id')
        .eq('slug', classSlug)
        .single();

      if (!classData) return;

      // First get the class_subjects to get the order
      const { data: classSubjects, error: classSubjectsError } = await supabase
        .from('class_subjects')
        .select('subject_id, order_index')
        .eq('class_id', classData.id)
        .order('order_index');

      if (classSubjectsError) throw classSubjectsError;

      if (!classSubjects || classSubjects.length === 0) {
        setSubjects([]);
        setIsLoading(false);
        return;
      }

      // Then get the subjects data
      const subjectIds = classSubjects.map(cs => cs.subject_id);
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, title, description, icon, thumbnail_url')
        .in('id', subjectIds)
        .eq('is_active', true);

      if (subjectsError) throw subjectsError;

      // Combine and sort by order_index
      const subjectsWithOrder: SubjectWithOrder[] = (subjectsData || []).map(subject => {
        const classSubject = classSubjects.find(cs => cs.subject_id === subject.id);
        return {
          ...subject,
          order_index: classSubject?.order_index || 0
        };
      }).sort((a, b) => a.order_index - b.order_index);

      // Convert to Subject[] format - simplified without destructuring
      const finalSubjects: Subject[] = subjectsWithOrder.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        icon: item.icon,
        thumbnail_url: item.thumbnail_url
      }));
      
      setSubjects(finalSubjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">{classData?.icon || '📚'}</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{classData?.name || 'Class'}</h1>
                <p className="text-xl opacity-90">
                  {classData?.description || `Comprehensive learning materials for ${classData?.name}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{subjects.length} Subjects</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>12,345+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>4.8 Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Subjects</h2>
            <p className="text-gray-600">Choose a subject to start your learning journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/subject/${subject.id}`}
                className="block group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden group-hover:scale-105">
                  <CardHeader className="p-0">
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                      {subject.thumbnail_url ? (
                        <img 
                          src={subject.thumbnail_url} 
                          alt={subject.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-white/20 text-white border-white/30 mb-2">
                          {classData?.name}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {subject.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {subject.description || `Complete ${subject.title} course with comprehensive materials`}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">12</div>
                        <div className="text-xs text-gray-500">Chapters</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">45</div>
                        <div className="text-xs text-gray-500">Notes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">28</div>
                        <div className="text-xs text-gray-500">Videos</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <span className="text-sm text-gray-500">(4.8)</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Free Access
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {subjects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No subjects available for this class.</p>
            </div>
          )}
        </div>
      </div>

      {isMobile && user && <MobileFooter />}
    </>
  );
};

export default StudyClass;
