
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Subject {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface SubjectsManagerProps {
  onSelectSubject: (subjectId: string | null) => void;
}

const SubjectsManager: React.FC<SubjectsManagerProps> = ({ onSelectSubject }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newSubject, setNewSubject] = useState({ title: '', description: '' });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch subjects
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
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

  // Create subject
  const createSubject = useMutation({
    mutationFn: async (subject: { title: string; description: string }) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{ 
          title: subject.title, 
          description: subject.description || null 
        }])
        .select()
        .single();
      
      if (error) {
        toast({
          title: 'Error creating subject',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Subject created',
        description: 'The subject has been created successfully.'
      });
      setNewSubject({ title: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setDialogOpen(false);
    }
  });

  // Update subject
  const updateSubject = useMutation({
    mutationFn: async (subject: Subject) => {
      const { data, error } = await supabase
        .from('subjects')
        .update({
          title: subject.title,
          description: subject.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', subject.id)
        .select()
        .single();
      
      if (error) {
        toast({
          title: 'Error updating subject',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Subject updated',
        description: 'The subject has been updated successfully.'
      });
      setEditingSubject(null);
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setDialogOpen(false);
    }
  });

  // Delete subject
  const deleteSubject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast({
          title: 'Error deleting subject',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      toast({
        title: 'Subject deleted',
        description: 'The subject has been deleted successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    }
  });

  // Filter subjects based on search query
  const filteredSubjects = subjects.filter(
    subject => subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateOrUpdate = () => {
    if (editingSubject) {
      updateSubject.mutate({
        ...editingSubject,
        title: newSubject.title,
        description: newSubject.description
      });
    } else {
      createSubject.mutate(newSubject);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setNewSubject({
      title: subject.title,
      description: subject.description || ''
    });
    setDialogOpen(true);
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      setEditingSubject(null);
      setNewSubject({ title: '', description: '' });
    }
    setDialogOpen(open);
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm('Are you sure you want to delete this subject? This will also delete all associated chapters and notes.')) {
      deleteSubject.mutate(subjectId);
      onSelectSubject(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-xl font-semibold">Manage Subjects</h2>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Subject Title</label>
                  <Input
                    id="title"
                    placeholder="Enter subject title"
                    value={newSubject.title}
                    onChange={(e) => setNewSubject({ ...newSubject, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    id="description"
                    placeholder="Enter subject description"
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
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
                  disabled={!newSubject.title.trim()}
                  className="gradient-primary"
                >
                  {editingSubject ? 'Update Subject' : 'Create Subject'}
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
      ) : filteredSubjects.length === 0 ? (
        <div className="text-center py-8">
          {searchQuery ? (
            <p className="text-muted-foreground">No subjects matching your search</p>
          ) : (
            <p className="text-muted-foreground">No subjects found. Add your first subject to get started.</p>
          )}
        </div>
      ) : (
        <Table>
          <TableCaption>List of all subjects</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubjects.map((subject) => (
              <TableRow key={subject.id} onClick={() => onSelectSubject(subject.id)} className="cursor-pointer">
                <TableCell className="font-medium">{subject.title}</TableCell>
                <TableCell>{subject.description || '—'}</TableCell>
                <TableCell>{new Date(subject.updated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSubject(subject);
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
                        handleDeleteSubject(subject.id);
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

export default SubjectsManager;
