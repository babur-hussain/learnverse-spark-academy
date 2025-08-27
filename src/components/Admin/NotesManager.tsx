
import React, { useState, useCallback, useEffect } from 'react';
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
import PDFLink from '@/components/UI/PDFLink';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Checkbox } from "@/components/UI/checkbox";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  Upload, 
  Download, 
  Eye,
  FileText
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatBytes } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';

interface Subject {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  subject_id: string;
  title: string;
}

interface Tag {
  id: string;
  name: string;
  type: string;
}

interface NoteTag {
  note_id: string;
  tag_id: string;
}

interface NoteFile {
  id: string;
  chapter_id: string | null;
  title: string;
  description: string | null;
  file_path: string;
  file_size: number;
  file_type: string;
  is_public: boolean | null;
  uploaded_by: string | null;
  view_count: number | null;
  download_count: number | null;
  created_at: string;
  updated_at: string;
}

interface NotesManagerProps {
  selectedSubject: string | null;
  selectedChapter: string | null;
  onSelectSubject: (subjectId: string | null) => void;
  onSelectChapter: (chapterId: string | null) => void;
}

const NotesManager: React.FC<NotesManagerProps> = ({ 
  selectedSubject, 
  selectedChapter,
  onSelectSubject,
  onSelectChapter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    chapter_id: selectedChapter || '',
    file: null as File | null,
    is_public: false
  });
  const [editingNote, setEditingNote] = useState<NoteFile | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, title')
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

  const { data: chapters = [] } = useQuery({
    queryKey: ['chapters', selectedSubject],
    queryFn: async () => {
      let query = supabase
        .from('chapters')
        .select('id, subject_id, title');
      
      if (selectedSubject) {
        query = query.eq('subject_id', selectedSubject);
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast({
          title: 'Error fetching chapters',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data as Chapter[];
    },
    enabled: !!selectedSubject
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: 'Error fetching tags',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data as Tag[];
    }
  });

  const { data: noteTags = [] } = useQuery({
    queryKey: ['note_tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('note_tags')
        .select('*');
      
      if (error) {
        toast({
          title: 'Error fetching note tags',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data as NoteTag[];
    }
  });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', selectedChapter],
    queryFn: async () => {
      let query = supabase
        .from('note_files')
        .select('*')
        .order('title');
      
      if (selectedChapter) {
        query = query.eq('chapter_id', selectedChapter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast({
          title: 'Error fetching notes',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data as NoteFile[];
    },
    enabled: !!selectedChapter
  });

  const createNote = useMutation({
    mutationFn: async (note: {
      title: string;
      description: string;
      chapter_id: string;
      file: File | null;
      is_public: boolean;
    }) => {
      if (!note.file) {
        throw new Error('Please select a file to upload.');
      }
      
      if (!user) {
        throw new Error('You must be logged in to upload files');
      }

      const fileExt = note.file.name.split('.').pop();
      const filePath = `notes/${uuidv4()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('learn-verse-notes')
        .upload(filePath, note.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('learn-verse-notes')
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('note_files')
        .insert([{
          chapter_id: note.chapter_id,
          title: note.title,
          description: note.description || null,
          file_path: urlData.publicUrl,
          file_size: note.file.size,
          file_type: note.file.type,
          is_public: note.is_public,
          uploaded_by: user.id,
          view_count: 0,
          download_count: 0
        }])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: async (data) => {
      toast({
        title: 'Note created',
        description: 'The note has been created successfully.'
      });

      if (selectedTags.length > 0) {
        const noteId = data.id;
        const noteTagInserts = selectedTags.map(tagId => ({
          note_id: noteId,
          tag_id: tagId
        }));

        const { error: noteTagsError } = await supabase
          .from('note_tags')
          .insert(noteTagInserts);

        if (noteTagsError) {
          toast({
            title: 'Error assigning tags',
            description: noteTagsError.message,
            variant: 'destructive'
          });
        }
      }

      setNewNote({ 
        title: '', 
        description: '', 
        chapter_id: data.chapter_id, 
        file: null,
        is_public: false
      });
      setSelectedTags([]);
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note_tags'] });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating note',
        description: error.message,
        variant: 'destructive'
      });
      setUploadProgress(0);
    }
  });

  const updateNote = useMutation({
    mutationFn: async (note: NoteFile) => {
      const { data, error } = await supabase
        .from('note_files')
        .update({
          title: note.title,
          description: note.description,
          is_public: note.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id)
        .select()
        .single();
      
      if (error) {
        toast({
          title: 'Error updating note',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: async (data) => {
      toast({
        title: 'Note updated',
        description: 'The note has been updated successfully.'
      });

      const noteId = data.id;

      const { error: deleteError } = await supabase
        .from('note_tags')
        .delete()
        .eq('note_id', noteId);

      if (deleteError) {
        toast({
          title: 'Error removing existing tags',
          description: deleteError.message,
          variant: 'destructive'
        });
      } else {
        if (selectedTags.length > 0) {
          const noteTagInserts = selectedTags.map(tagId => ({
            note_id: noteId,
            tag_id: tagId
          }));

          const { error: noteTagsError } = await supabase
            .from('note_tags')
            .insert(noteTagInserts);

          if (noteTagsError) {
            toast({
              title: 'Error assigning tags',
              description: noteTagsError.message,
              variant: 'destructive'
            });
          }
        }
      }

      setEditingNote(null);
      setSelectedTags([]);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note_tags'] });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating note',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('note_files')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast({
          title: 'Error deleting note',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      toast({
        title: 'Note deleted',
        description: 'The note has been deleted successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  const filteredNotes = notes.filter(
    note => note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (note.description && note.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateOrUpdate = () => {
    if (editingNote) {
      updateNote.mutate({
        ...editingNote,
        title: newNote.title,
        description: newNote.description,
        is_public: newNote.is_public
      });
    } else {
      createNote.mutate({
        ...newNote,
        chapter_id: selectedChapter || '',
      });
    }
  };

  const handleEditNote = (note: NoteFile) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      description: note.description || '',
      chapter_id: note.chapter_id || '',
      file: null,
      is_public: note.is_public || false
    });

    const selectedNoteTags = noteTags.filter(nt => nt.note_id === note.id).map(nt => nt.tag_id);
    setSelectedTags(selectedNoteTags);

    setDialogOpen(true);
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      setEditingNote(null);
      setNewNote({ 
        title: '', 
        description: '', 
        chapter_id: selectedChapter || '', 
        file: null,
        is_public: false
      });
      setSelectedTags([]);
      setUploadProgress(0);
    }
    setDialogOpen(open);
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote.mutate(noteId);
    }
  };

  const handleDownloadNote = async (note: NoteFile) => {
    try {
      const response = await fetch(note.file_path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = note.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      await supabase.functions.invoke('increment_note_download_count', {
        body: { note_id: note.id }
      });
    } catch (error) {
      toast({
        title: 'Error downloading note',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  };

  const getSubjectTitle = (subjectId: string): string => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.title : 'Unknown Subject';
  };

  const getChapterTitle = (chapterId: string): string => {
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter ? chapter.title : 'Unknown Chapter';
  };

  React.useEffect(() => {
    if (selectedChapter && !editingNote) {
      setNewNote(prev => ({ ...prev, chapter_id: selectedChapter }));
    }
  }, [selectedChapter, editingNote]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-semibold">Manage Notes</h2>
          {selectedSubject && selectedChapter ? (
            <p className="text-sm text-muted-foreground">
              Filtered by subject: {getSubjectTitle(selectedSubject)}, chapter: {getChapterTitle(selectedChapter)}
              <Button 
                variant="link" 
                className="p-0 h-auto ml-1"
                onClick={() => onSelectChapter(null)}
              >
                (Clear Chapter)
              </Button>
            </p>
          ) : selectedSubject ? (
            <p className="text-sm text-muted-foreground">
              Filtered by subject: {getSubjectTitle(selectedSubject)}
              <Button 
                variant="link" 
                className="p-0 h-auto ml-1"
                onClick={() => onSelectSubject(null)}
              >
                (Clear Subject)
              </Button>
            </p>
          ) : null}
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                {editingNote ? 'Edit Note' : 'Add Note'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingNote ? 'Edit Note' : 'Add New Note'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {!selectedSubject && (
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Select
                      value={subjects.find(subject => chapters.find(chapter => chapter.id === newNote.chapter_id)?.subject_id === subject.id)?.id || ''}
                      onValueChange={(subjectId) => {
                        setNewNote({ ...newNote, chapter_id: '' });
                        onSelectSubject(subjectId);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!selectedChapter && (
                  <div className="space-y-2">
                    <label htmlFor="chapter" className="text-sm font-medium">Chapter</label>
                    <Select
                      value={newNote.chapter_id}
                      onValueChange={(value) => setNewNote({ ...newNote, chapter_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.id}>
                            {chapter.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Note Title</label>
                  <Input
                    id="title"
                    placeholder="Enter note title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    id="description"
                    placeholder="Enter note description"
                    value={newNote.description}
                    onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTags([...selectedTags, tag.id]);
                            } else {
                              setSelectedTags(selectedTags.filter(tagId => tagId !== tag.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`tag-${tag.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {tag.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {!editingNote && (
                  <div className="space-y-2">
                    <label htmlFor="file" className="text-sm font-medium">Upload File</label>
                    <Input
                      type="file"
                      id="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setNewNote({ ...newNote, file: e.target.files[0] });
                        }
                      }}
                    />
                    {newNote.file && (
                      <p className="text-sm text-muted-foreground">
                        Selected file: {newNote.file.name} ({formatBytes(newNote.file.size)})
                      </p>
                    )}
                    {uploadProgress > 0 && (
                      <progress value={uploadProgress} max="100" />
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isPublic"
                    checked={newNote.is_public}
                    onCheckedChange={(checked) => setNewNote({ ...newNote, is_public: !!checked })}
                  />
                  <label
                    htmlFor="isPublic"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Make this note public
                  </label>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleCreateOrUpdate}
                  disabled={!newNote.title.trim() || (!editingNote && !newNote.file) || (!selectedChapter && !newNote.chapter_id)}
                  className="gradient-primary"
                >
                  {editingNote ? 'Update Note' : 'Create Note'}
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
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-8">
          {searchQuery ? (
            <p className="text-muted-foreground">No notes matching your search</p>
          ) : selectedChapter ? (
            <p className="text-muted-foreground">No notes found for this chapter. Add your first note to get started.</p>
          ) : selectedSubject ? (
            <p className="text-muted-foreground">No notes found for this subject. Select a chapter or add a new note to get started.</p>
          ) : (
            <p className="text-muted-foreground">No notes found. Select a subject/chapter or add a new note to get started.</p>
          )}
        </div>
      ) : (
        <Table>
          <TableCaption>List of notes</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNotes.map((note) => (
              <TableRow key={note.id}>
                <TableCell className="font-medium">{note.title}</TableCell>
                <TableCell>
                  {note.is_public ? (
                    <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Public
                    </div>
                  ) : (
                    <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-slate-100">
                      Private
                    </div>
                  )}
                </TableCell>
                <TableCell>{new Date(note.updated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {note.file_path && note.file_path.toLowerCase().includes('.pdf') ? (
                      <PDFLink 
                        url={note.file_path}
                        title={note.title}
                        variant="button"
                        showDownloadButton={true}
                      />
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(note.file_path, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadNote(note)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditNote(note)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteNote(note.id)}
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

export default NotesManager;
