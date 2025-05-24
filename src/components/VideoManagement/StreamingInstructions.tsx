
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Copy, Info, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StreamingSettings } from '@/types/video';

interface StreamingInstructionsProps {
  streamUrl: string;
  streamKey: string;
  settings: {
    videoBitrate: string;
    audioBitrate: string;
    resolution: string;
    fps: string;
  };
}

const StreamingInstructions: React.FC<StreamingInstructionsProps> = ({
  streamUrl,
  streamKey,
  settings
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState<'url' | 'key' | null>(null);
  
  const copyToClipboard = (text: string, type: 'url' | 'key') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    
    toast({
      title: 'Copied to clipboard',
      description: type === 'url' ? 'Stream URL copied' : 'Stream key copied',
    });
    
    setTimeout(() => setCopied(null), 2000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Info className="h-5 w-5 mr-2" />
          OBS Studio Setup Instructions
        </CardTitle>
        <CardDescription>
          Configure your streaming software with these settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="server">Stream Server</Label>
            <div className="flex">
              <Input
                id="server"
                value={streamUrl}
                readOnly
                className="font-mono text-sm flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="ml-2"
                onClick={() => copyToClipboard(streamUrl, 'url')}
              >
                {copied === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              In OBS Studio, go to Settings → Stream and select "Custom..." as the service
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="key">Stream Key</Label>
            <div className="flex">
              <Input
                id="key"
                type="password"
                value={streamKey}
                readOnly
                className="font-mono text-sm flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="ml-2"
                onClick={() => copyToClipboard(streamKey, 'key')}
              >
                {copied === 'key' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep your stream key private — it allows others to stream to your channel
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Recommended Settings</h3>
          <div className="bg-muted rounded-md p-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="font-medium">Video Bitrate:</dt>
                <dd>{settings.videoBitrate}</dd>
              </div>
              <div>
                <dt className="font-medium">Audio Bitrate:</dt>
                <dd>{settings.audioBitrate}</dd>
              </div>
              <div>
                <dt className="font-medium">Resolution:</dt>
                <dd>{settings.resolution}</dd>
              </div>
              <div>
                <dt className="font-medium">Framerate:</dt>
                <dd>{settings.fps}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="pt-2">
          <h3 className="text-sm font-medium mb-2">Quick Setup Guide</h3>
          <ol className="list-decimal list-inside text-sm space-y-2 pl-2">
            <li>Open OBS Studio and go to Settings → Stream</li>
            <li>Select "Custom..." as the service</li>
            <li>Paste the Stream Server URL and Stream Key</li>
            <li>Go to Output settings and set video bitrate: {settings.videoBitrate}</li>
            <li>Set audio bitrate: {settings.audioBitrate}</li>
            <li>Go to Video settings and set base resolution to {settings.resolution}</li>
            <li>Set FPS to {settings.fps}</li>
            <li>Click "Apply" and "OK" to save your settings</li>
            <li>Click "Start Streaming" when ready to go live</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreamingInstructions;
