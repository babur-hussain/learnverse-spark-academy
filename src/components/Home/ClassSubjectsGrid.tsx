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

const ClassSubjectsGrid: React.FC<{ selectedClass: string }> = ({ selectedClass }) => {
  const navigate = useNavigate();

  // Fetch subjects mapped to the selected class
  const { data: subjects, isLoading, error } = useQuery({
    queryKey: ['class-subjects', selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      const { data, error } = await supabase
        .from('class_subjects')
        .select('subject_id, subjects(*)')
        .eq('class_id', selectedClass)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []).map((row: any) => row.subjects);
    },
    enabled: !!selectedClass
  });

  if (!selectedClass) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-learn-purple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground py-8">Failed to load subjects for this class.</div>
    );
  }

  if (!subjects || subjects.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">No subjects mapped to this class yet.</div>
    );
  }

  return (
    <section className="w-full py-8 bg-white dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Subjects</h2>
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
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center mb-3 border-2 border-primary group-hover:scale-105 transition-transform overflow-hidden">
                {subject.thumbnail_url ? (
                  <img
                    src={subject.thumbnail_url}
                    alt={subject.title}
                    className="w-full h-full object-cover rounded-full"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                ) : subject.icon ? (
                  isUrl(subject.icon) ? (
                    <img
                      src={subject.icon}
                      alt={subject.title}
                      className="w-12 h-12 object-contain"
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