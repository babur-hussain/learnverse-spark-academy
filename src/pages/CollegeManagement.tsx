import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/UI/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Plus, Pencil, Trash2, Upload, Download, BookOpen, FolderOpen, FileText, ExternalLink } from 'lucide-react';
import { CollegeSubjectDialog } from '@/components/Admin/CollegeManager/CollegeSubjectDialog';
import { CollegeChapterDialog } from '@/components/Admin/CollegeManager/CollegeChapterDialog';
import { CollegeResourceDialog } from '@/components/Admin/CollegeManager/CollegeResourceDialog';
import { CollegeResourceUpload } from '@/components/Admin/CollegeManager/CollegeResourceUpload';

const CollegeManagement = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [newCollege, setNewCollege] = useState({ name: '', description: '' });
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [noteFile, setNoteFile] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Subject management states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingResource, setEditingResource] = useState(null);

  // Fetch colleges
  const { data: colleges = [], isLoading } = useQuery({
    queryKey: ['colleges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch subjects for selected college
  const { data: collegeSubjects = [] } = useQuery({
    queryKey: ['college-subjects', selectedCollege?.id],
    queryFn: async () => {
      if (!selectedCollege) return [];
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('college_id', selectedCollege.id)
        .order('title');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCollege
  });

  // Fetch chapters for selected subject
  const { data: subjectChapters = [] } = useQuery({
    queryKey: ['subject-chapters', selectedSubjectId],
    queryFn: async () => {
      if (!selectedSubjectId) return [];
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('subject_id', selectedSubjectId)
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSubjectId
  });

  // Fetch resources for selected subject/chapter
  const { data: subjectResources = [] } = useQuery({
    queryKey: ['subject-resources', selectedSubjectId, selectedChapterId],
    queryFn: async () => {
      if (!selectedSubjectId) return [];
      let query = supabase
        .from('subject_resources')
        .select('*')
        .eq('subject_id', selectedSubjectId);
      
      if (selectedChapterId) {
        query = query.eq('chapter_id', selectedChapterId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSubjectId
  });

  // Create or update college
  const upsertCollege = useMutation({
    mutationFn: async (college) => {
      if (editingCollege) {
        const { error } = await supabase
          .from('colleges')
          .update({ name: college.name, description: college.description, updated_at: new Date().toISOString() })
          .eq('id', editingCollege.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('colleges')
          .insert([{ name: college.name, description: college.description }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setDialogOpen(false);
      setEditingCollege(null);
      setNewCollege({ name: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
    }
  });

  // Delete college
  const deleteCollege = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('colleges')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
    }
  });

  // Upload note for college
  const uploadNote = useMutation({
    mutationFn: async () => {
      if (!noteFile || !selectedCollege) throw new Error('Select a college and file');
      const fileExt = noteFile.name.split('.').pop();
      const filePath = `college-notes/${selectedCollege.id}/${Date.now()}.${fileExt}`;
      setUploading(true);
      const { error: uploadError } = await supabase.storage
        .from('learn-verse-notes')
        .upload(filePath, noteFile, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from('learn-verse-notes')
        .getPublicUrl(filePath);
      const { error } = await supabase
        .from('subject_resources')
        .insert([{
          title: noteTitle,
          description: noteDescription,
          file_url: urlData.publicUrl,
          file_name: noteFile.name,
          file_size: noteFile.size,
          file_type: noteFile.type,
          resource_type: 'document',
          is_published: true,
          subject_id: null, // General college notes don't belong to a specific subject
          chapter_id: null
        }]);
      setUploading(false);
      if (error) throw error;
    },
    onSuccess: () => {
      setNoteFile(null);
      setNoteTitle('');
      setNoteDescription('');
      queryClient.invalidateQueries({ queryKey: ['college-notes', selectedCollege?.id] });
    }
  });

  // Fetch notes for selected college - using subject_resources
  const { data: collegeNotes = [] } = useQuery({
    queryKey: ['college-notes', selectedCollege?.id],
    queryFn: async () => {
      if (!selectedCollege) return [];
      // For now, we'll fetch all general notes (not tied to specific subjects)
      // In the future, you might want to add a college_id column to subject_resources
      const { data, error } = await supabase
        .from('subject_resources')
        .select('*')
        .is('subject_id', null)
        .is('chapter_id', null)
        .eq('resource_type', 'document')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCollege
  });

  const handleSubjectSuccess = () => {
    setSubjectDialogOpen(false);
    setEditingSubject(null);
    queryClient.invalidateQueries({ queryKey: ['college-subjects', selectedCollege?.id] });
  };

  const handleChapterSuccess = () => {
    setChapterDialogOpen(false);
    setEditingChapter(null);
    queryClient.invalidateQueries({ queryKey: ['subject-chapters', selectedSubjectId] });
  };

  const handleResourceSuccess = () => {
    setResourceDialogOpen(false);
    setEditingResource(null);
    queryClient.invalidateQueries({ queryKey: ['subject-resources', selectedSubjectId, selectedChapterId] });
  };

  const handleFolderUpload = async (files: FileList) => {
    if (!selectedSubjectId) return;
    setUploading(true);
    const promises: Promise<any>[] = [];
    for (const file of Array.from(files)) {
      const filePath = `subject-resources/${selectedSubjectId}/${Date.now()}-${file.name}`;
      const promise = supabase.storage
        .from('college_content')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
      promises.push(promise);
    }
    await Promise.all(promises);
    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ['subject-resources', selectedSubjectId] });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">College Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              {editingCollege ? 'Edit College' : 'Add College'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCollege ? 'Edit College' : 'Add New College'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">College Name</label>
                <Input
                  id="name"
                  placeholder="Enter college name"
                  value={newCollege.name}
                  onChange={e => setNewCollege({ ...newCollege, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  id="description"
                  placeholder="Enter description"
                  value={newCollege.description}
                  onChange={e => setNewCollege({ ...newCollege, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => upsertCollege.mutate(newCollege)}
                disabled={!newCollege.name.trim()}
                className="gradient-primary"
              >
                {editingCollege ? 'Update College' : 'Create College'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <div>Loading...</div>
        ) : colleges.length === 0 ? (
          <div>No colleges found.</div>
        ) : colleges.map(college => (
          <Card key={college.id} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {college.name}
              </CardTitle>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => { setEditingCollege(college); setNewCollege({ name: college.name, description: college.description }); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteCollege.mutate(college.id)}><Trash2 className="h-4 w-4" /></Button>
                <Button size="sm" onClick={() => setSelectedCollege(college)}>Manage Content</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-600 dark:text-gray-400 mb-2">{college.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCollege && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Content Management for {selectedCollege.name}</h2>
          
          <Tabs defaultValue="subjects" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="subjects" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Subjects
              </TabsTrigger>
              <TabsTrigger value="chapters" disabled={!selectedSubjectId} className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Chapters
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Notes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="subjects" className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Subjects</h3>
                <Button 
                  onClick={() => setSubjectDialogOpen(true)}
                  className="gradient-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subject
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collegeSubjects.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No subjects found. Create your first subject.
                  </div>
                ) : collegeSubjects.map(subject => (
                  <Card key={subject.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-base">{subject.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{subject.description}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedSubjectId(subject.id)}
                        >
                          Select
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingSubject(subject);
                            setSubjectDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedSubjectId(subject.id);
                            setResourceDialogOpen(true);
                          }}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Subject Resources Section */}
              {selectedSubjectId && (
                <div className="mt-8 border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">
                      Resources for {collegeSubjects.find(s => s.id === selectedSubjectId)?.title}
                    </h4>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setResourceDialogOpen(true)}
                        className="gradient-primary"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Resource
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          // Open folder upload dialog
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.setAttribute('webkitdirectory', 'true');
                          input.multiple = true;
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files) {
                              handleFolderUpload(files);
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Folder
                      </Button>
                    </div>
                  </div>

                  {/* Resource Upload Component */}
                  <div className="mb-6">
                    <CollegeResourceUpload 
                      subjectId={selectedSubjectId}
                      onResourceAdded={() => {
                        queryClient.invalidateQueries({ queryKey: ['subject-resources', selectedSubjectId, selectedChapterId] });
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectResources.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No resources found for this subject. Add your first resource.
                      </div>
                    ) : subjectResources.map(resource => (
                      <Card key={resource.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-base">{resource.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingResource(resource);
                                setResourceDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            {resource.file_url && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(resource.file_url, '_blank')}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                            {resource.external_url && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(resource.external_url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="chapters" className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
              {selectedSubjectId ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Chapters</h3>
                    <Button 
                      onClick={() => setChapterDialogOpen(true)}
                      className="gradient-primary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Chapter
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectChapters.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No chapters found. Create your first chapter.
                      </div>
                    ) : subjectChapters.map(chapter => (
                      <Card key={chapter.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-base">{chapter.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{chapter.description}</p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedChapterId(chapter.id)}
                            >
                              Select
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingChapter(chapter);
                                setChapterDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please select a subject first to manage chapters.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="resources" className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Resources</h3>
                <Button 
                  onClick={() => setResourceDialogOpen(true)}
                  className="gradient-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resource
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectResources.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No resources found. Create your first resource.
                  </div>
                ) : subjectResources.map(resource => (
                  <Card key={resource.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-base">{resource.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingResource(resource);
                            setResourceDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        {resource.file_url && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(resource.file_url, '_blank')}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-4">Notes for {selectedCollege.name}</h3>
              <div className="flex gap-4 mb-4">
                <Input type="file" onChange={e => setNoteFile(e.target.files?.[0] || null)} />
                <Input placeholder="Note Title" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} />
                <Input placeholder="Description (optional)" value={noteDescription} onChange={e => setNoteDescription(e.target.value)} />
                <Button onClick={() => uploadNote.mutate()} disabled={!noteFile || !noteTitle || uploading}>{uploading ? 'Uploading...' : 'Upload Note'}</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collegeNotes.length === 0 ? (
                  <div>No notes found for this college.</div>
                ) : collegeNotes.map(note => (
                  <Card key={note.id}>
                    <CardHeader>
                      <CardTitle>{note.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a href={note.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View/Download</a>
                      <div className="text-xs text-gray-500 mt-2">{note.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Subject Dialog */}
      <CollegeSubjectDialog
        open={subjectDialogOpen}
        onOpenChange={setSubjectDialogOpen}
        subject={editingSubject}
        collegeId={selectedCollege?.id}
        onSuccess={handleSubjectSuccess}
      />

      {/* Chapter Dialog */}
      <CollegeChapterDialog
        open={chapterDialogOpen}
        onOpenChange={setChapterDialogOpen}
        chapter={editingChapter}
        subjectId={selectedSubjectId}
        onSuccess={handleChapterSuccess}
      />

      {/* Resource Dialog */}
      <CollegeResourceDialog
        open={resourceDialogOpen}
        onOpenChange={setResourceDialogOpen}
        resource={editingResource}
        subjectId={selectedSubjectId}
        chapterId={selectedChapterId}
        onSuccess={handleResourceSuccess}
      />
    </div>
  );
};

export default CollegeManagement; 