import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

interface Subject {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string | null;
  icon?: string | null;
}

const isUrl = (str?: string | null) => {
  return !!str && (str.startsWith('http://') || str.startsWith('https://'));
};

const ClassSubjectsGrid: React.FC<{ selectedClass: string; selectedCollege: string }> = ({ selectedClass, selectedCollege }) => {
  const navigate = useNavigate();

  // Fetch subjects mapped to the selected class or college
  const { data: subjects, isLoading, error } = useQuery({
    queryKey: ['class-college-subjects', selectedClass, selectedCollege],
    queryFn: async () => {
      if (!selectedClass && !selectedCollege) return [];
      
      if (selectedClass) {
        // Fetch subjects for selected class
        const { data, error } = await supabase
          .from('class_subjects')
          .select('subject_id, subjects(*)')
          .eq('class_id', selectedClass)
          .order('order_index', { ascending: true });
        if (error) throw error;
        return (data || []).map((row: any) => row.subjects);
      } else if (selectedCollege) {
        // Fetch subjects for selected college
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

  if (!selectedClass && !selectedCollege) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-learn-purple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground py-8">Failed to load subjects.</div>
    );
  }

  if (!subjects || subjects.length === 0) {
    const message = selectedClass 
      ? "No subjects mapped to this class yet."
      : "No subjects available for this college yet.";
    return (
      <div className="text-center text-muted-foreground py-8">{message}</div>
    );
  }

  const sectionTitle = selectedClass ? "Class Subjects" : "College Subjects";

  return (
    <section className="w-full py-8 bg-white dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">{sectionTitle}</h2>
          <div className="flex justify-center">
            <div className="w-16 h-1 rounded-full bg-primary mb-4"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {subjects.map((subject: Subject) => (
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClassSubjectsGrid; 