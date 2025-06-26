
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/UI/dialog';
import { Button } from '@/components/UI/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/table';
import { Input } from '@/components/UI/input';
import { Checkbox } from '@/components/UI/checkbox';
import { Plus, Minus } from 'lucide-react';

interface Subject {
  id: string;
  title: string;
  description: string | null;
}

interface CourseSubject {
  id: string;
  course_id: string;
  subject_id: string;
  order_index: number;
  subject_title?: string;
}

interface CourseSubjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
}

export function CourseSubjectsDialog({ 
  open, 
  onOpenChange, 
  courseId,
  courseTitle
}: CourseSubjectsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  
  const { data: courseSubjects, isLoading: isLoadingCourseSubjects } = useQuery({
    queryKey: ['course-subjects', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_subjects')
        .select(`
          id,
          course_id,
          subject_id,
          order_index,
          subjects:subject_id (title)
        `)
        .eq('course_id', courseId)
        .order('order_index');
      
      if (error) throw error;
      
      return data?.map(item => ({
        ...item,
        subject_title: item.subjects?.title
      })) as CourseSubject[];
    },
    enabled: open && !!courseId,
  });

  const { data: availableSubjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['available-subjects', courseId],
    queryFn: async () => {
      const { data: existingSubjectIds } = await supabase
        .from('course_subjects')
        .select('subject_id')
        .eq('course_id', courseId);

      const alreadyAddedIds = existingSubjectIds?.map(item => item.subject_id) || [];

      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('title');
      
      if (error) throw error;
      
      // Filter out subjects that are already added
      return (data as Subject[]).filter(
        subject => !alreadyAddedIds.includes(subject.id)
      );
    },
    enabled: open && !!courseId,
  });

  const addSubjectsMutation = useMutation({
    mutationFn: async (subjectIds: string[]) => {
      const newCourseSubjects = subjectIds.map((subjectId, index) => ({
        course_id: courseId,
        subject_id: subjectId,
        order_index: (courseSubjects?.length || 0) + index,
      }));
      
      const { error } = await supabase
        .from('course_subjects')
        .insert(newCourseSubjects);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-subjects', courseId] });
      queryClient.invalidateQueries({ queryKey: ['available-subjects', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      setSelectedSubjectIds([]);
      toast({
        title: 'Subjects added',
        description: 'The subjects have been added to the course.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add subjects',
        variant: 'destructive',
      });
    }
  });

  const removeSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('course_subjects')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-subjects', courseId] });
      queryClient.invalidateQueries({ queryKey: ['available-subjects', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast({
        title: 'Subject removed',
        description: 'The subject has been removed from the course.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove subject',
        variant: 'destructive',
      });
    }
  });

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectIds(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleAddSubjects = () => {
    if (selectedSubjectIds.length > 0) {
      addSubjectsMutation.mutate(selectedSubjectIds);
    }
  };

  const handleRemoveSubject = (id: string) => {
    removeSubjectMutation.mutate(id);
  };

  const filteredSubjects = availableSubjects?.filter(subject =>
    subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Course Subjects</DialogTitle>
          <DialogDescription>
            Add or remove subjects for "{courseTitle}"
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="current">
          <TabsList className="mb-4">
            <TabsTrigger value="current">
              Current Subjects ({courseSubjects?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="add">
              Add Subjects ({availableSubjects?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            {isLoadingCourseSubjects ? (
              <div className="py-4 text-center">Loading subjects...</div>
            ) : courseSubjects?.length === 0 ? (
              <div className="py-4 text-center">
                No subjects added to this course yet. Use the "Add Subjects" tab to add some.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseSubjects?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.subject_title}</TableCell>
                      <TableCell>{item.order_index + 1}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveSubject(item.id)}
                        >
                          <Minus className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="add">
            <div className="mb-4">
              <Input
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isLoadingSubjects ? (
              <div className="py-4 text-center">Loading subjects...</div>
            ) : filteredSubjects?.length === 0 ? (
              <div className="py-4 text-center">
                No subjects available to add. All subjects are already added or none match your search.
              </div>
            ) : (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects?.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedSubjectIds.includes(subject.id)}
                            onCheckedChange={() => handleSubjectSelect(subject.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{subject.title}</TableCell>
                        <TableCell className="max-w-sm truncate">{subject.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={handleAddSubjects}
                    disabled={selectedSubjectIds.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Selected Subjects
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
