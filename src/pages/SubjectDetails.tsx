
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Button } from '@/components/UI/button';
import { BookOpen, FileText, Video, DownloadCloud, ExternalLink, ChevronLeft, BookMarked, BookOpenCheck } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { EducationalLoader } from '@/components/UI/educational-loader';
import { Badge } from '@/components/UI/badge';
import { Progress } from '@/components/UI/progress';

interface Subject {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

interface Chapter {
  id: string;
  title: string;
  content?: string; // Make content optional to match the DB schema
  order_index: number;
  created_at: string;
  subject_id: string;
  description?: string | null;
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  external_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  subject_id: string;
  resource_type: string;
}

const SubjectDetailsPage = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch subject details
  const { data: subject, isLoading: subjectLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();
        
      if (error) throw error;
      return data as Subject;
    },
  });
  
  // Fetch chapters
  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters', subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index');
        
      if (error) throw error;
      return data as Chapter[]; // Use type assertion to match our interface
    },
    enabled: !!subjectId,
  });
  
  // Fetch resources
  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ['resources', subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subject_resources')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Resource[];
    },
    enabled: !!subjectId,
  });

  // Display loading state
  if (subjectLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 px-4">
          <div className="flex justify-center items-center min-h-[50vh]">
            <EducationalLoader message="Loading subject details..." />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Organize resources by type
  const documents = resources.filter(r => r.resource_type === 'document' || r.file_type?.includes('pdf') || r.file_type?.includes('doc'));
  const videos = resources.filter(r => r.resource_type === 'video' || r.file_type?.includes('video'));
  const otherResources = resources.filter(r => 
    !documents.includes(r) && !videos.includes(r)
  );

  // Generate random progress for demo purposes (in real app, this would come from user data)
  const progress = Math.floor(Math.random() * 100);
  
  // Determine appropriate color based on subject title (for visual variety)
  const colors = ['from-purple-500 to-blue-500', 'from-blue-500 to-teal-500', 'from-pink-500 to-purple-500', 
                 'from-orange-500 to-pink-500', 'from-green-500 to-teal-500', 'from-red-500 to-orange-500'];
  const colorIndex = subject?.title ? subject.title.length % colors.length : 0;
  const gradientClass = colors[colorIndex];

  return (
    <MainLayout>
      {subject && (
        <>
          {/* Hero Banner */}
          <div className={`bg-gradient-to-r ${gradientClass} text-white`}>
            <div className="container mx-auto px-4 py-16">
              <Link to="/catalog" className="flex items-center mb-6 text-white hover:text-white/80">
                <ChevronLeft className="mr-1 h-4 w-4" /> Back to Catalog
              </Link>
              
              <div className="flex flex-col lg:flex-row items-start gap-8">
                <div className="w-full lg:w-2/3">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">{subject.title}</h1>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                      {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
                    </Badge>
                    <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                      {resources.length} {resources.length === 1 ? 'Resource' : 'Resources'}
                    </Badge>
                    <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                      {new Date(subject.updated_at).toLocaleDateString()} (Updated)
                    </Badge>
                  </div>
                  
                  <p className="text-lg mb-8 max-w-3xl">{subject.description}</p>
                  
                  <div className="flex gap-4">
                    <Button 
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90"
                      onClick={() => setActiveTab('chapters')}
                    >
                      <BookOpenCheck className="mr-2 h-5 w-5" />
                      Start Learning
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                      onClick={() => setActiveTab('resources')}
                    >
                      <FileText className="mr-2 h-5 w-5" />
                      Browse Resources
                    </Button>
                  </div>
                </div>
                
                <div className="w-full lg:w-1/3 rounded-lg overflow-hidden shadow-lg bg-white/10 backdrop-blur-sm">
                  {subject.thumbnail_url ? (
                    <img 
                      src={subject.thumbnail_url} 
                      alt={subject.title} 
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-video flex items-center justify-center bg-white/5">
                      <BookOpen size={80} className="opacity-70" />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">Your Progress</h3>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>Completion</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/20">
                      <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
                    </Progress>
                    
                    <div className="mt-6 flex justify-between text-sm">
                      <span>Last activity</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Tabs */}
          <div className="container mx-auto px-4 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full sm:w-auto flex flex-wrap">
                <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
                <TabsTrigger value="chapters" className="flex-1 sm:flex-none">Chapters</TabsTrigger>
                <TabsTrigger value="resources" className="flex-1 sm:flex-none">Resources</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="mr-2 h-5 w-5 text-primary" />
                        Chapters
                      </CardTitle>
                      <CardDescription>Browse learning content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'} available to learn through.</p>
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab('chapters')}>
                        View Chapters
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-primary" />
                        Documents
                      </CardTitle>
                      <CardDescription>Study materials & PDFs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{documents.length} {documents.length === 1 ? 'document' : 'documents'} available for download.</p>
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab('resources')}>
                        Access Documents
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Video className="mr-2 h-5 w-5 text-primary" />
                        Video Resources
                      </CardTitle>
                      <CardDescription>Watch and learn</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{videos.length} {videos.length === 1 ? 'video' : 'videos'} to enhance your understanding.</p>
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab('resources')}>
                        Watch Videos
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>About This Subject</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{subject.description}</p>
                    <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-bold mb-2">Subject Details</h3>
                      <ul className="space-y-2 text-sm">
                        <li><strong>Last Updated:</strong> {new Date(subject.updated_at).toLocaleDateString()}</li>
                        <li><strong>Created:</strong> {new Date(subject.created_at).toLocaleDateString()}</li>
                        <li><strong>Total Resources:</strong> {resources.length}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Chapters Tab */}
              <TabsContent value="chapters" className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <BookMarked className="mr-2 h-5 w-5 text-primary" />
                  Chapters ({chapters.length})
                </h2>
                
                {chaptersLoading ? (
                  <EducationalLoader message="Loading chapters..." />
                ) : chapters.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground">No chapters available for this subject yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {chapters.map((chapter, index) => (
                      <Card key={chapter.id} className="overflow-hidden border-l-4 border-primary">
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold mb-2 flex items-center">
                                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">
                                  {chapter.order_index || index + 1}
                                </span>
                                {chapter.title}
                              </h3>
                              {chapter.description && (
                                <div className="mt-2 line-clamp-3 text-muted-foreground">
                                  {chapter.description}
                                </div>
                              )}
                              {chapter.content && (
                                <div className="mt-2 line-clamp-3 text-muted-foreground" 
                                   dangerouslySetInnerHTML={{ __html: chapter.content.slice(0, 150) + '...' }} />
                              )}
                            </div>
                            <Link to={`/subject/${subject.id}?chapter=${chapter.id}`}>
                              <Button>Read Chapter</Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Learning Resources ({resources.length})
                </h2>
                
                {resourcesLoading ? (
                  <EducationalLoader message="Loading resources..." />
                ) : resources.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground">No resources available for this subject yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {documents.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center text-primary">
                          <FileText className="mr-2 h-5 w-5" />
                          Documents
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {documents.map((resource) => (
                            <Card key={resource.id} className="overflow-hidden h-full flex flex-col">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{resource.title}</CardTitle>
                                {resource.description && (
                                  <CardDescription className="line-clamp-2">
                                    {resource.description}
                                  </CardDescription>
                                )}
                              </CardHeader>
                              
                              <CardContent className="flex-grow">
                                {resource.file_name && (
                                  <div className="text-sm text-muted-foreground mb-2">
                                    <span className="font-medium">{resource.file_name}</span>
                                    {resource.file_size && (
                                      <span className="ml-2">
                                        ({Math.round(resource.file_size / 1024)} KB)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                              
                              <div className="p-4 pt-0 mt-auto">
                                {resource.file_url ? (
                                  <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => window.open(resource.file_url, '_blank')}
                                  >
                                    <DownloadCloud className="mr-2 h-4 w-4" />
                                    Download
                                  </Button>
                                ) : resource.external_url ? (
                                  <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => window.open(resource.external_url, '_blank')}
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open Link
                                  </Button>
                                ) : (
                                  <Button variant="outline" className="w-full" disabled>
                                    Unavailable
                                  </Button>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {videos.length > 0 && (
                      <div className="space-y-4 mt-8">
                        <h3 className="text-xl font-bold flex items-center text-primary">
                          <Video className="mr-2 h-5 w-5" />
                          Videos
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {videos.map((resource) => (
                            <Card key={resource.id} className="overflow-hidden h-full flex flex-col">
                              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                                {/* Video placeholder thumbnail */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Video size={40} className="text-primary opacity-50" />
                                </div>
                              </div>
                              
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{resource.title}</CardTitle>
                                {resource.description && (
                                  <CardDescription className="line-clamp-2">
                                    {resource.description}
                                  </CardDescription>
                                )}
                              </CardHeader>
                              
                              <div className="p-4 pt-0 mt-auto">
                                {resource.file_url ? (
                                  <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => window.open(resource.file_url, '_blank')}
                                  >
                                    <Video className="mr-2 h-4 w-4" />
                                    Watch Video
                                  </Button>
                                ) : resource.external_url ? (
                                  <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => window.open(resource.external_url, '_blank')}
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Watch Video
                                  </Button>
                                ) : (
                                  <Button variant="outline" className="w-full" disabled>
                                    Unavailable
                                  </Button>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {otherResources.length > 0 && (
                      <div className="space-y-4 mt-8">
                        <h3 className="text-xl font-bold flex items-center text-primary">
                          <FileText className="mr-2 h-5 w-5" />
                          Other Resources
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {otherResources.map((resource) => (
                            <Card key={resource.id} className="overflow-hidden h-full flex flex-col">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{resource.title}</CardTitle>
                                {resource.description && (
                                  <CardDescription className="line-clamp-2">
                                    {resource.description}
                                  </CardDescription>
                                )}
                              </CardHeader>
                              
                              <div className="p-4 pt-0 mt-auto">
                                {resource.file_url ? (
                                  <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => window.open(resource.file_url, '_blank')}
                                  >
                                    <DownloadCloud className="mr-2 h-4 w-4" />
                                    Access Resource
                                  </Button>
                                ) : resource.external_url ? (
                                  <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => window.open(resource.external_url, '_blank')}
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open Link
                                  </Button>
                                ) : (
                                  <Button variant="outline" className="w-full" disabled>
                                    Unavailable
                                  </Button>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default SubjectDetailsPage;
