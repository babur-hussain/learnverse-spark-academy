import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { BookOpen, FileText, Video, Users, Play, Plus, Pencil, Trash2, Upload, FolderOpen, ExternalLink } from 'lucide-react';
import PDFLink from '@/components/UI/PDFLink';
import { supabase } from '@/integrations/supabase/client';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/use-user-role';
import { ChapterDialog } from '@/components/Admin/SubjectManager/ChapterDialog';
import { ResourceDialog } from '@/components/Admin/SubjectManager/ResourceDialog';
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

interface Subject {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
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

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  file_url: string | null;
  external_url: string | null;
  is_published: boolean;
  order_index: number;
  chapter_id: string | null;
  subject_id: string | null;
}

const SubjectDetails = () => {
  console.log('🎯🎯🎯 APP SubjectDetails component rendered - FLUTTER-STYLE DESIGN ACTIVE');
  console.log('Component loaded at:', new Date().toISOString());
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useUserRole();
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | undefined>();
  const [selectedChapterForResource, setSelectedChapterForResource] = useState<string>('');

  const { data: subject, isLoading: subjectLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: async () => {
      if (!subjectId) throw new Error('Subject ID is required');
      
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();
        
      if (error) throw error;
      return data as Subject;
    },
    enabled: !!subjectId,
  });

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ['subject-chapters', subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index');
        
      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!subjectId,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['subject-resources', subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      
      const { data, error } = await supabase
        .from('subject_resources')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('is_published', true)
        .order('order_index');
        
      if (error) throw error;
      return data as Resource[];
    },
    enabled: !!subjectId,
  });

  const deleteChapterMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      // Check if any resources depend on this chapter
      const { data: chapterResources, error: resourcesError } = await supabase
        .from('subject_resources')
        .select('id')
        .eq('chapter_id', chapterId)
        .limit(1);
      
      if (resourcesError) throw resourcesError;
      
      if (chapterResources && chapterResources.length > 0) {
        throw new Error('Cannot delete chapter with existing resources. Delete resources first.');
      }
      
      // Delete the chapter
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-chapters', subjectId] });
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

  const handleAddChapter = () => {
    setSelectedChapter(undefined);
    setIsChapterDialogOpen(true);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsChapterDialogOpen(true);
  };

  const handleDeleteChapter = (chapterId: string) => {
    deleteChapterMutation.mutate(chapterId);
  };

  const handleAddResource = (chapterId?: string) => {
    setSelectedChapterForResource(chapterId || '');
    setIsResourceDialogOpen(true);
  };

  const handleManageChapterContent = (chapterId: string) => {
    navigate(`/subject-management/subject/${subjectId}/chapter/${chapterId}`);
  };

  const handleOpenResource = (resource: Resource) => {
    if (resource.external_url) {
      window.open(resource.external_url, '_blank');
    } else if (resource.file_url) {
      if (resource.file_url.toLowerCase().includes('.pdf')) {
        // PDF will be handled by PDFLink component
        return;
      } else {
        window.open(resource.file_url, '_blank');
      }
    } else {
      toast({
        title: "No URL available",
        description: "This resource doesn't have a valid URL to open.",
        variant: "destructive"
      });
    }
  };

  const getResourcesByChapter = (chapterId: string) => {
    return resources.filter(resource => resource.chapter_id === chapterId);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'link':
        return <ExternalLink className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (subjectLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center pt-16">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center pt-16">
          <div>Subject not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-20 md:pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Subject Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold">{subject.title}</h1>
            </div>
            {subject.description && (
              <p className="text-lg text-muted-foreground mb-6">{subject.description}</p>
            )}
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Chapters</p>
                      <p className="text-2xl font-bold">{chapters.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Resources</p>
                      <p className="text-2xl font-bold">{resources.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Students</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="chapters" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="content-files">Content Files</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content-files">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Content files will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="resources">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">All Resources</h3>
                    {isAdmin && (
                      <Button onClick={() => handleAddResource()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Resource
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((resource) => (
                      <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getResourceIcon(resource.resource_type)}
                              <h4 className="font-medium">{resource.title}</h4>
                            </div>
                            <Badge variant="outline">{resource.resource_type}</Badge>
                          </div>
                          {resource.description && (
                            <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              {resource.chapter_id ? 'In Chapter' : 'General'}
                            </span>
                            {resource.file_url && resource.file_url.toLowerCase().includes('.pdf') ? (
                              <PDFLink 
                                url={resource.file_url}
                                title={resource.title}
                                variant="button"
                                showDownloadButton={true}
                              />
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleOpenResource(resource)}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="chapters">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">Subject Chapters</h3>
                    {isAdmin && (
                      <Button onClick={handleAddChapter}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Chapter
                      </Button>
                    )}
                  </div>

                  {chaptersLoading ? (
                    <div className="text-center py-8">
                      <p>Loading chapters...</p>
                    </div>
                  ) : chapters.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No chapters created yet</p>
                      {isAdmin && (
                        <Button onClick={handleAddChapter}>
                          Create First Chapter
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chapters.map((chapter) => {
                        const chapterResources = getResourcesByChapter(chapter.id);
                        return (
                          <Card key={chapter.id}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium">
                                      {chapter.order_index + 1}
                                    </span>
                                    <h4 className="text-lg font-semibold">{chapter.title}</h4>
                                  </div>
                                  {chapter.description && (
                                    <p className="text-muted-foreground mb-3">{chapter.description}</p>
                                  )}
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <span className="flex items-center space-x-1">
                                      <FileText className="h-4 w-4" />
                                      <span>{chapterResources.length} resources</span>
                                    </span>
                                  </div>
                                </div>
                                {isAdmin && (
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAddResource(chapter.id)}
                                    >
                                      <Upload className="h-4 w-4 mr-1" />
                                      Add Resource
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleManageChapterContent(chapter.id)}
                                    >
                                      <FolderOpen className="h-4 w-4 mr-1" />
                                      Manage
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditChapter(chapter)}
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
                                          <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{chapter.title}"? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteChapter(chapter.id)}>
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                )}
                              </div>

                              {/* Chapter Resources Preview */}
                              {chapterResources.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                  <h5 className="text-sm font-medium mb-2">Chapter Resources:</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {chapterResources.slice(0, 3).map((resource) => (
                                      resource.file_url && resource.file_url.toLowerCase().includes('.pdf') ? (
                                        <PDFLink 
                                          key={resource.id}
                                          url={resource.file_url}
                                          title={resource.title}
                                          variant="badge"
                                          showDownloadButton={true}
                                        />
                                      ) : (
                                        <Badge 
                                          key={resource.id} 
                                          variant="secondary" 
                                          className="text-xs cursor-pointer hover:bg-secondary/80"
                                          onClick={() => handleOpenResource(resource)}
                                        >
                                          {getResourceIcon(resource.resource_type)}
                                          <span className="ml-1">{resource.title}</span>
                                        </Badge>
                                      )
                                    ))}
                                    {chapterResources.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{chapterResources.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {isMobile && <MobileFooter />}

      {/* Chapter Dialog */}
      {isAdmin && (
        <ChapterDialog
          open={isChapterDialogOpen}
          onOpenChange={setIsChapterDialogOpen}
          chapter={selectedChapter}
          subjectId={subjectId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['subject-chapters', subjectId] });
            setIsChapterDialogOpen(false);
          }}
        />
      )}

      {/* Resource Dialog */}
      {isAdmin && (
        <ResourceDialog
          open={isResourceDialogOpen}
          onOpenChange={setIsResourceDialogOpen}
          initialSubjectId={subjectId || ''}
          initialChapterId={selectedChapterForResource}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['subject-resources', subjectId] });
            setIsResourceDialogOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default SubjectDetails;
