
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Play, Pause, Volume2, VolumeX, Settings, Maximize, Lock } from 'lucide-react';
import { useAccessControl } from '@/hooks/use-access-control';
import { Video } from '@/types/video';

interface VideoPlayerProps {
  video: Video;
  posterUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  posterUrl 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const { hasAccess, isLoading, accessError, isLocked } = useAccessControl(video);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const handleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Reset player when video changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [video.id]);

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="aspect-video bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learn-purple"></div>
        </div>
      </Card>
    );
  }

  if (isLocked) {
    return (
      <Card className="overflow-hidden">
        <div className="aspect-video bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
          <Lock className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
          <p className="text-muted-foreground mb-4">{accessError}</p>
          
          {video.accessLevel === 'subscription' && (
            <Button variant="default" className="bg-learn-purple hover:bg-learn-purple/90">
              Subscribe Now
            </Button>
          )}
          
          {video.accessLevel === 'paid' && (
            <Button variant="default" className="bg-learn-purple hover:bg-learn-purple/90">
              Purchase Course
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={posterUrl || video.thumbnailUrl}
          className="w-full h-auto"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
        
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1 bg-gray-500 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, white ${(currentTime / (duration || 1)) * 100}%, gray ${(currentTime / (duration || 1)) * 100}%)`
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" className="text-white" onClick={togglePlay}>
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                
                <Button variant="ghost" size="icon" className="text-white" onClick={toggleMute}>
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                
                <span className="text-sm text-white">
                  {formatTime(currentTime)} / {formatTime(duration || 0)}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" className="text-white">
                  <Settings className="h-5 w-5" />
                </Button>
                
                <Button variant="ghost" size="icon" className="text-white" onClick={handleFullScreen}>
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h2 className="text-xl font-bold">{video.title}</h2>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
