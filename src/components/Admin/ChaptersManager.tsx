<<<<<<< HEAD

=======
>>>>>>> main
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/table';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/UI/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Pencil, Trash2, Plus, Search, MoveUp, MoveDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Subject {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface ChaptersManagerProps {
  selectedSubject: string | null;
  onSelectSubject: (subjectId: string | null) => void;
  onSelectChapter: (chapterId: string | null) => void;
}

<<<<<<< HEAD
=======
function arraySafe<T>(arr: T[] | undefined | null): T[] {
  return Array.isArray(arr) ? arr : [];
}

>>>>>>> main
const ChaptersManager: React.FC<ChaptersManagerProps> = ({ 
  selectedSubject, 
  onSelectSubject,
  onSelectChapter 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newChapter, setNewChapter] = useState({
    title: '',
    description: '',
    subject_id: selectedSubject || ''
  });
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, title')
        .order('title');
      
      if (error) {
        toast({
          title: 'Error fetching subjects',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data as Subject[];
    }
  });

  // Fetch chapters
  const { data: chapters = [], isLoading } = useQuery({
    queryKey: ['chapters', selectedSubject],
    queryFn: async () => {
      let query = supabase
        .from('chapters')
        .select('*')
        .order('order_index');
      
      if (selectedSubject) {
        query = query.eq('subject_id', selectedSubject);
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast({
          title: 'Error fetching chapters',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data as Chapter[];
    },
    enabled: true
  });

  // Create chapter
  const createChapter = useMutation({
    mutationFn: async (chapter: {
      title: string;
      description: string;
      subject_id: string;
    }) => {
      // Get highest order index for the subject
      const { data: existingChapters } = await supabase
        .from('chapters')
        .select('order_index')
        .eq('subject_id', chapter.subject_id)
        .order('order_index', { ascending: false })
        .limit(1);
      
      const nextOrderIndex = existingChapters && existingChapters.length > 0
        ? existingChapters[0].order_index + 1
        : 0;
      
      const { data, error } = await supabase
        .from('chapters')
        .insert([{
          title: chapter.title,
          description: chapter.description || null,
          subject_id: chapter.subject_id,
          order_index: nextOrderIndex
        }])
        .select()
        .single();
      
      if (error) {
        toast({
          title: 'Error creating chapter',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Chapter created',
        description: 'The chapter has been created successfully.'
      });
      setNewChapter({ title: '', description: '', subject_id: data.subject_id });
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      setDialogOpen(false);
    }
  });

  // Update chapter
  const updateChapter = useMutation({
    mutationFn: async (chapter: Chapter) => {
      const { data, error } = await supabase
        .from('chapters')
        .update({
          title: chapter.title,
          description: chapter.description,
          subject_id: chapter.subject_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', chapter.id)
        .select()
        .single();
      
      if (error) {
        toast({
          title: 'Error updating chapter',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Chapter updated',
        description: 'The chapter has been updated successfully.'
      });
      setEditingChapter(null);
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      setDialogOpen(false);
    }
  });

  // Delete chapter
  const deleteChapter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast({
          title: 'Error deleting chapter',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      toast({
        title: 'Chapter deleted',
        description: 'The chapter has been deleted successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    }
  });

  // Move chapter order
  const moveChapter = useMutation({
    mutationFn: async ({ chapterId, direction }: { chapterId: string, direction: 'up' | 'down' }) => {
      // Find current chapter
      const currentChapter = chapters.find(chapter => chapter.id === chapterId);
      if (!currentChapter) throw new Error('Chapter not found');
      
      const newOrderIndex = direction === 'up' 
        ? currentChapter.order_index - 1 
        : currentChapter.order_index + 1;
      
      // Find chapter at the target position
      const targetChapter = chapters.find(
        chapter => chapter.subject_id === currentChapter.subject_id && 
        chapter.order_index === newOrderIndex
      );
      
      if (!targetChapter) return;
      
      // Swap order indices
      const { error: error1 } = await supabase
        .from('chapters')
        .update({ order_index: newOrderIndex })
        .eq('id', currentChapter.id);
      
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from('chapters')
        .update({ order_index: currentChapter.order_index })
        .eq('id', targetChapter.id);
      
      if (error2) throw error2;
      
      return { currentChapter, targetChapter };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (error) => {
      toast({
        title: 'Error moving chapter',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Filter chapters based on search query
  const filteredChapters = chapters.filter(
    chapter => chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chapter.description && chapter.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateOrUpdate = () => {
    if (editingChapter) {
      updateChapter.mutate({
        ...editingChapter,
        title: newChapter.title,
        description: newChapter.description,
        subject_id: newChapter.subject_id
      });
    } else {
      createChapter.mutate(newChapter);
    }
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setNewChapter({
      title: chapter.title,
      description: chapter.description || '',
      subject_id: chapter.subject_id
    });
    setDialogOpen(true);
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      setEditingChapter(null);
      setNewChapter({ 
        title: '', 
        description: '', 
        subject_id: selectedSubject || '' 
      });
    }
    setDialogOpen(open);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (confirm('Are you sure you want to delete this chapter? This will also delete all associated notes.')) {
      deleteChapter.mutate(chapterId);
      onSelectChapter(null);
    }
  };

  const handleMoveChapter = (chapterId: string, direction: 'up' | 'down') => {
    moveChapter.mutate({ chapterId, direction });
  };

  const getSubjectTitle = (subjectId: string): string => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.title : 'Unknown Subject';
  };

  // Effect to update newChapter.subject_id when selectedSubject changes
  React.useEffect(() => {
    if (selectedSubject && !editingChapter) {
      setNewChapter(prev => ({ ...prev, subject_id: selectedSubject }));
    }
  }, [selectedSubject, editingChapter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-semibold">Manage Chapters</h2>
          {selectedSubject && (
            <p className="text-sm text-muted-foreground">
              Filtered by subject: {getSubjectTitle(selectedSubject)}
              <Button 
                variant="link" 
                className="p-0 h-auto ml-1"
                onClick={() => onSelectSubject(null)}
              >
                (Clear)
              </Button>
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Chapter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Select
                    value={newChapter.subject_id}
                    onValueChange={(value) => setNewChapter({ ...newChapter, subject_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Chapter Title</label>
                  <Input
                    id="title"
                    placeholder="Enter chapter title"
                    value={newChapter.title}
                    onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    id="description"
                    placeholder="Enter chapter description"
                    value={newChapter.description}
                    onChange={(e) => setNewChapter({ ...newChapter, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleCreateOrUpdate}
                  disabled={!newChapter.title.trim() || !newChapter.subject_id}
                  className="gradient-primary"
                >
                  {editingChapter ? 'Update Chapter' : 'Create Chapter'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learn-purple"></div>
        </div>
<<<<<<< HEAD
      ) : filteredChapters.length === 0 ? (
=======
      ) : arraySafe(filteredChapters).length === 0 ? (
>>>>>>> main
        <div className="text-center py-8">
          {searchQuery ? (
            <p className="text-muted-foreground">No chapters matching your search</p>
          ) : selectedSubject ? (
            <p className="text-muted-foreground">No chapters found for this subject. Add your first chapter to get started.</p>
          ) : (
            <p className="text-muted-foreground">No chapters found. Select a subject or add a new chapter to get started.</p>
          )}
        </div>
      ) : (
        <Table>
          <TableCaption>List of chapters</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              {!selectedSubject && <TableHead>Subject</TableHead>}
              <TableHead>Description</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
<<<<<<< HEAD
            {filteredChapters.map((chapter) => (
=======
            {arraySafe(filteredChapters).map((chapter) => (
>>>>>>> main
              <TableRow key={chapter.id} onClick={() => onSelectChapter(chapter.id)} className="cursor-pointer">
                <TableCell className="font-medium">{chapter.title}</TableCell>
                {!selectedSubject && (
                  <TableCell>{getSubjectTitle(chapter.subject_id)}</TableCell>
                )}
                <TableCell>{chapter.description || '—'}</TableCell>
                <TableCell>{chapter.order_index}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveChapter(chapter.id, 'up');
                      }}
                      disabled={chapter.order_index === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveChapter(chapter.id, 'down');
                      }}
                      disabled={chapter.order_index === chapters.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditChapter(chapter);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChapter(chapter.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ChaptersManager;
