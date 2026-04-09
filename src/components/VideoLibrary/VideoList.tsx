
import React from 'react';
import { Card, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
import { Play, Lock, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AccessControlService } from '@/services/AccessControlService';
import { Video } from '@/types/video';

// Mock data - in a real app, fetch from your Supabase database
const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Introduction to Calculus',
    description: 'Learn the fundamentals of calculus in this introductory lesson.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
    videoUrl: 'https://example.com/videos/intro-calculus.mp4',
    duration: 3600, // 60 minutes in seconds
    courseId: '1',
    batchId: '2',
    accessLevel: 'free',
    createdAt: '2025-03-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Limits and Continuity',
    description: 'Understand the concepts of limits and continuity in calculus.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
    videoUrl: 'https://example.com/videos/limits-continuity.mp4',
    duration: 2700, // 45 minutes in seconds
    courseId: '1',
    batchId: '2',
    accessLevel: 'paid',
    createdAt: '2025-03-20T14:30:00Z'
  },
  {
    id: '3',
    title: 'Newton\'s Laws of Motion',
    description: 'Explore the three fundamental laws that form the foundation of classical mechanics.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa',
    videoUrl: 'https://example.com/videos/newtons-laws.mp4',
    duration: 3300, // 55 minutes in seconds
    courseId: '2',
    batchId: '1',
    accessLevel: 'free',
    createdAt: '2025-03-10T09:15:00Z'
  },
  {
    id: '4',
    title: 'Circular Motion and Gravitation',
    description: 'Learn about circular motion, centripetal force, and the law of universal gravitation.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa',
    videoUrl: 'https://example.com/videos/circular-motion.mp4',
    duration: 2700, // 45 minutes in seconds
    courseId: '2',
    batchId: '1',
    accessLevel: 'subscription',
    createdAt: '2025-03-12T11:20:00Z'
  }
];

// Additional course and batch information for display
const COURSES_MAP: Record<string, string> = {
  '1': 'Advanced Mathematics',
  '2': 'Physics Fundamentals'
};

const BATCHES_MAP: Record<string, string> = {
  '1': 'Summer 2025 - Free',
  '2': 'Summer 2025 - Premium'
};

// Mock user access data - in a real app, fetch this from your backend
const MOCK_USER_ACCESS = {
  userId: 'current-user-id',
  courseId: '1',
  batchId: '2',
  hasPurchased: true,
  hasSubscription: false,
  enrollmentDate: '2025-02-01T00:00:00Z'
};

interface VideoListProps {
  selectedCourse: string | null;
  selectedBatch: string | null;
}

const VideoList: React.FC<VideoListProps> = ({ selectedCourse, selectedBatch }) => {
  const { toast } = useToast();
  
  // Filter videos based on selections
  const filteredVideos = MOCK_VIDEOS.filter(video => {
    const courseMatch = !selectedCourse || video.courseId === selectedCourse;
    const batchMatch = !selectedBatch || video.batchId === selectedBatch;
    return courseMatch && batchMatch;
  });
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  const handlePlayVideo = (video: Video) => {
    // Check if user has access to this video
    const canAccess = AccessControlService.canAccessVideo(video, {
      ...MOCK_USER_ACCESS,
      courseId: video.courseId,
      batchId: video.batchId
    });
    
    if (!canAccess) {
      // Customize message based on access level
      let message = "This content requires enrollment in this course.";
      
      if (video.accessLevel === 'paid') {
        message = "This video requires a course purchase.";
      } else if (video.accessLevel === 'subscription') {
        message = "This video requires an active subscription.";
      }
      
      toast({
        title: "Access Restricted",
        description: message,
        variant: "destructive"
      });
      return;
    }
    
    // If access is granted, play the video
    toast({
      title: "Playing video",
      description: "Video is now loading..."
    });
  };

  // Function to determine badge text and style
  const getAccessBadge = (accessLevel: 'free' | 'paid' | 'subscription') => {
    switch (accessLevel) {
      case 'free':
        return { text: 'Free Preview', variant: 'secondary' as const };
      case 'paid':
        return { text: 'Premium', variant: 'default' as const };
      case 'subscription':
        return { text: 'Subscription Only', variant: 'default' as const };
    }
  };

  const isVideoLocked = (video: Video) => {
    return AccessControlService.getLockedStatus(video, {
      ...MOCK_USER_ACCESS,
      courseId: video.courseId,
      batchId: video.batchId
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {filteredVideos.length} {filteredVideos.length === 1 ? 'Video' : 'Videos'}
        </h2>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVideos.map(video => {
                const isLocked = isVideoLocked(video);
                const badge = getAccessBadge(video.accessLevel);
                const courseName = COURSES_MAP[video.courseId] || 'Unknown Course';
                
                return (
                  <div key={video.id} className="flex flex-col border rounded-lg overflow-hidden bg-white h-full">
                    <div className="aspect-video bg-gray-200 relative">
                      <img 
                        src={`${video.thumbnailUrl}?w=600&auto=format&fit=crop&q=80`}
                        alt={video.title}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button 
                          variant="default" 
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          onClick={() => handlePlayVideo(video)}
                        >
                          {isLocked ? (
                            <Lock className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </Button>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant={badge.variant} className="bg-learn-purple">
                          {badge.text}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="outline" className="bg-black/60 text-white border-none">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(video.duration)}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg line-clamp-2 mb-1">{video.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{courseName}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-auto">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Added {formatDate(video.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No videos match your filters.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoList;
