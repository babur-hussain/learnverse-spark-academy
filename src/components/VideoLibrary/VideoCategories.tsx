
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { RadioGroup, RadioGroupItem } from '@/components/UI/radio-group';
import { Label } from '@/components/UI/label';
import { Separator } from '@/components/UI/separator';
import { BookOpen, Users } from 'lucide-react';

// Mock data - in a real app, fetch from your Supabase database
const MOCK_COURSES = [
  { id: '1', title: 'Advanced Mathematics' },
  { id: '2', title: 'Physics Fundamentals' },
  { id: '3', title: 'Computer Science Basics' }
];

const MOCK_BATCHES = [
  { id: '1', name: 'Summer 2025 - Free', isPaid: false },
  { id: '2', name: 'Summer 2025 - Premium', isPaid: true }
];

interface VideoCategoriesProps {
  selectedCourse: string | null;
  setSelectedCourse: (courseId: string | null) => void;
  selectedBatch: string | null;
  setSelectedBatch: (batchId: string | null) => void;
}

const VideoCategories: React.FC<VideoCategoriesProps> = ({
  selectedCourse,
  setSelectedCourse,
  selectedBatch,
  setSelectedBatch
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filter Videos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-learn-purple" />
            <h3 className="font-medium">Courses</h3>
          </div>
          <RadioGroup 
            value={selectedCourse || ''} 
            onValueChange={(value) => setSelectedCourse(value === '' ? null : value)}
          >
            <div className="flex items-center space-x-2 py-1">
              <RadioGroupItem value="" id="all-courses" />
              <Label htmlFor="all-courses" className="cursor-pointer">All Courses</Label>
            </div>
            {MOCK_COURSES.map(course => (
              <div key={course.id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={course.id} id={`course-${course.id}`} />
                <Label htmlFor={`course-${course.id}`} className="cursor-pointer">{course.title}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-learn-purple" />
            <h3 className="font-medium">Batches</h3>
          </div>
          <RadioGroup 
            value={selectedBatch || ''} 
            onValueChange={(value) => setSelectedBatch(value === '' ? null : value)}
          >
            <div className="flex items-center space-x-2 py-1">
              <RadioGroupItem value="" id="all-batches" />
              <Label htmlFor="all-batches" className="cursor-pointer">All Batches</Label>
            </div>
            {MOCK_BATCHES.map(batch => (
              <div key={batch.id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={batch.id} id={`batch-${batch.id}`} />
                <Label htmlFor={`batch-${batch.id}`} className="cursor-pointer">
                  <div className="flex items-center">
                    {batch.name}
                    {batch.isPaid && (
                      <span className="ml-2 px-1.5 py-0.5 bg-learn-purple text-white text-xs rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCategories;
