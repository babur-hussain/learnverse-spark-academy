
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Badge } from '@/components/UI/badge';
import { Plus, FileText, Video, Link as LinkIcon, Upload, Pencil, Trash2 } from 'lucide-react';
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
}

interface ChapterContentManagerProps {
  chapterId: string;
  chapterTitle: string;
  subjectId: string;
}

const getResourceTypeIcon = (resourceType: string) => {
  switch (resourceType) {
    case 'note':
    case 'document':
      return <FileText className="h-4 w-4" />;
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'link':
      return <LinkIcon className="h-4 w-4" />;
    default:
      return <Upload className="h-4 w-4" />;
  }
};

const ChapterContentManager: React.FC<ChapterContentManagerProps> = ({ 
  chapterId, 
  chapterTitle, 
  subjectId 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | undefined>();
  const [activeTab, setActiveTab] = useState('notes');

  // Fetch chapter resources
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['chapter-resources', chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subject_resources')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('order_index');
        
      if (error) throw error;
      return data as Resource[];
    },
    enabled: !!chapterId,
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
      queryClient.invalidateQueries({ queryKey: ['chapter-resources', chapterId] });
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

  const handleAddResource = (type: string) => {
    setSelectedResource(undefined);
    setIsResourceDialogOpen(true);
  };

  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsResourceDialogOpen(true);
  };

  const handleDeleteResource = (id: string) => {
    deleteMutation.mutate(id);
  };

  // Filter resources by type
  const notes = resources.filter(r => r.resource_type === 'note' || r.resource_type === 'document');
  const videos = resources.filter(r => r.resource_type === 'video');
  const links = resources.filter(r => r.resource_type === 'link');
  const otherResources = resources.filter(r => 
    !['note', 'document', 'video', 'link'].includes(r.resource_type)
  );

  if (isLoading) {
    return <div>Loading chapter content...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Chapter Content</h2>
          <p className="text-muted-foreground">{chapterTitle}</p>
        </div>
        <Button onClick={() => handleAddResource('note')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notes">
            Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="videos">
            Videos ({videos.length})
          </TabsTrigger>
          <TabsTrigger value="links">
            Links ({links.length})
          </TabsTrigger>
          <TabsTrigger value="other">
            Other ({otherResources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notes & Documents</h3>
            <Button 
              variant="outline" 
              onClick={() => handleAddResource('note')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
          
          {notes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No notes uploaded yet</p>
                <Button 
                  className="mt-4" 
                  onClick={() => handleAddResource('note')}
                >
                  Upload First Note
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getResourceTypeIcon(resource.resource_type)}
                        <CardTitle className="text-sm">{resource.title}</CardTitle>
                      </div>
                      <Badge variant={resource.is_published ? 'default' : 'secondary'}>
                        {resource.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditResource(resource)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{resource.title}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteResource(resource.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Video Content</h3>
            <Button 
              variant="outline" 
              onClick={() => handleAddResource('video')}
            >
              <Video className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </div>
          
          {videos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No videos added yet</p>
                <Button 
                  className="mt-4" 
                  onClick={() => handleAddResource('video')}
                >
                  Add First Video
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((resource) => (
                <Card key={resource.id}>
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg flex items-center justify-center">
                    <Video size={40} className="text-primary opacity-50" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm">{resource.title}</CardTitle>
                      <Badge variant={resource.is_published ? 'default' : 'secondary'}>
                        {resource.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditResource(resource)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Video</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{resource.title}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteResource(resource.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">External Links</h3>
            <Button 
              variant="outline" 
              onClick={() => handleAddResource('link')}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
          
          {links.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No external links added yet</p>
                <Button 
                  className="mt-4" 
                  onClick={() => handleAddResource('link')}
                >
                  Add First Link
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {links.map((resource) => (
                <Card key={resource.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <LinkIcon className="h-4 w-4 text-primary" />
                        <div>
                          <h4 className="font-medium">{resource.title}</h4>
                          {resource.description && (
                            <p className="text-sm text-muted-foreground">
                              {resource.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={resource.is_published ? 'default' : 'secondary'}>
                          {resource.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditResource(resource)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Link</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{resource.title}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteResource(resource.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Other Resources</h3>
            <Button 
              variant="outline" 
              onClick={() => handleAddResource('file')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Add File
            </Button>
          </div>
          
          {otherResources.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No other resources added yet</p>
                <Button 
                  className="mt-4" 
                  onClick={() => handleAddResource('file')}
                >
                  Add First File
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherResources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getResourceTypeIcon(resource.resource_type)}
                        <CardTitle className="text-sm">{resource.title}</CardTitle>
                      </div>
                      <Badge variant={resource.is_published ? 'default' : 'secondary'}>
                        {resource.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditResource(resource)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{resource.title}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteResource(resource.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ResourceDialog
        open={isResourceDialogOpen}
        onOpenChange={setIsResourceDialogOpen}
        resource={selectedResource}
        initialSubjectId={subjectId}
        initialChapterId={chapterId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['chapter-resources', chapterId] });
          setIsResourceDialogOpen(false);
        }}
      />
    </div>
  );
};

export default ChapterContentManager;
