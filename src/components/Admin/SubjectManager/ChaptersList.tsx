
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/UI/table';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
<<<<<<< HEAD
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
=======
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, FileText, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
>>>>>>> main
import { useToast } from '@/hooks/use-toast';
import { ChapterDialog } from './ChapterDialog';
import { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from '@/components/UI/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
<<<<<<< HEAD
import { useLocation } from 'react-router-dom';
=======
import { useLocation, useNavigate } from 'react-router-dom';
>>>>>>> main
import { BreadcrumbNav } from '@/components/BreadcrumbNav';

interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: string;
  title: string;
}

<<<<<<< HEAD
// Add the interface for the component props
interface ChaptersListProps {
  subjectId: string | null;
}

const ChaptersList: React.FC<ChaptersListProps> = ({ subjectId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
=======
interface ChaptersListProps {
  subjectId: string | null;
  onSelectChapter?: (chapterId: string | null) => void;
}

const ChaptersList: React.FC<ChaptersListProps> = ({ subjectId, onSelectChapter }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
>>>>>>> main
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(subjectId);
<<<<<<< HEAD
=======
  const [highlightedChapterId, setHighlightedChapterId] = useState<string | null>(null);
>>>>>>> main
  const location = useLocation();
  
  // Update selectedSubject when subjectId prop changes
  useEffect(() => {
    if (subjectId !== selectedSubject) {
      setSelectedSubject(subjectId);
    }
  }, [subjectId]);

  // Check if navigated from subject page
  useEffect(() => {
    if (location.state?.subjectId) {
      setSelectedSubject(location.state.subjectId);
    }
  }, [location.state]);
  
  const breadcrumbItems = location.state?.subjectTitle 
    ? [
        { label: 'Admin', href: '/admin' },
        { label: 'Subject Management', href: '/subject-management' },
        { label: location.state.subjectTitle },
        { label: 'Chapters' }
      ]
    : [
        { label: 'Admin', href: '/admin' },
        { label: 'Subject Management', href: '/subject-management' },
        { label: 'Chapters' }
      ];

  const { data: subjects } = useQuery({
    queryKey: ['admin-subjects-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, title')
        .order('title');
        
      if (error) throw error;
      return data as Subject[];
    },
  });

  const { data: chapters, isLoading } = useQuery({
    queryKey: ['admin-chapters', selectedSubject],
    queryFn: async () => {
      let query = supabase
        .from('chapters')
        .select('*')
        .order('order_index');
        
      if (selectedSubject) {
        query = query.eq('subject_id', selectedSubject);
      }
        
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!subjects,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Check if any resources depend on this chapter
      const { data: resources, error: resourcesError } = await supabase
        .from('subject_resources')
        .select('id')
        .eq('chapter_id', id)
        .limit(1);
      
      if (resourcesError) throw resourcesError;
      
      if (resources && resources.length > 0) {
        throw new Error('Cannot delete chapter with existing resources. Delete resources first.');
      }
      
      // Delete the chapter
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chapters', selectedSubject] });
      toast({
        title: "Success",
        description: "Chapter deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string, direction: 'up' | 'down' }) => {
      const currentChapter = chapters?.find(chapter => chapter.id === id);
      if (!currentChapter) return;
      
      let targetChapter;
      
      if (direction === 'up') {
        targetChapter = chapters?.find(chapter => 
          chapter.subject_id === currentChapter.subject_id && 
          chapter.order_index === currentChapter.order_index - 1
        );
      } else {
        targetChapter = chapters?.find(chapter => 
          chapter.subject_id === currentChapter.subject_id && 
          chapter.order_index === currentChapter.order_index + 1
        );
      }
      
      if (!targetChapter) return;
      
      // Swap order indexes
      const { error: error1 } = await supabase
        .from('chapters')
        .update({ order_index: targetChapter.order_index })
        .eq('id', currentChapter.id);
        
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from('chapters')
        .update({ order_index: currentChapter.order_index })
        .eq('id', targetChapter.id);
        
      if (error2) throw error2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chapters', selectedSubject] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  const handleEdit = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsDialogOpen(true);
  };
  
  const handleAdd = () => {
    setSelectedChapter(undefined);
    setIsDialogOpen(true);
  };
  
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };
  
  const handleMoveChapter = (id: string, direction: 'up' | 'down') => {
    reorderMutation.mutate({ id, direction });
  };

<<<<<<< HEAD
=======
  const handleSelectChapter = (chapterId: string) => {
    setHighlightedChapterId(chapterId);
    if (onSelectChapter) {
      onSelectChapter(chapterId);
    }
  };

  const handleManageContent = (chapterId: string) => {
    navigate(`/subject-management/subject/${selectedSubject}/chapter/${chapterId}`);
  };

>>>>>>> main
  const filteredChapters = chapters?.filter(chapter => 
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chapter.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading chapters...</div>;
  }

  return (
    <div className="space-y-4">
      <BreadcrumbNav items={breadcrumbItems} />
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Chapters</h2>
        <Button 
          onClick={handleAdd} 
          disabled={!selectedSubject}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Chapter
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Select Subject</label>
          <Select 
            value={selectedSubject || undefined} 
            onValueChange={handleSubjectChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects?.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Search Chapters</label>
          <Input
            placeholder="Search chapters by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {!selectedSubject ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Please select a subject to view its chapters</p>
        </div>
      ) : filteredChapters && filteredChapters.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No chapters found. Click "Add Chapter" to create one.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChapters?.map((chapter) => (
<<<<<<< HEAD
              <TableRow key={chapter.id}>
=======
              <TableRow 
                key={chapter.id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  highlightedChapterId === chapter.id ? 'bg-primary/10 border-primary' : ''
                }`}
                onClick={() => handleSelectChapter(chapter.id)}
              >
>>>>>>> main
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span>{chapter.order_index}</span>
                    <div className="flex flex-col">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={chapter.order_index === 0}
<<<<<<< HEAD
                        onClick={() => handleMoveChapter(chapter.id, 'up')}
=======
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveChapter(chapter.id, 'up');
                        }}
>>>>>>> main
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={chapter.order_index === (chapters?.length || 0) - 1}
<<<<<<< HEAD
                        onClick={() => handleMoveChapter(chapter.id, 'down')}
=======
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveChapter(chapter.id, 'down');
                        }}
>>>>>>> main
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
<<<<<<< HEAD
                <TableCell className="font-medium">{chapter.title}</TableCell>
=======
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <span>{chapter.title}</span>
                    {highlightedChapterId === chapter.id && (
                      <FileText className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </TableCell>
>>>>>>> main
                <TableCell className="max-w-md truncate">{chapter.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <Button 
<<<<<<< HEAD
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(chapter)}
=======
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManageContent(chapter.id);
                      }}
                      title="Manage Content"
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(chapter);
                      }}
>>>>>>> main
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
<<<<<<< HEAD
                        <Button variant="ghost" size="sm">
=======
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
>>>>>>> main
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{chapter.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(chapter.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ChapterDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        chapter={selectedChapter}
        subjectId={selectedSubject || undefined}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-chapters', selectedSubject] })}
      />
    </div>
  );
};

export default ChaptersList;
