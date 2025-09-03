
import { useState, useEffect } from 'react';
import { LiveSession } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';
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
        
        // Fetch upcoming sessions
        const { data: upcoming, error: upcomingError } = await supabase
          .from('live_sessions')
          .select(`
            *,
            courses:course_id (title, description),
            batches:batch_id (name, is_paid)
          `)
          .gt('scheduled_start_time', new Date().toISOString())
          .eq('status', 'scheduled')
          .order('scheduled_start_time', { ascending: true });
          
        if (upcomingError) throw upcomingError;
        
        // Fetch active sessions
        const { data: active, error: activeError } = await supabase
          .from('live_sessions')
          .select(`
            *,
            courses:course_id (title, description),
            batches:batch_id (name, is_paid)
          `)
          .eq('is_active', true)
          .eq('status', 'live')
          .order('actual_start_time', { ascending: false });
          
        if (activeError) throw activeError;
        
        // Fetch past sessions with recordings
        const { data: past, error: pastError } = await supabase
          .from('live_sessions')
          .select(`
            *,
            courses:course_id (title, description),
            batches:batch_id (name, is_paid)
          `)
          .eq('status', 'ended')
          .not('recorded_url', 'is', null)
          .order('actual_end_time', { ascending: false });
          
        if (pastError) throw pastError;
        
        // Convert data to our LiveSession type
        const mapDbSessionToLiveSession = (session: any): LiveSession => ({
          id: session.id,
          title: session.title,
          description: session.description,
          courseId: session.course_id,
          batchId: session.batch_id,
          instructorId: session.instructor_id,
          scheduledStartTime: session.scheduled_start_time,
          scheduledEndTime: session.scheduled_end_time,
          actualStartTime: session.actual_start_time,
          actualEndTime: session.actual_end_time,
          status: session.status,
          streamUrl: session.stream_url,
          recordedUrl: session.recorded_url,
          chatEnabled: session.chat_enabled,
          isActive: session.is_active,
          accessLevel: session.access_level
        });
        
        setUpcomingSessions(upcoming?.map(mapDbSessionToLiveSession) || []);
        setActiveSessions(active?.map(mapDbSessionToLiveSession) || []);
        setPastSessions(past?.map(mapDbSessionToLiveSession) || []);
      } catch (error) {
        console.error('Error fetching live sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSessions();
    
    // Set up realtime subscription for live session updates
    const liveSessionsChannel = supabase
      .channel('public:live_sessions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'live_sessions'
      }, (payload) => {
        // Reload all sessions when there's any change
        loadSessions();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(liveSessionsChannel);
    };
  }, [user]);
  
  return { upcomingSessions, activeSessions, pastSessions, isLoading };
};
