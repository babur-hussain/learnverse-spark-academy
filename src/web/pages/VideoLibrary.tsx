import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import VideoCategories from '@/components/VideoLibrary/VideoCategories';
import VideoList from '@/components/VideoLibrary/VideoList';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Button } from '@/components/UI/button';
import { Card, CardContent } from '@/components/UI/card';
import { CalendarIcon, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import AuthGuard from '@/components/Layout/AuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { LiveSession } from '@/types/video';
import { useLiveSessions } from '@/hooks/use-live-sessions';

const VideoLibrary = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const { activeSessions, upcomingSessions, pastSessions, isLoading } = useLiveSessions();

  const formatSessionDate = (dateString: string) => {
    return format(parseISO(dateString), 'PPP');
  };

  const formatSessionTime = (dateString: string) => {
    return format(parseISO(dateString), 'h:mm a');
  };
  
  const handleJoinSession = (sessionId: string) => {
    navigate(`/live/${sessionId}`);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">Video Library</h1>
          
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="videos">Course Videos</TabsTrigger>
              <TabsTrigger value="live">Live Sessions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="videos">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <VideoCategories 
                    selectedCourse={selectedCourse} 
                    setSelectedCourse={setSelectedCourse}
                    selectedBatch={selectedBatch}
                    setSelectedBatch={setSelectedBatch}
                  />
                </div>
                <div className="md:col-span-3">
                  <VideoList 
                    selectedCourse={selectedCourse} 
                    selectedBatch={selectedBatch} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="live">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learn-purple"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Sessions */}
                    <div className="rounded-lg overflow-hidden border bg-card text-card-foreground shadow p-6">
                      <h3 className="text-xl font-bold mb-4">Currently Live</h3>
                      {activeSessions.length > 0 ? (
                        <div className="space-y-3">
                          {activeSessions.map(session => (
                            <div key={session.id} className="p-3 border bg-learn-purple/5 rounded-md hover:bg-accent transition-colors">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <div>
                                  <p className="font-medium">{session.title}</p>
                                  <div className="flex items-center mt-1">
                                    <span className="flex items-center text-green-600 text-xs font-medium">
                                      <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
                                      Live Now
                                    </span>
                                    {session.accessLevel !== 'free' && (
                                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-learn-purple text-white">
                                        {session.accessLevel === 'subscription' ? 'Subscription' : 'Premium'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className="bg-learn-purple hover:bg-learn-purple/90 w-full sm:w-auto"
                                  onClick={() => handleJoinSession(session.id)}
                                >
                                  Join
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md">
                          <p className="text-muted-foreground">No active sessions right now</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Upcoming Sessions */}
                    <div className="rounded-lg overflow-hidden border bg-card text-card-foreground shadow p-6">
                      <h3 className="text-xl font-bold mb-4">Upcoming Sessions</h3>
                      {upcomingSessions.length > 0 ? (
                        <div className="space-y-3">
                          {upcomingSessions.slice(0, 3).map(session => (
                            <div 
                              key={session.id} 
                              className="p-3 border rounded-md hover:bg-accent transition-colors cursor-pointer"
                              onClick={() => handleJoinSession(session.id)}
                            >
                              <div className="flex justify-between">
                                <p className="font-medium">{session.title}</p>
                                {session.accessLevel !== 'free' && (
                                  <span className="text-xs rounded-full bg-learn-purple text-white px-2 py-0.5">
                                    {session.accessLevel === 'subscription' ? 'Subscription' : 'Premium'}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center mt-1 gap-3">
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  {formatSessionDate(session.scheduledStartTime)}
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatSessionTime(session.scheduledStartTime)}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {upcomingSessions.length > 3 && (
                            <Button variant="link" className="w-full mt-2" size="sm">
                              View all {upcomingSessions.length} upcoming sessions
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md">
                          <p className="text-muted-foreground">No upcoming sessions scheduled</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Past Sessions */}
                  <div className="rounded-lg overflow-hidden border bg-card text-card-foreground shadow p-6">
                    <h3 className="text-xl font-bold mb-4">Previous Live Sessions</h3>
                    {pastSessions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {pastSessions.map(session => (
                          <div 
                            key={session.id}
                            className="border rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleJoinSession(session.id)}
                          >
                            <div className="aspect-video bg-gray-200 relative">
                              <div className="absolute inset-0 flex items-center justify-center">
                                {session.recordedUrl ? (
                                  <img 
                                    src={`https://via.placeholder.com/640x360.png?text=${encodeURIComponent(session.title)}`}
                                    alt={session.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-gray-500">No recording available</span>
                                )}
                                {session.accessLevel !== 'free' && (
                                  <div className="absolute top-2 right-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-learn-purple text-white">
                                      {session.accessLevel === 'subscription' ? 'Subscription' : 'Premium'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="p-3">
                              <h4 className="font-medium line-clamp-2">{session.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Recorded on {formatSessionDate(session.actualStartTime || session.scheduledStartTime)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md">
                        <p className="text-muted-foreground">No recorded sessions available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
        
        {isMobile && <MobileFooter />}
      </div>
    </AuthGuard>
  );
};

export default VideoLibrary;
