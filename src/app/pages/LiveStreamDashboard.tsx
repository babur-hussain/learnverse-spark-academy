import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Badge } from '@/components/UI/badge';
import { Progress } from '@/components/UI/progress';
import { Separator } from '@/components/UI/separator';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import AuthGuard from '@/components/Layout/AuthGuard';
import InstructorRoleGuard from '@/components/Layout/InstructorRoleGuard';
import { LiveStreamingService } from '@/services/LiveStreamingService';
import { LiveSessionService } from '@/services/LiveSessionService';
import StreamingInstructions from '@/components/VideoManagement/StreamingInstructions';
import LiveChatPanel from '@/components/VideoManagement/LiveChatPanel';
import LiveAnalytics from '@/components/VideoManagement/LiveAnalytics';
import StreamPreview from '@/components/VideoManagement/StreamPreview';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client'; // Add the import for supabase
import { 
  Play, 
  Square, 
  Users, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  Check
} from 'lucide-react';

const LiveStreamDashboard = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [streamData, setStreamData] = useState<{ streamUrl: string; streamKey: string } | null>(null);
  const [streamInstructions, setStreamInstructions] = useState<any>(null);
  const [streamStatus, setStreamStatus] = useState<'offline' | 'connecting' | 'live' | 'ended'>('offline');
  const [viewerCount, setViewerCount] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('preview');
  const [streamStartTime, setStreamStartTime] = useState<Date | null>(null);
  
  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) return;
      
      try {
        setIsLoading(true);
        
        // In a real implementation, you would fetch the session data from your API
        const { data: sessionData } = await supabase
          .from('live_sessions')
          .select(`
            *,
            courses:course_id (title, description),
            batches:batch_id (name, is_paid)
          `)
          .eq('id', sessionId)
          .single();
        
        if (sessionData) {
          setSession(sessionData);
          
          // Check if stream is already active
          if (sessionData.is_active && sessionData.status === 'live') {
            setStreamStatus('live');
            
            // Set stream start time if available
            if (sessionData.actual_start_time) {
              setStreamStartTime(new Date(sessionData.actual_start_time));
            }
            
            // If stream URL exists, get the streaming instructions
            if (sessionData.stream_url) {
              const streamService = new LiveStreamingService();
              
              // Extract stream key from stored data (in a real app, you'd have a more secure way to handle this)
              const streamKey = sessionData.stream_url.split('/').pop() || '';
              
              setStreamData({
                streamUrl: sessionData.stream_url,
                streamKey
              });
              
              // Get OBS setup instructions
              const obsInstructions = streamService.getOBSInstructions(
                sessionData.stream_url, 
                streamKey
              );
              
              setStreamInstructions(obsInstructions);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
        toast({
          title: "Error fetching session",
          description: "Could not load the session data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessionData();
  }, [sessionId]); // Remove toast dependency to prevent infinite loops
  
  // Update stream duration when live
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (streamStatus === 'live' && streamStartTime) {
      interval = setInterval(() => {
        const durationMs = Date.now() - streamStartTime.getTime();
        const durationSec = Math.floor(durationMs / 1000);
        setStreamDuration(durationSec);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [streamStatus, streamStartTime]);
  
  // Simulate viewer count for demo purposes
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (streamStatus === 'live') {
      // Start with random number between 5-15
      setViewerCount(Math.floor(Math.random() * 11) + 5);
      
      // Update viewer count periodically
      interval = setInterval(() => {
        // Random fluctuation between -2 and +5
        const change = Math.floor(Math.random() * 8) - 2;
        setViewerCount(prev => Math.max(1, prev + change));
      }, 10000); // every 10 seconds
    } else {
      setViewerCount(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [streamStatus]);
  
  const handleStartStream = async () => {
    if (!session) return;
    
    try {
      setStreamStatus('connecting');
      
      // Initialize streaming service
      const streamingService = new LiveStreamingService();
      const streamData = await streamingService.createStream(session.title);
      
      setStreamData(streamData);
      
      // Get OBS setup instructions
      const obsInstructions = streamingService.getOBSInstructions(
        streamData.streamUrl, 
        streamData.streamKey
      );
      
      setStreamInstructions(obsInstructions);
      
      // In a real implementation, you would update the session in your database
      await LiveSessionService.startLiveSession(sessionId, streamData.streamUrl);
      
      // Update local state
      setSession({
        ...session,
        is_active: true,
        status: 'live',
        actual_start_time: new Date().toISOString(),
        stream_url: streamData.streamUrl
      });
      
      // Simulate connection process
      setTimeout(() => {
        setStreamStatus('live');
        setStreamStartTime(new Date());
        
        toast({
          title: "Stream started",
          description: "Your live stream is now active!",
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error starting stream:', error);
      setStreamStatus('offline');
      
      toast({
        title: "Failed to start stream",
        description: "There was an error starting your live stream. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleEndStream = async () => {
    if (!session || !streamData) return;
    
    try {
      // End the stream
      const streamingService = new LiveStreamingService();
      await streamingService.endStream(streamData.streamKey);
      
      // In a real implementation, you would update the session in your database
      await LiveSessionService.endLiveSession(sessionId);
      
      // Update local state
      setStreamStatus('ended');
      setSession({
        ...session,
        is_active: false,
        status: 'ended',
        actual_end_time: new Date().toISOString()
      });
      
      toast({
        title: "Stream ended",
        description: "Your live stream has been ended successfully.",
      });
      
    } catch (error) {
      console.error('Error ending stream:', error);
      
      toast({
        title: "Failed to end stream",
        description: "There was an error ending your live stream. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Function to format duration in HH:MM:SS format
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <AuthGuard>
        <InstructorRoleGuard>
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-6">
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4">Loading your stream dashboard...</p>
                </div>
              </div>
            </main>
            {isMobile && <MobileFooter />}
          </div>
        </InstructorRoleGuard>
      </AuthGuard>
    );
  }
  
  // Render 404 state if session not found
  if (!session) {
    return (
      <AuthGuard>
        <InstructorRoleGuard>
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-6">
              <div className="flex flex-col justify-center items-center h-full">
                <h1 className="text-2xl font-bold text-center">Session Not Found</h1>
                <p className="text-muted-foreground mt-2">The streaming session you're looking for doesn't exist or you don't have permission to access it.</p>
                <Button className="mt-4" onClick={() => navigate('/video-management')}>
                  Return to Video Management
                </Button>
              </div>
            </main>
            {isMobile && <MobileFooter />}
          </div>
        </InstructorRoleGuard>
      </AuthGuard>
    );
  }
  
  return (
    <AuthGuard>
      <InstructorRoleGuard>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{session.title}</h1>
                <p className="text-muted-foreground mt-1">{session.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={
                    streamStatus === 'live' ? 'default' :
                    streamStatus === 'connecting' ? 'outline' :
                    streamStatus === 'ended' ? 'secondary' : 'outline'
                  }>
                    {streamStatus === 'live' ? 'LIVE' : 
                     streamStatus === 'connecting' ? 'Connecting...' : 
                     streamStatus === 'ended' ? 'Ended' : 'Not Started'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm">Course: {session.courses?.title || 'Unknown'}</span>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm">Batch: {session.batches?.name || 'All batches'}</span>
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                {streamStatus === 'offline' && (
                  <Button onClick={handleStartStream} className="bg-red-600 hover:bg-red-700">
                    <Play className="mr-2 h-4 w-4" /> Go Live
                  </Button>
                )}
                {streamStatus === 'connecting' && (
                  <Button disabled className="bg-orange-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current mr-2" /> Connecting...
                  </Button>
                )}
                {streamStatus === 'live' && (
                  <Button onClick={handleEndStream} variant="destructive">
                    <Square className="mr-2 h-4 w-4" /> End Stream
                  </Button>
                )}
                {streamStatus === 'ended' && (
                  <Button onClick={handleStartStream} variant="outline">
                    <Play className="mr-2 h-4 w-4" /> Start New Stream
                  </Button>
                )}
              </div>
            </div>
            
            {/* Stream stats when live */}
            {(streamStatus === 'live' || streamStatus === 'ended') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6 flex items-center">
                    <Users className="h-8 w-8 text-primary mr-4" />
                    <div>
                      <p className="text-sm text-muted-foreground">Current Viewers</p>
                      <h3 className="text-2xl font-bold">{viewerCount}</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 flex items-center">
                    <Clock className="h-8 w-8 text-primary mr-4" />
                    <div>
                      <p className="text-sm text-muted-foreground">Stream Duration</p>
                      <h3 className="text-2xl font-bold">{formatDuration(streamDuration)}</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 flex items-center">
                    <MessageSquare className="h-8 w-8 text-primary mr-4" />
                    <div>
                      <p className="text-sm text-muted-foreground">Chat Messages</p>
                      <h3 className="text-2xl font-bold">34</h3>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Connection error state */}
            {streamStatus === 'offline' && streamData && (
              <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                    <p className="text-orange-800 dark:text-orange-200 font-medium">
                      OBS is not connected. Please make sure OBS Studio is properly configured and started.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Stream ready confirmation */}
            {streamStatus === 'live' && (
              <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      Stream is active and running smoothly! Your viewers can watch now.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="preview">Stream Preview</TabsTrigger>
                <TabsTrigger value="chat">Live Chat</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Stream Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <StreamPreview 
                      streamUrl={session.stream_url} 
                      status={streamStatus} 
                      thumbnailUrl={session.thumbnail_url}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Stream Info</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-sm text-muted-foreground">
                            {streamStatus === 'live' ? 'Live now' : 
                             streamStatus === 'connecting' ? 'Connecting...' : 
                             streamStatus === 'ended' ? 'Stream ended' : 'Not started'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Scheduled start</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(session.scheduled_start_time, 'PPp')}
                          </p>
                        </div>
                        {session.actual_start_time && (
                          <div>
                            <p className="text-sm font-medium">Actual start</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(session.actual_start_time, 'PPp')}
                            </p>
                          </div>
                        )}
                        {session.actual_end_time && (
                          <div>
                            <p className="text-sm font-medium">Stream ended</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(session.actual_end_time, 'PPp')}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">Visibility</p>
                          <p className="text-sm text-muted-foreground">
                            {session.access_level === 'free' ? 'Public - Available to all enrolled students' : 
                             session.access_level === 'paid' ? 'Paid - Available to students who purchased the course' :
                             'Subscription - Available to subscribers only'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="chat" className="mt-0">
                <LiveChatPanel 
                  sessionId={sessionId} 
                  isActive={streamStatus === 'live'} 
                  isModerator={true}
                />
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-0">
                <LiveAnalytics 
                  sessionId={sessionId} 
                  viewerCount={viewerCount}
                  streamDuration={streamDuration}
                />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0">
                {streamInstructions && (
                  <StreamingInstructions
                    streamUrl={streamInstructions.server}
                    streamKey={streamInstructions.key}
                    settings={streamInstructions.settings}
                  />
                )}
                {!streamInstructions && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Stream settings will be available once you start the stream.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
          {isMobile && <MobileFooter />}
        </div>
      </InstructorRoleGuard>
    </AuthGuard>
  );
};

export default LiveStreamDashboard;
