import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, publicSupabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
import Navbar from '@/components/Layout/Navbar';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import { FileUpload } from '@/components/Admin/SubjectManager/FileUpload';
import ResourcesList from '@/components/Admin/SubjectManager/ResourcesList';
import { ArrowLeft, File, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/UI/alert-dialog';

interface Subject {
  id: string;
  title: string;
  description: string | null;
  is_featured?: boolean;
}

interface SubjectFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  file_url: string;
  title: string;
}

const SubjectContent = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("files");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const { isAdmin, isLoading: isRoleLoading } = useUserRole();
  
  // Fetch subject files - bypass user_roles check
  const { data: files, isLoading: isFilesLoading, error: filesError } = useQuery({
    queryKey: ['subject-files', subjectId],
    queryFn: async () => {
      console.log('Starting file fetch for subject ID:', subjectId);
      
      if (!subjectId) {
        console.error('No subject ID provided');
        throw new Error('Subject ID is required');
      }

      try {
        // First get the files from subject_resources
        console.log('Fetching from subject_resources table...');
        const { data: resources, error: resourcesError } = await publicSupabase
          .from('subject_resources')
          .select('*')
          .eq('subject_id', subjectId);
          
        if (resourcesError) {
          console.error('Error fetching resources:', resourcesError);
          throw new Error(`Database error: ${resourcesError.message}`);
        }
        console.log('Resources from table:', resources);

        // List all buckets first
        console.log('Listing all storage buckets...');
        const { data: buckets, error: bucketsError } = await publicSupabase
          .storage
          .listBuckets();
        
        if (bucketsError) {
          console.error('Error listing buckets:', bucketsError);
          throw new Error(`Storage error: ${bucketsError.message}`);
        }
        console.log('Available buckets:', buckets);

        // Try to list files from the subject-content bucket
        console.log('Listing files from subject-content bucket...');
        const { data: storageFiles, error: storageError } = await publicSupabase
          .storage
          .from('subject-content')
          .list(subjectId, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
          });

        if (storageError) {
          console.error('Error fetching storage files:', storageError);
          throw new Error(`Storage error: ${storageError.message}`);
        }
        console.log('Files from storage:', storageFiles);

        // If no files in the subject folder, try listing root
        if (!storageFiles || storageFiles.length === 0) {
          console.log('No files in subject folder, checking root...');
          const { data: rootFiles, error: rootError } = await publicSupabase
            .storage
            .from('subject-content')
            .list('', {
              limit: 100,
              offset: 0,
              sortBy: { column: 'name', order: 'asc' }
            });

          if (rootError) {
            console.error('Error fetching root files:', rootError);
          } else {
            console.log('Files in root:', rootFiles);
          }
        }

        // Combine both sources
        const combinedFiles = (resources || []).map(resource => {
          // Find matching storage file for URL if needed, but do not add extra files
          const storageFile = storageFiles?.find(file => 
            file.name === resource.file_name || 
            file.name === resource.title
          );
          const fileUrl = storageFile ? 
            publicSupabase.storage
              .from('subject-content')
              .getPublicUrl(`${subjectId}/${storageFile.name}`).data.publicUrl 
            : resource.file_url || '';
          return {
            id: resource.id,
            file_name: resource.file_name || resource.title,
            title: resource.title,
            file_type: resource.file_type || 'Unknown',
            file_size: Number(resource.file_size) || 0,
            created_at: resource.created_at,
            file_url: fileUrl
          };
        });
        console.log('Final files (table only):', combinedFiles);
        return combinedFiles;
      } catch (err) {
        console.error('Detailed files fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setErrorMessage(errorMessage);
        throw new Error(`Failed to load resources: ${errorMessage}`);
      }
    },
    enabled: !!subjectId,
    retry: 1
  });

  // Fetch subject details using public client
  const { data: subject, isLoading: isSubjectLoading, error: subjectError } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: async () => {
      console.log('Fetching subject details for ID:', subjectId);
      try {
        const { data, error } = await publicSupabase
          .from('subjects')
          .select('id, title, description, is_featured')
          .eq('id', subjectId)
          .single();
          
        if (error) {
          console.error('Error fetching subject:', error);
          if (error.code === 'PGRST116') {
            throw new Error('Subject not found');
          }
          throw new Error(`Error loading subject: ${error.message}`);
        }
        
        if (!data) {
          throw new Error('Subject not found');
        }
        
        return data as Subject;
      } catch (err) {
        console.error('Subject fetch error:', err);
        throw err;
      }
    },
    enabled: !!subjectId,
    retry: 1
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      console.log('Deleting file with ID:', fileId);
      
      // Get file information first to delete from storage
      const { data: fileData, error: fetchError } = await supabase
        .from('subject_resources')
        .select('file_url')
        .eq('id', fileId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching file details:', fetchError);
        throw fetchError;
      }
      
      // Delete from subject_resources table
      const { error } = await supabase
        .from('subject_resources')
        .delete()
        .eq('id', fileId);
        
      if (error) {
        console.error('Error deleting file from database:', error);
        throw error;
      }
      
      // Try to delete from storage if URL exists
      if (fileData?.file_url) {
        try {
          // Extract path from URL
          const urlParts = fileData.file_url.split('subject-content/');
          if (urlParts.length > 1) {
            const storagePath = urlParts[1];
            const { error: storageError } = await supabase
              .storage
              .from('subject-content')
              .remove([storagePath]);
              
            if (storageError) {
              console.warn('Could not delete from storage:', storageError);
              // Don't throw here, we still deleted the database entry
            }
          }
        } catch (storageErr) {
          console.warn('Error in storage deletion:', storageErr);
          // Continue anyway since the database record is already deleted
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-files', subjectId] });
      toast({
        title: "File deleted",
        description: "The file has been deleted successfully."
      });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error deleting file",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Toggle featured status mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string, featured: boolean }) => {
      console.log('Toggling featured status:', { id, featured });
      const { error } = await supabase
        .from('subjects')
        .update({ is_featured: featured })
        .eq('id', id);

      if (error) {
        console.error('Error updating featured status:', error);
        throw error;
      }
      return { id, featured };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subject', subjectId] });
      toast({
        title: data.featured ? "Subject featured" : "Subject unfeatured",
        description: data.featured 
          ? "This subject will now appear on the homepage" 
          : "This subject will no longer appear on the homepage"
      });
    },
    onError: (error: any) => {
      console.error('Feature toggle error:', error);
      toast({
        title: "Error updating subject",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileUploaded = () => {
    console.log('File uploaded, invalidating queries');
    setErrorMessage(null);
    queryClient.invalidateQueries({ queryKey: ['subject-files', subjectId] });
  };

  const handleDeleteFile = (fileId: string) => {
    console.log('Handling file deletion for ID:', fileId);
    deleteFileMutation.mutate(fileId);
  };

  const handleToggleFeatured = () => {
    if (subject) {
      console.log('Toggling featured status for subject:', subject.id);
      toggleFeaturedMutation.mutate({ 
        id: subject.id, 
        featured: !subject.is_featured 
      });
    }
  };

  // Show loading state while checking role
  if (isRoleLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learn-purple"></div>
      </div>
    );
  }

  // If subject is loading
  if (isSubjectLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learn-purple"></div>
      </div>
    );
  }

  // If subject fetch failed or not found
  if (subjectError || !subject) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4 text-destructive">Subject Not Found</h2>
        <p className="text-muted-foreground mb-4">{subjectError?.message || 'The subject you are looking for does not exist or could not be loaded.'}</p>
        <Button variant="outline" onClick={() => navigate('/subject-management')}>Back to Subject Management</Button>
      </div>
    );
  }

  // If user is admin, show admin view
  if (isAdmin) {
    return (
      <AdminRoleGuard>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => navigate('/subject-management')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Subject Management
              </Button>
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{subject.title}</h1>
                  {subject.description && (
                    <p className="text-gray-500 dark:text-gray-400 mt-2">{subject.description}</p>
                  )}
                </div>
                <Button
                  variant={subject.is_featured ? "destructive" : "default"}
                  onClick={handleToggleFeatured}
                  className={subject.is_featured ? "bg-red-600" : "bg-primary"}
                >
                  {subject.is_featured ? "Remove from Featured" : "Add to Featured"}
                </Button>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                <p className="text-red-700 dark:text-red-300">{errorMessage}</p>
                <Button 
                  variant="outline" 
                  className="mt-2" 
                  onClick={() => setErrorMessage(null)}
                >
                  Dismiss
                </Button>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="files">Content Files</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="chapters">Chapters</TabsTrigger>
              </TabsList>
              
              <TabsContent value="files" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload subjectId={subjectId!} onFileUploaded={handleFileUploaded} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Uploaded Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isFilesLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : files?.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {files.map((file) => (
                            <TableRow key={file.id}>
                              <TableCell className="flex items-center">
                                <File className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="font-medium">{file.title || file.file_name}</span>
                              </TableCell>
                              <TableCell>{file.file_type}</TableCell>
                              <TableCell>{formatFileSize(file.file_size)}</TableCell>
                              <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  {file.file_url && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(file.file_url, '_blank')}
                                      title="Open file"
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete File</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this file? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          className="bg-red-600 hover:bg-red-700"
                                          onClick={() => handleDeleteFile(file.id)}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No files uploaded yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="resources">
                <Card>
                  <CardContent className="pt-6">
                    <ResourcesList subjectId={subjectId!} chapterId={null} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="chapters">
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Chapters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Button 
                        onClick={() => navigate(`/subject-management/subjects/${subjectId}`)}
                      >
                        Manage Chapters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
          {isMobile && <MobileFooter />}
        </div>
      </AdminRoleGuard>
    );
  }

  // Public view for non-admin users
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {isSubjectLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learn-purple"></div>
          </div>
        ) : subjectError ? (
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold mb-4">Error Loading Subject</h1>
            <p className="text-muted-foreground">{errorMessage || 'There was an error loading this subject.'}</p>
          </div>
        ) : subject ? (
          <div>
            <div className="mb-8">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold mb-2">{subject.title}</h1>
              {subject.description && (
                <p className="text-muted-foreground">{subject.description}</p>
              )}
            </div>

            <Tabs defaultValue="files" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span>Resources</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="files">
                {isFilesLoading ? (
                  <Card className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-learn-purple mx-auto"></div>
                    <p className="mt-4 text-sm text-muted-foreground">Loading resources...</p>
                  </Card>
                ) : filesError ? (
                  <Card className="p-8 text-center">
                    <p className="text-red-500 mb-4">Error loading resources</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {errorMessage || 'There was a problem loading the resources. Please try again later.'}
                    </p>
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          console.log('Retrying file fetch...');
                          setErrorMessage(null);
                          queryClient.invalidateQueries({ queryKey: ['subject-files', subjectId] });
                        }}
                      >
                        Try Again
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        Subject ID: {subjectId}
                      </div>
                    </div>
                  </Card>
                ) : files && files.length > 0 ? (
                  <div className="grid gap-4">
                    {files.map((file) => (
                      <Card key={file.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <File className="h-6 w-6 text-learn-purple" />
                            <div>
                              <h3 className="font-medium">{file.title || file.file_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.file_size)}
                              </p>
                            </div>
                          </div>
                          {file.file_url ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                console.log('Opening file URL:', file.file_url);
                                window.open(file.file_url, '_blank');
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">No download available</span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No resources available for this subject yet.</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold mb-4">Subject Not Found</h1>
            <p className="text-muted-foreground">The requested subject could not be found.</p>
          </div>
        )}
      </main>
      {isMobile && <MobileFooter />}
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  if (isNaN(bytes) || bytes < 0) return 'Unknown';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default SubjectContent;
