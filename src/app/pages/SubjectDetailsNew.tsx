import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { BookOpen, FileText, Video, Users, Play, Plus, Pencil, Trash2, Upload, FolderOpen, ExternalLink, ArrowLeft } from 'lucide-react';
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

const SubjectDetailsNew = () => {
  console.log('🎯🎯🎯 NEW APP SubjectDetails component rendered - FLUTTER-STYLE DESIGN ACTIVE');
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

  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
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

  const getResourcesByChapter = (chapterId: string) => {
    return resources.filter(resource => resource.chapter_id === chapterId);
  };

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'video':
        return <Video className="h-6 w-6 text-blue-500" />;
      case 'image':
        return <FileText className="h-6 w-6 text-green-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleOpenResource = (resource: Resource) => {
    if (resource.external_url) {
      window.open(resource.external_url, '_blank');
    } else if (resource.file_url) {
      window.open(resource.file_url, '_blank');
    }
  };

  const handleAddResource = (chapterId?: string) => {
    setSelectedChapterForResource(chapterId || '');
    setIsResourceDialogOpen(true);
  };

  const handleAddChapter = () => {
    setSelectedChapter(undefined);
    setIsChapterDialogOpen(true);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsChapterDialogOpen(true);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);
        
      if (error) throw error;
      
      toast({
        title: "Chapter deleted",
        description: "The chapter has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['subject-chapters', subjectId] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chapter. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (subjectLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-learn-purple"></div>
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <main className="flex-1 container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Subject Hero Section */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
            {/* Subject Thumbnail */}
            <div className="relative w-full h-48 md:h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
              {subject.thumbnail_url ? (
                <img 
                  src={subject.thumbnail_url} 
                  alt={subject.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <BookOpen className="h-24 w-24 text-indigo-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-indigo-600">{subject.title}</div>
                </div>
              )}
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Play className="h-8 w-8 text-indigo-600 ml-1" />
                </div>
              </div>
            </div>

            {/* Subject Info */}
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{subject.title}</h1>
              {subject.description && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {subject.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-indigo-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-indigo-600">{chapters.length}</div>
                <div className="text-sm text-indigo-500">Chapters</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600">{resources.length}</div>
                <div className="text-sm text-purple-500">Resources</div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <Tabs defaultValue="resources" className="w-full">
              <TabsList className="grid grid-cols-2 w-full rounded-none bg-gray-50 p-1">
                <TabsTrigger 
                  value="resources" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-xl"
                >
                  Resources
                </TabsTrigger>
                <TabsTrigger 
                  value="videos" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-xl"
                >
                  Videos
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="resources" className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Available Resources</h3>
                    {isAdmin && (
                      <Button onClick={() => handleAddResource()} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Resource
                      </Button>
                    )}
                  </div>
                  
                  {resources.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No resources available yet</p>
                      <p className="text-gray-400 text-sm">Resources will appear here once they're added</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {resources.map((resource) => (
                        <div key={resource.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                            {getResourceIcon(resource.resource_type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{resource.title}</h4>
                            {resource.description && (
                              <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {resource.resource_type}
                              </Badge>
                              {resource.chapter_id && (
                                <Badge variant="outline" className="text-xs">
                                  Chapter Resource
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {resource.file_url && resource.file_url.toLowerCase().includes('.pdf') ? (
                              <PDFLink 
                                url={resource.file_url}
                                title={resource.title}
                                variant="button"
                                showDownloadButton={true}
                                className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                              />
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleOpenResource(resource)}
                                className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Open
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="videos" className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Video Lessons</h3>
                    {isAdmin && (
                      <Button onClick={handleAddChapter} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Chapter
                      </Button>
                    )}
                  </div>
                  
                  {chapters.length === 0 ? (
                    <div className="text-center py-12">
                      <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No video lessons available yet</p>
                      <p className="text-gray-400 text-sm">Chapters and videos will appear here once they're added</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chapters.map((chapter) => (
                        <div key={chapter.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Play className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{chapter.title}</h4>
                            {chapter.description && (
                              <p className="text-sm text-gray-500 mt-1">{chapter.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                Chapter {chapter.order_index + 1}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {getResourcesByChapter(chapter.id).length} resources
                              </span>
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditChapter(chapter)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddResource(chapter.id)}
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
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

export default SubjectDetailsNew;
