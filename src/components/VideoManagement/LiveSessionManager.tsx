import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/UI/card';
import { Label } from '@/components/UI/label';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import { Textarea } from '@/components/UI/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Loader2, Clock, Calendar, Play, Video, Users, Badge, ChevronRight, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LiveStreamingService } from '@/services/LiveStreamingService';
import { formatDate } from '@/lib/utils';
import StreamingInstructions from './StreamingInstructions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { LiveSessionService } from '@/services/LiveSessionService';
import { useLiveSessions } from '@/hooks/use-live-sessions';
import { LiveSession } from '@/types/video';
import { Badge as BadgeComponent } from '@/components/UI/badge';

const MOCK_COURSES = [
  { id: '1', title: 'Advanced Mathematics' },
  { id: '2', title: 'Physics Fundamentals' },
  { id: '3', title: 'Computer Science Basics' }
];

const MOCK_BATCHES = [
  { id: '1', name: 'Summer 2025 - Free', isPaid: false },
  { id: '2', name: 'Summer 2025 - Premium', isPaid: true },
  { id: '3', name: 'Fall 2025 - Free', isPaid: false },
  { id: '4', name: 'Fall 2025 - Premium', isPaid: true }
];

const LiveSessionCard = ({ session, onManage }: { session: LiveSession, onManage: (session: LiveSession) => void }) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-semibold">{session.title}</h3>
              {session.isActive && (
                <BadgeComponent variant="destructive" className="ml-2">LIVE NOW</BadgeComponent>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                {formatDate(session.scheduledStartTime, 'PPP')}
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                {formatDate(session.scheduledStartTime, 'p')} - {formatDate(session.scheduledEndTime, 'p')}
              </div>
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                {session.accessLevel === 'free' ? 'Free' : session.accessLevel === 'paid' ? 'Paid' : 'Subscription'}
              </div>
            </div>
          </div>
          <Button onClick={() => onManage(session)} className="shrink-0">
            {session.isActive ? 'Manage Stream' : 'Start Stream'} <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PastSessionCard = ({ session }: { session: LiveSession }) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{session.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                {formatDate(session.actualStartTime || session.scheduledStartTime, 'PPP')}
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                {session.actualStartTime && session.actualEndTime ? 
                  `${formatDate(session.actualStartTime, 'p')} - ${formatDate(session.actualEndTime, 'p')}` : 
                  'Not started'}
              </div>
              <div className="flex items-center text-sm">
                <Video className="h-4 w-4 mr-1 text-muted-foreground" />
                {session.recordedUrl ? 'Recording available' : 'No recording'}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {session.recordedUrl && (
              <Button variant="outline">
                Watch Recording
              </Button>
            )}
            <Button variant="outline">
              View Analytics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LiveSessionManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [streamData, setStreamData] = useState<{ streamUrl: string; streamKey: string } | null>(null);
  const [streamInstructions, setStreamInstructions] = useState<any>(null);
  const { upcomingSessions, activeSessions, pastSessions, isLoading } = useLiveSessions();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    batchId: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    accessLevel: 'paid' as 'free' | 'paid' | 'subscription',
    chatEnabled: true
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateLiveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsCreating(true);
    
    try {
      // In a real implementation, you would make an API call to your backend
      // to create a record in your database and set up the streaming infrastructure
      
      // Create session in database first
      const sessionData = {
        title: formData.title,
        description: formData.description,
        courseId: formData.courseId,
        batchId: formData.batchId,
        scheduledStartTime: formData.scheduledStartTime,
        scheduledEndTime: formData.scheduledEndTime,
        accessLevel: formData.accessLevel,
        chatEnabled: formData.chatEnabled,
        status: 'scheduled' as 'scheduled', // Fix: Use a specific allowed status value with type assertion
        isActive: false
      };
      
      // Create the session in the database
      const createdSession = await LiveSessionService.createLiveSession(sessionData);
      
      toast({
        title: "Live session created",
        description: `Your live session "${formData.title}" has been scheduled.`,
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        courseId: '',
        batchId: '',
        scheduledStartTime: '',
        scheduledEndTime: '',
        accessLevel: 'paid',
        chatEnabled: true
      });
      
      // Switch to upcoming tab
      setActiveTab('upcoming');
      
    } catch (error) {
      console.error('Error creating live session:', error);
      toast({
        title: "Failed to create session",
        description: "There was an error creating your live session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleManageSession = (session: LiveSession) => {
    // Navigate to the live stream dashboard for this session
    navigate(`/live-stream/${session.id}`);
  };

  // Handle Loading State
  if (isLoading && (activeTab === 'upcoming' || activeTab === 'live' || activeTab === 'past')) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3">Loading sessions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="schedule">Schedule Session</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingSessions?.length || 0})</TabsTrigger>
          <TabsTrigger value="live">Live Now ({activeSessions?.length || 0})</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule a Live Class Session</CardTitle>
              <CardDescription>Create a new live streaming session for your students</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLiveSession} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Enter session title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Enter session description"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseId">Course</Label>
                    <Select name="courseId" value={formData.courseId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_COURSES.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batchId">Batch</Label>
                    <Select name="batchId" value={formData.batchId} onValueChange={(value) => setFormData(prev => ({ ...prev, batchId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_BATCHES.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledStartTime">Start Time</Label>
                    <Input
                      id="scheduledStartTime"
                      name="scheduledStartTime"
                      type="datetime-local"
                      value={formData.scheduledStartTime}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scheduledEndTime">End Time</Label>
                    <Input
                      id="scheduledEndTime"
                      name="scheduledEndTime"
                      type="datetime-local"
                      value={formData.scheduledEndTime}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Access Level</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="free" 
                        name="accessLevel" 
                        value="free"
                        checked={formData.accessLevel === 'free'}
                        onChange={() => setFormData(prev => ({ ...prev, accessLevel: 'free' }))}
                        className="text-primary focus:ring-primary"
                      />
                      <Label htmlFor="free" className="cursor-pointer">Free</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="paid" 
                        name="accessLevel" 
                        value="paid"
                        checked={formData.accessLevel === 'paid'}
                        onChange={() => setFormData(prev => ({ ...prev, accessLevel: 'paid' }))}
                        className="text-primary focus:ring-primary"
                      />
                      <Label htmlFor="paid" className="cursor-pointer">Paid</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="subscription" 
                        name="accessLevel" 
                        value="subscription"
                        checked={formData.accessLevel === 'subscription'}
                        onChange={() => setFormData(prev => ({ ...prev, accessLevel: 'subscription' }))}
                        className="text-primary focus:ring-primary"
                      />
                      <Label htmlFor="subscription" className="cursor-pointer">Subscription</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="chatEnabled" 
                      checked={formData.chatEnabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, chatEnabled: e.target.checked }))}
                      className="text-primary focus:ring-primary rounded"
                    />
                    <Label htmlFor="chatEnabled" className="cursor-pointer">Enable live chat during session</Label>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Session...
                    </>
                  ) : (
                    'Create Live Session'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Live Sessions</CardTitle>
              <CardDescription>Manage your scheduled live sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSessions && upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map(session => (
                    <LiveSessionCard 
                      key={session.id} 
                      session={session} 
                      onManage={handleManageSession} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No upcoming live sessions scheduled.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Create a new session using the Schedule tab.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="live" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Sessions</CardTitle>
              <CardDescription>Currently broadcasting live sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {activeSessions && activeSessions.length > 0 ? (
                <div className="space-y-4">
                  {activeSessions.map(session => (
                    <LiveSessionCard 
                      key={session.id} 
                      session={session} 
                      onManage={handleManageSession} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No active live sessions at the moment.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start a session from the Upcoming tab or schedule a new one.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Past Sessions</CardTitle>
              <CardDescription>View recordings and analytics from past sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {pastSessions && pastSessions.length > 0 ? (
                <div className="space-y-4">
                  {pastSessions.map(session => (
                    <PastSessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No past live sessions found.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Past sessions will appear here after your first live stream.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Streaming Guide</CardTitle>
          <CardDescription>How to stream with OBS Studio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 dark:bg-amber-900/20 dark:border-amber-800">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">Important Information</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  To stream to LearnVerse, you'll need OBS Studio or similar streaming software.
                  When you start a stream, you'll receive an RTMP URL and stream key to configure your software.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Quick Start Guide</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Download and install <a href="https://obsproject.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OBS Studio</a></li>
              <li>In OBS, go to Settings → Stream</li>
              <li>Select "Custom..." as the service</li>
              <li>When you start a stream in LearnVerse, you'll get an RTMP URL and Stream Key</li>
              <li>Enter the RTMP URL and Stream Key from LearnVerse into OBS</li>
              <li>Set up your scenes, audio, and video sources in OBS</li>
              <li>Click "Start Streaming" in OBS to begin broadcasting</li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Recommended Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Video</h4>
                <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                  <li>Resolution: 1280x720 (720p) or 1920x1080 (1080p)</li>
                  <li>Framerate: 30 fps (or 60 fps if your internet is fast)</li>
                  <li>Keyframe Interval: 2 seconds</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">Audio</h4>
                <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                  <li>Bitrate: 128-192 Kbps</li>
                  <li>Sample Rate: 48 kHz</li>
                  <li>Channels: Stereo</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Need more help? Check out the <a href="https://obsproject.com/wiki/OBS-Studio-Quickstart" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OBS Quickstart Guide</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LiveSessionManager;
