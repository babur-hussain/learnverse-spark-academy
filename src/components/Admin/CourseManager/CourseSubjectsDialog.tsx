
<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
=======
import React, { useState } from 'react';
>>>>>>> main
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
<<<<<<< HEAD
import { Plus, Minus, ArrowUp, ArrowDown } from 'lucide-react';
=======
import { Plus, Minus } from 'lucide-react';
>>>>>>> main

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
<<<<<<< HEAD
      // Get the highest current order_index
      let nextOrderIndex = 0;
      
      if (courseSubjects && courseSubjects.length > 0) {
        nextOrderIndex = Math.max(...courseSubjects.map(cs => cs.order_index)) + 1;
      }
      
      // Create entries for new subjects
      const newCourseSubjects = subjectIds.map((subjectId, index) => ({
        course_id: courseId,
        subject_id: subjectId,
        order_index: nextOrderIndex + index
=======
      const newCourseSubjects = subjectIds.map((subjectId, index) => ({
        course_id: courseId,
        subject_id: subjectId,
        order_index: (courseSubjects?.length || 0) + index,
>>>>>>> main
      }));
      
      const { error } = await supabase
        .from('course_subjects')
        .insert(newCourseSubjects);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-subjects', courseId] });
      queryClient.invalidateQueries({ queryKey: ['available-subjects', courseId] });
<<<<<<< HEAD
=======
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
>>>>>>> main
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
<<<<<<< HEAD
=======
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
>>>>>>> main
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

<<<<<<< HEAD
  const reorderSubjectMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string, direction: 'up' | 'down' }) => {
      const currentItem = courseSubjects?.find(cs => cs.id === id);
      if (!currentItem) return;
      
      let targetItem;
      
      if (direction === 'up') {
        targetItem = courseSubjects?.find(cs => cs.order_index === currentItem.order_index - 1);
      } else {
        targetItem = courseSubjects?.find(cs => cs.order_index === currentItem.order_index + 1);
      }
      
      if (!targetItem) return;
      
      // Swap order indexes
      const { error: error1 } = await supabase
        .from('course_subjects')
        .update({ order_index: targetItem.order_index })
        .eq('id', currentItem.id);
        
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from('course_subjects')
        .update({ order_index: currentItem.order_index })
        .eq('id', targetItem.id);
        
      if (error2) throw error2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-subjects', courseId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reorder subjects',
        variant: 'destructive',
      });
    }
  });

=======
>>>>>>> main
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
<<<<<<< HEAD
  
  const handleReorderSubject = (id: string, direction: 'up' | 'down') => {
    reorderSubjectMutation.mutate({ id, direction });
  };
=======
>>>>>>> main

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
<<<<<<< HEAD
                    <TableHead>Order</TableHead>
                    <TableHead>Subject</TableHead>
=======
                    <TableHead>Subject</TableHead>
                    <TableHead>Order</TableHead>
>>>>>>> main
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseSubjects?.map((item) => (
                    <TableRow key={item.id}>
<<<<<<< HEAD
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{item.order_index + 1}</span>
                          <div className="flex flex-col">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              disabled={item.order_index === 0}
                              onClick={() => handleReorderSubject(item.id, 'up')}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              disabled={item.order_index === (courseSubjects?.length || 0) - 1}
                              onClick={() => handleReorderSubject(item.id, 'down')}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.subject_title}</TableCell>
=======
                      <TableCell>{item.subject_title}</TableCell>
                      <TableCell>{item.order_index + 1}</TableCell>
>>>>>>> main
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
