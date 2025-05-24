import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/table';
import { Pencil, Trash2, Plus, Search, FolderOpen, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubjectDialog } from './SubjectDialog';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/UI/switch';

interface Subject {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  icon?: string | null;
  thumbnail_url?: string | null;
  is_featured: boolean;
}

interface SubjectsListProps {
  onSelectSubject: (subjectId: string | null) => void;
  selectedSubjectId?: string | null;
}

const SubjectsList: React.FC<SubjectsListProps> = ({ onSelectSubject, selectedSubjectId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
    onSuccess: (id) => {
      toast({
        title: 'Subject deleted',
        description: 'The subject has been deleted successfully.'
      });

      // If deleting the currently selected subject, clear the selection
      if (id === selectedSubjectId) {
        onSelectSubject(null);
      }

      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    }
  });

  // Toggle featured status
  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from('subjects')
        .update({ is_featured: featured })
        .eq('id', id);
      
      if (error) {
        toast({
          title: 'Error updating subject',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return { id, featured };
    },
    onSuccess: ({ featured }) => {
      toast({
        title: featured ? 'Subject featured' : 'Subject unfeatured',
        description: featured 
          ? 'The subject will now be displayed on the home page' 
          : 'The subject has been removed from the home page'
      });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    }
  });

  // Filter subjects based on search query
  const filteredSubjects = subjects?.filter(
    subject => subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setDialogOpen(true);
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      setEditingSubject(null);
    }
    setDialogOpen(open);
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm('Are you sure you want to delete this subject? This will also delete all associated chapters and notes.')) {
      deleteSubject.mutate(subjectId);
    }
  };

  const handleToggleFeatured = (subject: Subject) => {
    toggleFeatured.mutate({
      id: subject.id,
      featured: !subject.is_featured
    });
  };

  const handleSubjectSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['subjects'] });
  };

  const handleOpenSubjectContent = (subject: Subject) => {
    // Navigate to the admin content management page for this subject
    navigate(`/subject/${subject.id}`);
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
          
          <Button 
            className="gradient-primary"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learn-purple"></div>
        </div>
      ) : filteredSubjects?.length === 0 ? (
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
              <TableHead>Featured</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubjects?.map((subject) => (
              <TableRow 
                key={subject.id} 
                onClick={() => onSelectSubject(subject.id)} 
                className={`cursor-pointer hover:bg-muted/50 ${selectedSubjectId === subject.id ? 'bg-muted' : ''}`}
              >
                <TableCell className="font-medium">{subject.title}</TableCell>
                <TableCell>{subject.description || '—'}</TableCell>
                <TableCell>{new Date(subject.updated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Switch
                    checked={subject.is_featured}
                    onCheckedChange={() => handleToggleFeatured(subject)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSubjectContent(subject);
                      }}
                      title="Open Subject Content"
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSubject(subject);
                      }}
                      title="Edit Subject"
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
                      title="Delete Subject"
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

      <SubjectDialog 
        open={dialogOpen} 
        onOpenChange={handleDialogOpen} 
        subject={editingSubject}
        onSuccess={handleSubjectSuccess}
      />
    </div>
  );
};

export default SubjectsList;
