import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/UI/dialog';
import { Plus, Pencil, Trash2, Upload, Download } from 'lucide-react';

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
        .from('note_files')
        .insert([{
          title: noteTitle,
          description: noteDescription,
          file_path: urlData.publicUrl,
          file_size: noteFile.size,
          file_type: noteFile.type,
          is_public: true,
          uploaded_by: null,
          view_count: 0,
          download_count: 0,
          college_id: selectedCollege.id
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

  // Fetch notes for selected college
  const { data: collegeNotes = [] } = useQuery({
    queryKey: ['college-notes', selectedCollege?.id],
    queryFn: async () => {
      if (!selectedCollege) return [];
      const { data, error } = await supabase
        .from('note_files')
        .select('*')
        .eq('college_id', selectedCollege.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCollege
  });

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
                <Button size="sm" onClick={() => setSelectedCollege(college)}>Manage Notes</Button>
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
          <h2 className="text-xl font-semibold mb-4">Notes for {selectedCollege.name}</h2>
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
        </div>
      )}
    </div>
  );
};

export default CollegeManagement; 