
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/UI/card';
import { Play, RefreshCw } from 'lucide-react';
import { Button } from '@/components/UI/button';

interface StreamPreviewProps {
  streamUrl?: string;
  status: 'offline' | 'connecting' | 'live' | 'ended';
  thumbnailUrl?: string;
}

const StreamPreview: React.FC<StreamPreviewProps> = ({ 
  streamUrl,
  status,
  thumbnailUrl
}) => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize and control the video player
  useEffect(() => {
    if (!videoElement) return;
    
    const setupVideo = async () => {
      if (status === 'live' && streamUrl) {
        try {
          setIsLoading(true);
          setError(null);
          
          // In a real app, this would use the HLS.js library to load the stream
          // For demo purposes, we're simulating a stream with a static video
          
          // Create a fake live stream URL (in production, this would be your HLS URL)
          // const hlsUrl = `https://your-rtmp-server.com/hls/${streamKey}.m3u8`;
          
          // Simulate stream loading delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // For demo, use a sample video as our "live stream"
          videoElement.src = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
          
          videoElement.load();
          await videoElement.play();
        } catch (err) {
          console.error('Error playing video:', err);
          setError('Unable to load live stream. Please check your connection and try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        // If not live, reset video
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
      }
    };
    
    setupVideo();
    
    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
      }
    };
  }, [videoElement, status, streamUrl]);
  
  const handleRefresh = () => {
    if (videoElement) {
      videoElement.load();
      videoElement.play().catch(err => {
        console.error('Error replaying video:', err);
        setError('Unable to reload the stream. Please try again.');
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative">
        {/* Video Element */}
        <div className="aspect-video bg-black relative">
          {(status === 'offline' || status === 'ended') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
              {thumbnailUrl ? (
                <img 
                  src={thumbnailUrl} 
                  alt="Stream thumbnail" 
                  className="w-full h-full object-cover opacity-50"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Play className="h-16 w-16 mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Stream {status === 'ended' ? 'Ended' : 'Offline'}</h3>
                <p className="text-sm opacity-75">
                  {status === 'ended' 
                    ? 'The live stream has ended. Recording will be available soon.'
                    : 'Stream will begin soon. Stay tuned!'}
                </p>
              </div>
            </div>
          )}
          
          {status === 'connecting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <h3 className="text-xl font-bold">Connecting to stream...</h3>
              <p className="text-sm opacity-75 mt-2">This may take a few moments</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/50 text-white p-4">
              <p className="text-center mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Stream
              </Button>
            </div>
          )}
          
          <video
            ref={setVideoElement}
            className={`w-full h-full object-contain ${status === 'live' && !error && !isLoading ? 'block' : 'hidden'}`}
            controls={status === 'live'}
            playsInline
            autoPlay={status === 'live'}
            muted={false}
          />
        </div>
        
        {/* Stream quality indicator */}
        {status === 'live' && !error && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            Live • 720p
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreamPreview;
