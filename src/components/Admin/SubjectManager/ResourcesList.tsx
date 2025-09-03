import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/UI/table';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Plus, Pencil, Trash2, FileText, Video, Link as LinkIcon, File } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ResourceDialog } from './ResourceDialog';
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
import { Switch } from '@/components/UI/switch';
import { Badge } from '@/components/UI/badge';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  file_url: string | null;
  external_url: string | null;
  is_published: boolean;
  order_index: number;
  created_at: string;
  subject_id: string | null;
  chapter_id: string | null;
  subject_title?: string;
  chapter_title?: string;
}

interface Subject {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  title: string;
  subject_id: string;
}

// Add the interface for component props
interface ResourcesListProps {
  subjectId: string | null;
  chapterId: string | null;
}

const getResourceTypeIcon = (resourceType: string) => {
  switch (resourceType) {
    case 'note':
      return <FileText className="h-4 w-4" />;
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'link':
      return <LinkIcon className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

const ResourcesList: React.FC<ResourcesListProps> = ({ subjectId, chapterId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectId || '');
  const [selectedChapter, setSelectedChapter] = useState<string>(chapterId || '');
  const [resourceType, setResourceType] = useState<string>('');
  
  // Update state when props change
  useEffect(() => {
    if (subjectId) {
      setSelectedSubject(subjectId);
    }
    
    if (chapterId) {
      setSelectedChapter(chapterId);
    }
  }, [subjectId, chapterId]);

  const { data: subjects } = useQuery({
    queryKey: ['admin-subjects-for-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, title')
        .order('title');
        
      if (error) throw error;
      return data as Subject[];
    },
  });

  const { data: chapters } = useQuery({
    queryKey: ['admin-chapters-for-resources', selectedSubject],
    queryFn: async () => {
      let query = supabase
        .from('chapters')
        .select('id, title, subject_id')
        .order('order_index');
        
      if (selectedSubject) {
        query = query.eq('subject_id', selectedSubject);
      }
        
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!selectedSubject,
  });

  const { data: resources, isLoading } = useQuery({
    queryKey: ['admin-resources', selectedSubject, selectedChapter, resourceType],
    queryFn: async () => {
      let query = supabase
        .from('subject_resources')
        .select(`
          *,
          subjects:subject_id (title),
          chapters:chapter_id (title)
        `)
        .order('order_index');
      
      if (selectedSubject) {
        query = query.eq('subject_id', selectedSubject);
      }
      
      if (selectedChapter) {
        query = query.eq('chapter_id', selectedChapter);
      }
      
      if (resourceType) {
        query = query.eq('resource_type', resourceType);
      }
        
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to match the Resource interface
      return data.map((item: any) => ({
        ...item,
        subject_title: item.subjects?.title,
        chapter_title: item.chapters?.title
      })) as Resource[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subject_resources')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      toast({
        title: "Success",
        description: "Resource deleted successfully"
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

  const publishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from('subject_resources')
        .update({ is_published: isPublished })
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
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
  
  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDialogOpen(true);
  };
  
  const handleAdd = () => {
    setSelectedResource(undefined);
    setIsDialogOpen(true);
  };

  const handlePublishToggle = (id: string, isPublished: boolean) => {
    publishMutation.mutate({ id, isPublished: !isPublished });
  };
  
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value === 'all' ? '' : value);
    setSelectedChapter(''); // Reset chapter selection when subject changes
  };
  
  const handleChapterChange = (value: string) => {
    setSelectedChapter(value === 'all' ? '' : value);
  };
  
  const handleResourceTypeChange = (value: string) => {
    setResourceType(value === 'all' ? '' : value);
  };

  const filteredResources = resources?.filter(resource => 
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Learning Resources</h2>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <Select value={selectedSubject} onValueChange={handleSubjectChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
                                      <SelectItem value="all">All Subjects</SelectItem>
              {subjects?.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Chapter</label>
          <Select 
            value={selectedChapter} 
            onValueChange={handleChapterChange}
            disabled={!selectedSubject || !chapters || chapters.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Chapters" />
            </SelectTrigger>
            <SelectContent>
                                      <SelectItem value="all">All Chapters</SelectItem>
              {chapters?.map((chapter) => (
                <SelectItem key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Resource Type</label>
          <Select value={resourceType} onValueChange={handleResourceTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
                                      <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="note">Notes</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
              <SelectItem value="link">Links</SelectItem>
              <SelectItem value="file">Files</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center">
          <p>Loading resources...</p>
        </div>
      ) : filteredResources && filteredResources.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No resources found. Adjust filters or add new resources.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResources?.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getResourceTypeIcon(resource.resource_type)}
                    <Badge variant="outline">{resource.resource_type}</Badge>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{resource.title}</TableCell>
                <TableCell>
                  {resource.chapter_title ? (
                    <span>
                      {resource.subject_title} &gt; {resource.chapter_title}
                    </span>
                  ) : (
                    <span>{resource.subject_title}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={resource.is_published}
                    onCheckedChange={() => handlePublishToggle(resource.id, resource.is_published)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(resource)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{resource.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(resource.id)}>Delete</AlertDialogAction>
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

      <ResourceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        resource={selectedResource}
        initialSubjectId={selectedSubject}
        initialChapterId={selectedChapter}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-resources'] })}
      />
    </div>
  );
};

export default ResourcesList;
