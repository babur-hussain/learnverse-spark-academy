import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LiveSession } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';
import { EducationalLoader } from '@/components/UI/educational-loader';

interface LiveClassRoomProps {
  sessionId?: string;
}

const LiveClassRoom: React.FC<LiveClassRoomProps> = ({ sessionId }) => {
  const params = useParams<{ sessionId: string }>();
  const actualSessionId = sessionId || params.sessionId;
  const [session, setSession] = useState<LiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin, isTeacher } = useUserRole();
  
  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!actualSessionId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('live_sessions')
          .select(`
            *,
            courses:course_id (title, description),
            batches:batch_id (name, is_paid)
          `)
          .eq('id', actualSessionId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setSession({
            id: data.id,
            title: data.title,
            description: data.description,
            courseId: data.course_id,
            batchId: data.batch_id,
            instructorId: data.instructor_id,
            scheduledStartTime: data.scheduled_start_time,
            scheduledEndTime: data.scheduled_end_time,
            actualStartTime: data.actual_start_time,
            actualEndTime: data.actual_end_time,
            status: (data.status as "scheduled" | "live" | "ended") || "scheduled",
            streamUrl: data.stream_url,
            recordedUrl: data.recorded_url,
            chatEnabled: data.chat_enabled,
            isActive: data.is_active,
            accessLevel: (data.access_level as "free" | "paid" | "subscription") || "free"
          });
        }
      } catch (error) {
        console.error('Error fetching session details:', error);
        toast({
          title: "Error",
          description: "Failed to load live session details.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessionDetails();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('public:live_sessions')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'live_sessions',
        filter: `id=eq.${actualSessionId}` 
      }, (payload) => {
        console.log('Live session updated:', payload);
        fetchSessionDetails();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [actualSessionId, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <EducationalLoader message="Setting up your live class..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
          <p className="text-muted-foreground">The live session you're looking for doesn't exist or has ended.</p>
        </div>
      </div>
    );
  }

  if (session.status === 'ended' && session.recordedUrl) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{session.title} (Recording)</h1>
        
        <div className="aspect-video w-full bg-black mb-6">
          <video 
            controls 
            className="w-full h-full" 
            src={session.recordedUrl}
            poster={`https://via.placeholder.com/1280x720.png?text=${encodeURIComponent(session.title)}`}
          />
        </div>
        
        <div className="prose max-w-none mb-8">
          <h2>Session Description</h2>
          <p>{session.description || 'No description available.'}</p>
        </div>
      </div>
    );
  }

  if (session.status === 'scheduled') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{session.title}</h1>
        
        <div className="bg-learn-purple/5 border border-learn-purple/20 rounded-lg p-8 text-center mb-8">
          <h2 className="text-xl font-semibold mb-4">This session hasn't started yet</h2>
          <p className="mb-4">The instructor will start the session at the scheduled time.</p>
          <p className="text-sm text-muted-foreground">
            Scheduled start: {new Date(session.scheduledStartTime).toLocaleString()}
          </p>
        </div>
        
        <div className="prose max-w-none">
          <h2>Session Description</h2>
          <p>{session.description || 'No description available.'}</p>
        </div>
        
        {/* Instructor view - show start button */}
        {(isAdmin || isTeacher || (user && session.instructorId === user.id)) && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium mb-2">Instructor Controls</h3>
            <p className="text-sm mb-4">You can start this session now or wait until the scheduled time.</p>
            <button className="px-4 py-2 bg-learn-purple text-white rounded hover:bg-learn-purple/90">
              Start Session Now
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{session.title}</h1>
      
      {session.isActive && session.streamUrl ? (
        <div className="aspect-video w-full bg-black mb-6">
          <iframe 
            className="w-full h-full" 
            src={session.streamUrl}
            allow="camera; microphone; fullscreen; display-capture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gray-900 flex items-center justify-center mb-6">
          <div className="text-center text-white">
            <p>Stream not available</p>
            {(isAdmin || isTeacher || (user && session.instructorId === user.id)) && (
              <button className="mt-4 px-4 py-2 bg-learn-purple text-white rounded hover:bg-learn-purple/90">
                Start Stream
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 prose max-w-none">
          <h2>Session Description</h2>
          <p>{session.description || 'No description available.'}</p>
        </div>
        
        {session.chatEnabled && (
          <div className="lg:col-span-1">
            <div className="border rounded-lg h-96 flex flex-col">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium">Live Chat</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-center text-muted-foreground py-8">
                  Chat functionality will be implemented soon.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveClassRoom;
