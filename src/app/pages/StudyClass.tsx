import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/UI/card';
import { Skeleton } from '@/components/UI/skeleton';
import { BookOpen } from 'lucide-react';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import Navbar from '@/components/Layout/Navbar';

const StudyClass: React.FC = () => {
  const { classSlugOrId } = useParams();
  const navigate = useNavigate();

  // Fetch class by slug
  const { data: classData, isLoading: isLoadingClass, error: classError } = useQuery({
    queryKey: ['class', classSlugOrId],
    queryFn: async () => {
      console.log('StudyClass: classSlugOrId param =', classSlugOrId);
      let { data, error } = await supabase
        .from('classes')
        .select('*')
        .or(`slug.eq.${classSlugOrId},id.eq.${classSlugOrId}`)
        .single();
      if (error) {
        console.warn('StudyClass: initial class query error:', error);
        // Fallback: try slug only
        const { data: data2, error: error2 } = await supabase
          .from('classes')
          .select('*')
          .eq('slug', classSlugOrId)
          .single();
        if (error2) {
          console.error('StudyClass: fallback class query error:', error2);
          throw error2;
        }
        data = data2;
      }
      console.log('StudyClass: classData result =', data);
      return data;
    },
    enabled: !!classSlugOrId
  });

  // Fetch mapped subjects
  const { data: subjects, isLoading: isLoadingSubjects, error: subjectsError } = useQuery({
    queryKey: ['class-subjects', classData?.id],
    queryFn: async () => {
      if (!classData?.id) return [];
      const { data, error } = await supabase
        .from('class_subjects')
        .select('subject_id, subjects(*)')
        .eq('class_id', classData.id)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []).map((row: any) => row.subjects);
    },
    enabled: !!classData?.id
  });

  if (isLoadingClass) {
    return <div className="py-12"><Skeleton className="h-8 w-1/3 mb-6" /><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{Array.from({length: 3}).map((_,i) => <Skeleton key={i} className="h-40" />)}</div></div>;
  }
  if (classError || !classData) {
    return <div className="py-12 text-center text-muted-foreground">Class not found.</div>;
  }

  return (
    <>
      <Navbar />
      <div className="py-8 max-w-5xl mx-auto">
        <BreadcrumbNav items={[{ label: 'Home', href: '/' }, { label: 'Study', href: '/study' }, { label: classData.name }]} />
        {/* Class Info Card */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-6 bg-gradient-to-r from-indigo-100/60 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900/30">
          <div className="flex-shrink-0 h-20 w-20 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-200 text-4xl font-bold text-center">
            {classData.icon ? (
              <img src={classData.icon} alt={classData.name} className="h-full w-full object-cover rounded-full" />
            ) : (
              classData.name?.[0] || '?' // First letter fallback
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-1 truncate">{classData.name}</h1>
            {classData.description && <p className="text-gray-600 dark:text-gray-300 text-base mb-1 line-clamp-2">{classData.description}</p>}
            <div className="text-xs text-muted-foreground">Class slug: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{classData.slug}</span></div>
          </div>
        </div>
        {/* Subjects Grid */}
        <h2 className="text-2xl font-semibold mb-4">Subjects</h2>
        {isLoadingSubjects ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({length: 3}).map((_,i) => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : subjectsError ? (
          <div className="text-muted-foreground">Failed to load subjects.</div>
        ) : subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {subjects.map((subject: any) => (
              <Card key={subject.id} className="overflow-hidden group hover:shadow-xl transition-shadow cursor-pointer border border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-gray-900/60">
                <div className="relative aspect-video bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 dark:from-indigo-500/20 dark:to-indigo-500/10 flex items-center justify-center">
                  {subject.thumbnail_url ? (
                    <img src={subject.thumbnail_url} alt={subject.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={56} className="text-indigo-500 opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                </div>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">{subject.title}</h3>
                  {subject.description && <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-2">{subject.description}</p>}
                  <button
                    className="mt-2 w-full py-2 rounded bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition"
                    onClick={() => navigate(`/study/${classData.slug}/${subject.id}`)}
                  >
                    View Resources
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-12">
            <BookOpen size={48} className="mx-auto mb-4 text-indigo-300" />
            <div className="text-lg font-semibold mb-2">No subjects mapped to this class yet.</div>
            <div className="text-sm">Subjects assigned to this class will appear here for students to explore.</div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudyClass; 