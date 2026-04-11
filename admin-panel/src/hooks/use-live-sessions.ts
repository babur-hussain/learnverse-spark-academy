
import { useState, useEffect } from 'react';
import { LiveSession } from '@/types/video';
import apiClient from '@/integrations/api/client';
import { useAuth } from '@/contexts/AuthContext';

export const useLiveSessions = () => {
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<LiveSession[]>([]);
  const [pastSessions, setPastSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    const loadSessions = async () => {
      try {
        setIsLoading(true);
        
        const { data } = await apiClient.get('/api/live-sessions');
        
        const mapToLiveSession = (session: any): LiveSession => ({
          id: session.id,
          title: session.title,
          description: session.description,
          courseId: session.course_id || session.courseId,
          batchId: session.batch_id || session.batchId,
          instructorId: session.instructor_id || session.instructorId,
          scheduledStartTime: session.scheduled_start_time || session.scheduledStartTime,
          scheduledEndTime: session.scheduled_end_time || session.scheduledEndTime,
          actualStartTime: session.actual_start_time || session.actualStartTime,
          actualEndTime: session.actual_end_time || session.actualEndTime,
          status: session.status,
          streamUrl: session.stream_url || session.streamUrl,
          recordedUrl: session.recorded_url || session.recordedUrl,
          chatEnabled: session.chat_enabled ?? session.chatEnabled,
          isActive: session.is_active ?? session.isActive,
          accessLevel: session.access_level || session.accessLevel,
        });
        
        const upcoming = (data.upcoming || []).map(mapToLiveSession);
        const active = (data.active || []).map(mapToLiveSession);
        const past = (data.past || []).map(mapToLiveSession);
        
        setUpcomingSessions(upcoming);
        setActiveSessions(active);
        setPastSessions(past);
      } catch (error) {
        console.error('Error fetching live sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSessions();
    
    // Poll for updates every 30 seconds (replaces Supabase realtime)
    const interval = setInterval(loadSessions, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, [user]);
  
  return { upcomingSessions, activeSessions, pastSessions, isLoading };
};
