import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/integrations/api/client';
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
import { InlineIconUploader } from './InlineIconUploader';

interface Subject {
  id: string;
  title?: string;
  name?: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  icon?: string | null;
  thumbnail_url?: string | null;
  is_featured: boolean;
  class_id?: string | null;
  college_id?: string | null;
}

interface SubjectsListProps {
  onSelectSubject: (subjectId: string | null) => void;
  selectedSubjectId?: string | null;
}

function arraySafe<T>(arr: T[] | undefined | null): T[] {
  return Array.isArray(arr) ? arr : [];
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
      const { data } = await apiClient.get('/api/admin/subjects');
      return data as Subject[];
    }
  });

  // Fetch classes for mapping display
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/classes');
      return data as { id: string; name: string }[];
    }
  });

  // Fetch colleges for mapping display
  const { data: colleges = [] } = useQuery({
    queryKey: ['colleges'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/admin/colleges');
      return data as { id: string; name: string }[];
    }
  });

  const getMapping = (subject: Subject): string => {
    if (subject.class_id) {
      const cls = classes.find((c: any) => c.id === subject.class_id);
      return cls ? cls.name : 'Class';
    }
    if (subject.college_id) {
      const col = colleges.find((c: any) => c.id === subject.college_id);
      return col ? col.name : 'College';
    }
    return '—';
  };

  // Delete subject
  const deleteSubject = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/admin/subjects/${id}`);
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
      await apiClient.put(`/api/admin/subjects/${id}`, { is_featured: featured });

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
    subject => {
      const label = (subject.title || subject.name || '').toLowerCase();
      return label.includes(searchQuery.toLowerCase()) ||
        (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }
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
              <TableHead className="w-16">Icon</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Mapped To</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {arraySafe(filteredSubjects).map((subject) => (
              <TableRow
                key={subject.id}
                onClick={() => onSelectSubject(subject.id)}
                className={`cursor-pointer hover:bg-muted/50 ${selectedSubjectId === subject.id ? 'bg-muted' : ''}`}
              >
                <TableCell>
                  <InlineIconUploader 
                    subject={subject} 
                    onSuccess={handleSubjectSuccess} 
                  />
                </TableCell>
                <TableCell className="font-medium">{subject.title || subject.name}</TableCell>
                <TableCell className="max-w-xs truncate">{subject.description || '—'}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${subject.class_id ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      subject.college_id ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                    {getMapping(subject)}
                  </span>
                </TableCell>
                <TableCell>{new Date(subject.updatedAt || subject.updated_at || subject.createdAt || subject.created_at || '').toLocaleDateString()}</TableCell>
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
