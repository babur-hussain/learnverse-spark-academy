import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';
import { useSafeQuery } from '@/hooks/use-safe-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  bio?: string;
  phone?: string;
  location?: string;
  subjects_teaching?: string[];
  specializations?: string[];
  experience_years?: number;
  education?: string;
  current_grade?: string;
  school?: string;
  interests?: string[];
  created_at: string;
}

export interface CourseProgress {
  id: string;
  course_id: string;
  course_title: string;
  course_thumbnail: string;
  progress_percentage: number;
  last_accessed: string;
  total_lessons: number;
  completed_lessons: number;
  enrollment_date: string;
  status: 'active' | 'completed' | 'paused';
}

export interface StudyStats {
  total_study_time: number; // in minutes
  weekly_study_time: number;
  monthly_study_time: number;
  current_streak: number;
  longest_streak: number;
  courses_completed: number;
  courses_in_progress: number;
  total_xp: number;
  level: number;
  badges_earned: number;
}

export const useProfileData = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [studyTime, setStudyTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useSafeQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user?.id,
    showErrorToast: true
  });

  // Fetch course progress
  const { data: courseProgress, isLoading: progressLoading } = useSafeQuery({
    queryKey: ['course-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_courses')
        .select(`
          *,
          courses (
            id,
            title,
            thumbnail_url,
            description
          )
        `)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Mock progress data since we don't have a progress tracking table yet
      return data.map(course => ({
        id: course.id,
        course_id: course.course_id,
        course_title: course.courses?.title || 'Unknown Course',
        course_thumbnail: course.courses?.thumbnail_url || '',
        progress_percentage: Math.floor(Math.random() * 100),
        last_accessed: new Date().toISOString(),
        total_lessons: Math.floor(Math.random() * 20) + 5,
        completed_lessons: Math.floor(Math.random() * 15),
        enrollment_date: course.created_at,
        status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'paused' : 'active'
      })) as CourseProgress[];
    },
    enabled: !!user?.id,
    showErrorToast: true
  });

  // Fetch study statistics
  const { data: studyStats, isLoading: statsLoading } = useSafeQuery({
    queryKey: ['study-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Get XP data
      const { data: xpData } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      // Get streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      // Get badges count
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('count')
        .eq('user_id', user.id);
        
      // Mock study time data since we don't have tracking yet
      return {
        total_study_time: studyTime + Math.floor(Math.random() * 1000) + 500,
        weekly_study_time: Math.floor(Math.random() * 300) + 100,
        monthly_study_time: Math.floor(Math.random() * 1200) + 400,
        current_streak: streakData?.current_streak || 0,
        longest_streak: streakData?.longest_streak || 0,
        courses_completed: Math.floor(Math.random() * 5) + 1,
        courses_in_progress: courseProgress?.length || 0,
        total_xp: xpData?.total_xp || 0,
        level: xpData?.level || 1,
        badges_earned: badgesData?.length || 0
      } as StudyStats;
    },
    enabled: !!user?.id,
    showErrorToast: true
  });

  // Study time tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 60000); // Update every minute
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);

  const startStudySession = () => {
    setIsActive(true);
  };

  const endStudySession = () => {
    setIsActive(false);
    // Here you would save the study time to the database
  };

  return {
    profile,
    courseProgress: courseProgress || [],
    studyStats,
    isLoading: profileLoading || progressLoading || statsLoading,
    role,
    studyTime,
    isActive,
    startStudySession,
    endStudySession
  };
};
