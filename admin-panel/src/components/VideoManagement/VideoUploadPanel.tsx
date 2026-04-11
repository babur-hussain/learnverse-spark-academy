
import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Label } from '@/components/UI/label';
import { RadioGroup, RadioGroupItem } from '@/components/UI/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/UI/card';
import { Trash2, Loader2, Upload, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, fetch from your Supabase database
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

const VideoUploadPanel = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    batchId: '',
    accessLevel: 'paid' as 'free' | 'paid' | 'subscription',
    prerequisites: ''
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast({ 
        title: "Video required", 
        description: "Please select a video file to upload.",
        variant: "destructive" 
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // In a real implementation, you would:
      // 1. Upload the video to storage
      // 2. Upload the thumbnail to storage
      // 3. Create a record in your database
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({ 
        title: "Upload successful", 
        description: `${formData.title} has been uploaded and is now being processed.` 
      });
      
      // Reset form
      setVideoFile(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setFormData({
        title: '',
        description: '',
        courseId: '',
        batchId: '',
        accessLevel: 'paid',
        prerequisites: ''
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: "Upload failed", 
        description: "There was an error uploading your video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload New Video</CardTitle>
          <CardDescription>Add a new video for your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Enter video title"
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
                placeholder="Enter video description"
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
            
            <div className="space-y-2">
              <Label>Access Level</Label>
              <RadioGroup 
                value={formData.accessLevel} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, accessLevel: value as 'free' | 'paid' | 'subscription' }))}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free">Free Preview</Label>
                  <span className="text-xs text-muted-foreground">(Available to all enrolled users)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="paid" />
                  <Label htmlFor="paid">Paid Access</Label>
                  <span className="text-xs text-muted-foreground">(Available to paying users)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subscription" id="subscription" />
                  <Label htmlFor="subscription">Subscription Only</Label>
                  <span className="text-xs text-muted-foreground">(Available to subscription users only)</span>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prerequisites">Prerequisites (Optional - comma separated)</Label>
              <Input
                id="prerequisites"
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleFormChange}
                placeholder="e.g., Basic Math, Statistics"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="video">Video File</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                {videoFile ? (
                  <div className="space-y-2">
                    <p className="font-medium">{videoFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setVideoFile(null)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Upload className="h-10 w-10 text-gray-400" />
                    </div>
                    <div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        asChild
                      >
                        <label htmlFor="video-upload" className="cursor-pointer">
                          Select Video
                          <input
                            id="video-upload"
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="sr-only"
                          />
                        </label>
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">MP4, MOV, or WebM. Max 2GB.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                {thumbnailPreview ? (
                  <div className="space-y-4">
                    <div className="mx-auto overflow-hidden rounded-md">
                      <img src={thumbnailPreview} alt="Thumbnail preview" className="max-h-40 mx-auto object-cover" />
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Image className="h-10 w-10 text-gray-400" />
                    </div>
                    <div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        asChild
                      >
                        <label htmlFor="thumbnail-upload" className="cursor-pointer">
                          Select Image
                          <input
                            id="thumbnail-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="sr-only"
                          />
                        </label>
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, or WebP recommended</p>
                  </div>
                )}
              </div>
            </div>
            
            <CardFooter className="px-0 pt-4">
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Video'
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Videos</CardTitle>
          <CardDescription>Manage your course videos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No videos have been uploaded yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Use the form to upload your first video.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoUploadPanel;
