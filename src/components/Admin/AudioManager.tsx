import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Pencil, Trash2, Plus, Upload, Download, Headphones } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatBytes } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';

interface Course {
  id: string;
  title: string;
}

interface AudioFile {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_size: number;
  file_type: string;
  is_public: boolean | null;
  uploaded_by: string | null;
  duration: string | null;
  created_at: string;
  updated_at: string;
}

interface AudioManagerProps {
  selectedCourse: string | null;
  onSelectCourse: (courseId: string | null) => void;
}

interface Class {
  id: string;
  name: string;
}

interface College {
  id: string;
  name: string;
}

const AudioManager: React.FC<AudioManagerProps> = ({ selectedCourse, onSelectCourse }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newAudio, setNewAudio] = useState({
    title: '',
    description: '',
    course_id: selectedCourse || '',
    file: null as File | null,
    is_public: false,
    class_id: '',
    college_id: ''
  });
  const [editingAudio, setEditingAudio] = useState<AudioFile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ['courses', newAudio.class_id, newAudio.college_id],
    queryFn: async () => {
      if (newAudio.class_id) {
        const { data, error } = await supabase
          .from('class_subjects')
          .select('subject_id, subjects(id, title)')
          .eq('class_id', newAudio.class_id);
        if (error) throw error;
        return (data || []).map(cs => cs.subjects);
      } else if (newAudio.college_id) {
        const { data, error } = await supabase
          .from('college_courses')
          .select('course_id, courses(id, title)')
          .eq('college_id', newAudio.college_id);
        if (error) throw error;
        return (data || []).map(cc => cc.courses);
      }
      return [];
    },
    enabled: !!newAudio.class_id || !!newAudio.college_id
  });

  // Fetch audio files
  const { data: audioFiles = [], isLoading } = useQuery({
    queryKey: ['audio_files', selectedCourse],
    queryFn: async () => {
      let query = supabase
        .from('audio_files')
        .select('*')
        .order('title');
      if (selectedCourse) {
        query = query.eq('course_id', selectedCourse);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as AudioFile[];
    },
    enabled: !!selectedCourse
  });

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as Class[];
    }
  });

  // Fetch colleges
  const { data: colleges = [] } = useQuery({
    queryKey: ['colleges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colleges')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as College[];
    }
  });

  // Create audio file
  const createAudio = useMutation({
    mutationFn: async (audio: {
      title: string;
      description: string;
      course_id: string;
      file: File | null;
      is_public: boolean;
      class_id: string;
      college_id: string;
    }) => {
      if (!audio.file) throw new Error('Please select an audio file to upload.');
      if (!user) throw new Error('You must be logged in to upload files');
      const fileExt = audio.file.name.split('.').pop();
      const filePath = `audio/${uuidv4()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('learn-verse-audio')
        .upload(filePath, audio.file, {
          cacheControl: '3600',
          upsert: false
        });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from('learn-verse-audio')
        .getPublicUrl(filePath);
      const { data, error } = await supabase
        .from('audio_files')
        .insert([{
          course_id: audio.course_id,
          title: audio.title,
          description: audio.description || null,
          file_path: urlData.publicUrl,
          file_size: audio.file.size,
          file_type: audio.file.type,
          is_public: audio.is_public,
          uploaded_by: user.id,
          duration: null,
          class_id: audio.class_id,
          college_id: audio.college_id,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Audio uploaded', description: 'The audio file has been uploaded successfully.' });
      setNewAudio({ title: '', description: '', course_id: selectedCourse || '', file: null, is_public: false, class_id: '', college_id: '' });
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ['audio_files'] });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error uploading audio', description: error.message, variant: 'destructive' });
      setUploadProgress(0);
    }
  });

  // Update audio file
  const updateAudio = useMutation({
    mutationFn: async (audio: AudioFile) => {
      const { data, error } = await supabase
        .from('audio_files')
        .update({
          title: audio.title,
          description: audio.description,
          is_public: audio.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', audio.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Audio updated', description: 'The audio file has been updated successfully.' });
      setEditingAudio(null);
      queryClient.invalidateQueries({ queryKey: ['audio_files'] });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating audio', description: error.message, variant: 'destructive' });
    }
  });

  // Delete audio file
  const deleteAudio = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('audio_files')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast({ title: 'Audio deleted', description: 'The audio file has been deleted successfully.' });
      queryClient.invalidateQueries({ queryKey: ['audio_files'] });
    }
  });

  const filteredAudio = audioFiles.filter(
    audio => audio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (audio.description && audio.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateOrUpdate = () => {
    if (editingAudio) {
      updateAudio.mutate({ ...editingAudio, title: newAudio.title, description: newAudio.description, is_public: newAudio.is_public });
    } else {
      createAudio.mutate({ ...newAudio, course_id: selectedCourse || '', class_id: newAudio.class_id, college_id: newAudio.college_id });
    }
  };

  const handleEditAudio = (audio: AudioFile) => {
    setEditingAudio(audio);
    setNewAudio({
      title: audio.title,
      description: audio.description || '',
      course_id: audio.course_id || '',
      file: null,
      is_public: audio.is_public || false,
      class_id: audio.class_id || '',
      college_id: audio.college_id || ''
    });
    setDialogOpen(true);
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      setEditingAudio(null);
      setNewAudio({ title: '', description: '', course_id: selectedCourse || '', file: null, is_public: false, class_id: '', college_id: '' });
      setUploadProgress(0);
    }
    setDialogOpen(open);
  };

  const handleDeleteAudio = (audioId: string) => {
    if (confirm('Are you sure you want to delete this audio file?')) {
      deleteAudio.mutate(audioId);
    }
  };

  const handleDownloadAudio = async (audio: AudioFile) => {
    try {
      const response = await fetch(audio.file_path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = audio.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: 'Error downloading audio', description: (error as Error).message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-semibold">Manage Audio Files</h2>
          {selectedCourse && (
            <p className="text-sm text-muted-foreground">
              Filtered by course: {courses.find(c => c.id === selectedCourse)?.title || 'Unknown Course'}
              <Button variant="link" className="p-0 h-auto ml-1" onClick={() => onSelectCourse(null)}>
                (Clear Course)
              </Button>
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search audio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                {editingAudio ? 'Edit Audio' : 'Add Audio'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAudio ? 'Edit Audio' : 'Add New Audio'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="class" className="text-sm font-medium">Class</label>
                  <Select
                    value={newAudio.class_id || ''}
                    onValueChange={value => setNewAudio({ ...newAudio, class_id: value, college_id: '', course_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="college" className="text-sm font-medium">College</label>
                  <Select
                    value={newAudio.college_id || ''}
                    onValueChange={value => setNewAudio({ ...newAudio, college_id: value, class_id: '', course_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map(college => (
                        <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="course" className="text-sm font-medium">Course (optional)</label>
                  <Select
                    value={newAudio.course_id || ''}
                    onValueChange={value => setNewAudio({ ...newAudio, course_id: value })}
                    disabled={!newAudio.class_id && !newAudio.college_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Audio Title</label>
                  <Input
                    id="title"
                    placeholder="Enter audio title"
                    value={newAudio.title}
                    onChange={(e) => setNewAudio({ ...newAudio, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    id="description"
                    placeholder="Enter audio description"
                    value={newAudio.description}
                    onChange={(e) => setNewAudio({ ...newAudio, description: e.target.value })}
                    rows={4}
                  />
                </div>
                {!editingAudio && (
                  <div className="space-y-2">
                    <label htmlFor="file" className="text-sm font-medium">Upload Audio File (MP3)</label>
                    <Input
                      type="file"
                      id="file"
                      accept="audio/mp3,audio/mpeg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setNewAudio({ ...newAudio, file: e.target.files[0] });
                        }
                      }}
                    />
                    {newAudio.file && (
                      <p className="text-sm text-muted-foreground">
                        Selected file: {newAudio.file.name} ({formatBytes(newAudio.file.size)})
                      </p>
                    )}
                    {uploadProgress > 0 && (
                      <progress value={uploadProgress} max="100" />
                    )}
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    id="isPublic"
                    checked={newAudio.is_public}
                    onChange={(e) => setNewAudio({ ...newAudio, is_public: e.target.checked })}
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium">Make this audio public</label>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleCreateOrUpdate}
                  disabled={!newAudio.title.trim() || (!editingAudio && !newAudio.file) || (!selectedCourse && !newAudio.course_id) || (!newAudio.class_id && !newAudio.college_id)}
                  className="gradient-primary"
                >
                  {editingAudio ? 'Update Audio' : 'Create Audio'}
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
      ) : filteredAudio.length === 0 ? (
        <div className="text-center py-8">
          {searchQuery ? (
            <p className="text-muted-foreground">No audio matching your search</p>
          ) : selectedCourse ? (
            <p className="text-muted-foreground">No audio found for this course. Add your first audio file to get started.</p>
          ) : (
            <p className="text-muted-foreground">No audio found. Select a course or add a new audio file to get started.</p>
          )}
        </div>
      ) : (
        <Table>
          <TableCaption>List of audio files</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAudio.map((audio) => (
              <TableRow key={audio.id}>
                <TableCell className="font-medium">{audio.title}</TableCell>
                <TableCell>
                  {audio.is_public ? (
                    <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Public</div>
                  ) : (
                    <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-slate-100">Private</div>
                  )}
                </TableCell>
                <TableCell>{new Date(audio.updated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => window.open(audio.file_path, '_blank')}><Headphones className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownloadAudio(audio)}><Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditAudio(audio)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAudio(audio.id)}><Trash2 className="h-4 w-4" /></Button>
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

export default AudioManager; 