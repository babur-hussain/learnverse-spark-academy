import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';
import { useSafeQuery } from '@/hooks/use-safe-query';
import apiClient from '@/integrations/api/client';

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
      
      const { data } = await apiClient.get(`/api/users/profile`);
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
      
      const { data } = await apiClient.get(`/api/users/course-progress`);
      return data as CourseProgress[];
    },
    enabled: !!user?.id,
    showErrorToast: true
  });

  // Fetch study statistics
  const { data: studyStats, isLoading: statsLoading } = useSafeQuery({
    queryKey: ['study-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data } = await apiClient.get(`/api/users/study-stats`);
      return data as StudyStats;
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
